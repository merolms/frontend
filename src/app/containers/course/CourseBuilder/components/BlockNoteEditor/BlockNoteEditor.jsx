import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { uploadBlockMedia } from '@/app/services/blockService';
import './BlockNoteEditor.scss';

const PARA_PROPS = {
  textAlignment: 'left',
  backgroundColor: 'default',
  textColor: 'default',
};

const toInlineContent = (content) => {
  if (!content) return [];

  if (Array.isArray(content)) {
    return content
      .filter((c) => c && c.type)
      .map((c) =>
        c.type === 'text'
          ? { type: 'text', text: c.text || '', styles: c.styles || {} }
          : c
      );
  }

  if (typeof content === 'string' && content.trim()) {
    return [{ type: 'text', text: content, styles: {} }];
  }

  if (typeof content === 'object' && content.text) {
    return [{ type: 'text', text: content.text, styles: content.styles || {} }];
  }

  return [];
};

const sanitizeBlocks = (content) => {
  if (!content) return [];

  let parsed;

  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    if (typeof content === 'string' && content.trim()) {
      return [
        {
          type: 'paragraph',
          props: { ...PARA_PROPS },
          content: [{ type: 'text', text: content, styles: {} }],
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
      children: Array.isArray(b.children)
        ? sanitizeBlocks(b.children)
        : [],
    }));
};

const countWords = (blocks) => {
  let n = 0;

  const walk = (bs) => {
    for (const b of bs) {
      if (Array.isArray(b.content)) {
        for (const c of b.content) {
          if (c.type === 'text' && c.text) {
            n += c.text.trim().split(/\s+/).filter(Boolean).length;
          }
        }
      }
      if (Array.isArray(b.children)) walk(b.children);
    }
  };

  walk(blocks);
  return n;
};

const BlockNoteEditorComponent = ({
  lessonId,
  contentRef,
  onChange,
  onSave,
  onStatsChange,
}) => {
  const changeTimer = useRef(null);

  // 🚨 prevents cursor reset during sync
  const isTyping = useRef(false);
  const isSyncing = useRef(false);

  const [words, setWords] = useState(0);
  const [ready, setReady] = useState(false);

  const notifyChange = useCallback(
    (doc) => {
      if (isSyncing.current) return;
      const wc = countWords(doc);
      const json = JSON.stringify(doc);
      setWords(wc);
      contentRef.current = json;
      onStatsChange?.({ words: wc });
      onChange?.(json);
    },
    [onChange, onStatsChange, contentRef]
  );

  // Track what content we already loaded to avoid re-processing
  const loadedContent = useRef(null);

  const uploadFile = useCallback(
    async (file) =>
      uploadBlockMedia(lessonId, `temp_${Date.now()}`, file),
    [lessonId]
  );

  const editor = useCreateBlockNote({ uploadFile });

  // Listen to editor changes directly (fires on every block doc mutation)
  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onChange(() => {
      isTyping.current = true;
      clearTimeout(changeTimer.current);

      changeTimer.current = setTimeout(() => {
        try {
          notifyChange(editor.document);
        } finally {
          isTyping.current = false;
        }
      }, 500);
    });

    return unsubscribe;
  }, [editor, notifyChange]);

  // Set up ready after editor is created
  useEffect(() => {
    if (editor) setReady(true);
  }, [editor]);

  // Lesson switch: sync editor from external content (NOT from editor's own onChange output)
  useEffect(() => {
    if (!editor || !ready) return;
    if (isTyping.current) return;

    // Read from ref (parent sets this on lesson load)
    const raw = contentRef.current;

    // Skip if we've already loaded this exact content string
    if (loadedContent.current === raw) return;
    loadedContent.current = raw;

    const blocks = sanitizeBlocks(raw);
    const current = JSON.stringify(editor.document);
    const next = JSON.stringify(blocks);
    if (current === next) return;

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
      console.error('Sync failed:', e);
    }
    isSyncing.current = false;
  }, [lessonId, editor, ready]);

  useEffect(() => {
    return () => clearTimeout(changeTimer.current);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave]);

  if (!editor) return null;

  return (
    <div >
      <BlockNoteView
        editor={editor}
        theme="light"
      />

      <div className="bn-statusbar">
        <span className="bn-statusbar-stat">
          {words} {words === 1 ? 'word' : 'words'}
        </span>

        <span className="bn-statusbar-dot">·</span>

        <span className="bn-statusbar-stat">
          ~{Math.max(1, Math.ceil(words / 200))} min read
        </span>

        <span className="bn-statusbar-hint">
          Type <kbd>/</kbd> for blocks &nbsp;·&nbsp; <kbd>⌘S</kbd> to save
        </span>
      </div>
    </div>
  );
};

export default BlockNoteEditorComponent;