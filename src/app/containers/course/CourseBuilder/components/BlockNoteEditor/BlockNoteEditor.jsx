import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCallback, useEffect, useRef, useState } from "react";

import { uploadBlockMedia } from "@/app/services/blockService";
import { t } from "@/styles/theme";

import { ArrowConversionExtension } from "./extensions/ArrowConversionExtension";
import { YoutubeNode } from "./extensions/YoutubeExtension";

const PARA_PROPS = {
  textAlignment: "left",
  backgroundColor: "default",
  textColor: "default",
};

const toInlineContent = (content) => {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content
      .filter((c) => c && c.type)
      .map((c) =>
        c.type === "text" ? { type: "text", text: c.text || "", styles: c.styles || {} } : c
      );
  }
  if (typeof content === "string" && content.trim()) {
    return [{ type: "text", text: content, styles: {} }];
  }
  if (typeof content === "object" && content.text) {
    return [{ type: "text", text: content.text, styles: content.styles || {} }];
  }
  return [];
};

const sanitizeBlocks = (content) => {
  if (!content) return [];
  let parsed;
  try {
    parsed = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    if (typeof content === "string" && content.trim()) {
      return [
        {
          type: "paragraph",
          props: { ...PARA_PROPS },
          content: [{ type: "text", text: content, styles: {} }],
          children: [],
        },
      ];
    }
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((b) => b && b.type)
    .map((b) => ({
      type: b.type,
      props: b.props || { ...PARA_PROPS },
      content: toInlineContent(b.content),
      children: Array.isArray(b.children) ? sanitizeBlocks(b.children) : [],
    }));
};

const countWords = (blocks) => {
  let n = 0;
  const walk = (bs) => {
    for (const b of bs) {
      if (Array.isArray(b.content)) {
        for (const c of b.content) {
          if (c.type === "text" && c.text) n += c.text.trim().split(/\s+/).filter(Boolean).length;
        }
      }
      if (Array.isArray(b.children)) walk(b.children);
    }
  };
  walk(blocks);
  return n;
};

const resolveTheme = () => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
};

// ─── Helpers ───────────────────────────────────────────────────────

const getYoutubeVideoId = (url) => {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const isValidYoutubeUrl = (url) => {
  if (!url) return false;
  return getYoutubeVideoId(url) !== null;
};

// ─── BlockNoteEditor ───────────────────────────────────────────────

const BlockNoteEditorComponent = ({
  lessonId,
  content,
  contentRef,
  onChange,
  onSave,
  onStatsChange,
  theme,
}) => {
  const [effectiveTheme, setEffectiveTheme] = useState(resolveTheme());
  const isSyncing = useRef(false);
  const [words, setWords] = useState(0);
  const [ready, setReady] = useState(false);
  const [pasteError, setPasteError] = useState(false);
  const loadedContent = useRef(null);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);

  const uploadFile = useCallback(
    async (file) => uploadBlockMedia(lessonId, `temp_${Date.now()}`, file),
    [lessonId]
  );

  const editor = useCreateBlockNote(
    {
      uploadFile,
      _tiptapOptions: {
        extensions: [
          ArrowConversionExtension,
          YoutubeNode.configure({
            addPasteHandler: true,
            allowFullscreen: true,
            autoplay: false,
            controls: true,
            width: 640,
            height: 360,
          }),
        ],
      },
    },
    []
  );

  // Keep effectiveTheme in sync
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setEffectiveTheme(resolveTheme());
    const observer = new MutationObserver(handler);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    mq.addEventListener("change", handler);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", handler);
    };
  }, []);

  useEffect(() => {
    if (editor) setReady(true);
  }, [editor]);

  const handleChange = useCallback(() => {
    if (isSyncing.current) return;
    if (pasteError) return;
    try {
      const doc = editor.document;
      const wc = countWords(doc);
      const json = JSON.stringify(doc);
      setWords(wc);
      contentRef.current = json;
      onStatsChange?.({ words: wc });
      onChange?.(json);
    } catch (e) {
      console.error("handleChange error:", e);
    }
  }, [editor, onChange, onStatsChange, contentRef, pasteError]);

  useEffect(() => {
    if (!editor || !ready) return;
    const raw = contentRef.current || content || "";
    if (loadedContent.current === raw) return;
    loadedContent.current = raw;
    const blocks = sanitizeBlocks(raw);
    if (JSON.stringify(editor.document) === JSON.stringify(blocks)) return;
    isSyncing.current = true;
    try {
      if (blocks.length > 0) {
        editor.replaceBlocks(editor.document, blocks);
        setWords(countWords(blocks));
      } else {
        editor.replaceBlocks(editor.document, []);
        setWords(0);
      }
    } catch (e) {
      console.error("Sync failed:", e);
    }
    isSyncing.current = false;
  }, [lessonId, editor, ready, content]);

  useEffect(() => {
    const onError = (event) => {
      if (
        event.error instanceof RangeError &&
        event.error.message.includes("Invalid array length")
      ) {
        console.warn("Caught paste error, suppressing re-throw");
        event.preventDefault();
        setPasteError(true);
        setTimeout(() => setPasteError(false), 100);
      }
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave]);

  // ─── YouTube insertion ──────────────────────────────────────────
  const handleInsertYoutube = useCallback(
    (url) => {
      if (!editor?._tiptapEditor) return;
      const videoId = getYoutubeVideoId(url);
      if (!videoId) return;
      const normalizedSrc = `https://www.youtube.com/watch?v=${videoId}`;
      const tiptapEditor = editor._tiptapEditor;

      // Focus the editor first
      tiptapEditor.commands.focus();

      // Use the youtube command if available
      if (tiptapEditor.commands.setYoutubeVideo) {
        tiptapEditor.commands.setYoutubeVideo({ src: normalizedSrc });
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div>
      {/* Custom toolbar with YouTube button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
          borderBottom: `1px solid ${t("border-primary")}`,
          background: t("surface-secondary"),
        }}
      >
        <button
          type="button"
          onClick={() => setShowYoutubeDialog(true)}
          title="Insert YouTube Video"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "4px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#EF4444",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t("surface-hover"))}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </button>
        <div style={{ width: "1px", height: "20px", background: t("border-primary") }} />
        <span style={{ fontSize: "11px", color: t("text-muted"), marginLeft: "4px" }}>
          Paste YouTube URL or use the button to embed a video
        </span>
      </div>

      <BlockNoteView editor={editor} theme={theme} onChange={handleChange} />

      {/* Status bar */}
      <div
        className="bn-statusbar"
        style={{
          borderTop: `1px solid ${t("border-primary")}`,
          background: t("surface-secondary"),
          color: t("text-secondary"),
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: t("text-primary"), fontWeight: 600 }}>
            {words.toLocaleString()} {words === 1 ? "word" : "words"}
          </span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>~{Math.max(1, Math.ceil(words / 200))} min read</span>
        </div>
      </div>

      {/* YouTube URL Dialog */}
      {showYoutubeDialog && (
        <YoutubeUrlDialog
          onInsert={(url) => {
            handleInsertYoutube(url);
            setShowYoutubeDialog(false);
          }}
          onClose={() => setShowYoutubeDialog(false)}
        />
      )}
    </div>
  );
};

// ─── YouTube URL Dialog ────────────────────────────────────────────

function YoutubeUrlDialog({ onInsert, onClose }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube URL");
      return;
    }
    if (!isValidYoutubeUrl(trimmed)) {
      setError("Invalid YouTube URL or video ID");
      return;
    }
    onInsert(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-bg-surface border-border mx-4 w-full max-w-md rounded-xl border p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <h3 className="text-text-primary text-base font-semibold">Insert YouTube Video</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-text-primary text-xs font-medium">YouTube URL or Video ID</label>
            <input
              autoFocus
              type="text"
              placeholder="https://www.youtube.com/watch?v=... or video ID"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") onClose();
              }}
              className={`border-border bg-bg-surface text-text-primary mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <p className="text-text-muted text-xs">
            Paste a YouTube URL (youtube.com/watch?v=..., youtu.be/...) or just the 11-character video ID.
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-border text-text-secondary hover:bg-bg-surface-hover rounded-md border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary-hover rounded-md px-3 py-1.5 text-sm text-white"
          >
            Insert Video
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockNoteEditorComponent;
