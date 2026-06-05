import { NodeViewWrapper } from "@tiptap/react";
import DOMPurify from "dompurify";
import {
  AlignCenter,
  Code,
  ExternalLink,
  GripHorizontal,
  GripVertical,
  Link as LinkIcon,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useEditorProvider } from "@/contexts/EditorContext";
import { cn } from "../../../lib/utils";

const SCRIPT_BASED_EMBEDS = {
  twitter: { src: "https://platform.twitter.com/widgets.js", identifier: "twitter-tweet" },
  instagram: { src: "https://www.instagram.com/embed.js", identifier: "instagram-media" },
  tiktok: { src: "https://www.tiktok.com/embed.js", identifier: "tiktok-embed" },
};

const getYouTubeEmbedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const isYoutube = ["youtube.com", "www.youtube.com", "youtu.be", "www.youtu.be"].includes(
      parsedUrl.hostname
    );
    if (!isYoutube) return url;
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
    );
    if (match && match[1] && match[1].length === 11) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
    }
    return url;
  } catch {
    return url;
  }
};

const MemoizedEmbed = React.memo(({ embedUrl, sanitizedEmbedCode, embedType }) => {
  useEffect(() => {
    if (embedType === "code" && sanitizedEmbedCode) {
      const matchingPlatform = Object.entries(SCRIPT_BASED_EMBEDS).find(([_, config]) =>
        sanitizedEmbedCode.includes(config.identifier)
      );
      if (matchingPlatform) {
        const [_, config] = matchingPlatform;
        const script = document.createElement("script");
        script.src = config.src;
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
      }
    }
  }, [embedType, sanitizedEmbedCode]);

  if (embedType === "url" && embedUrl) {
    let isYoutube = false;
    try {
      const url = new URL(embedUrl);
      isYoutube = ["youtube.com", "www.youtube.com", "youtu.be", "www.youtu.be"].includes(
        url.hostname
      );
    } catch {}
    const processedUrl = isYoutube ? getYouTubeEmbedUrl(embedUrl) : embedUrl;
    return (
      <iframe
        src={processedUrl}
        className="h-full w-full rounded-lg"
        frameBorder="0"
        allowFullScreen
      />
    );
  }
  if (embedType === "code" && sanitizedEmbedCode) {
    return (
      <div dangerouslySetInnerHTML={{ __html: sanitizedEmbedCode }} className="h-full w-full" />
    );
  }
  return null;
});
MemoizedEmbed.displayName = "MemoizedEmbed";

const SUPPORTED_PRODUCTS = [
  { name: "YouTube", color: "#FF0000" },
  { name: "GitHub", color: "#181717" },
  { name: "Replit", color: "#F26207" },
  { name: "Spotify", color: "#1DB954" },
  { name: "Loom", color: "#625DF5" },
  { name: "GMaps", color: "#4285F4" },
  { name: "CodePen", color: "#000000" },
  { name: "Canva", color: "#00C4CC" },
  { name: "Notion", color: "#878787" },
  { name: "G Docs", color: "#4285F4" },
  { name: "Figma", color: "#F24E1E" },
  { name: "Giphy", color: "#FF6666" },
];

function EmbedObjectsComponent(props) {
  const [embedType, setEmbedType] = useState(props.node.attrs.embedType || "url");
  const [embedUrl, setEmbedUrl] = useState(props.node.attrs.embedUrl || "");
  const [embedCode, setEmbedCode] = useState(props.node.attrs.embedCode || "");
  const [embedHeight, setEmbedHeight] = useState(props.node.attrs.embedHeight || 300);
  const [embedWidth, setEmbedWidth] = useState(props.node.attrs.embedWidth || "100%");
  const [alignment, setAlignment] = useState(props.node.attrs.alignment || "left");
  const [isResizing, setIsResizing] = useState(false);
  const [sanitizedEmbedCode, setSanitizedEmbedCode] = useState("");
  const [activeInput, setActiveInput] = useState("none");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const resizeRef = useRef(null);
  const containerRef = useRef(null);
  const urlInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const dimensionsRef = useRef({
    width: props.node.attrs.embedWidth || "100%",
    height: props.node.attrs.embedHeight || 300,
  });
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;

  useEffect(() => {
    if (embedType === "code" && embedCode) {
      const sanitized = DOMPurify.sanitize(embedCode, {
        ADD_TAGS: ["iframe"],
        ALLOWED_ATTR: [
          "src",
          "frameborder",
          "allowfullscreen",
          "allow",
          "width",
          "height",
          "style",
          "class",
          "title",
          "loading",
          "referrerpolicy",
          "scrolling",
          "name",
        ],
      });
      setSanitizedEmbedCode(sanitized);
    }
  }, [embedCode, embedType]);

  const handleUrlChange = (event) => {
    const newUrl = event.target.value;
    const sanitized = DOMPurify.sanitize(newUrl);
    let validated = sanitized;
    if (sanitized) {
      try {
        const url = new URL(sanitized);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          url.protocol = "https:";
          validated = url.toString();
        }
      } catch {
        if (!sanitized.match(/^[a-zA-Z]+:\/\//)) validated = `https://${sanitized}`;
      }
    }
    setEmbedUrl(validated);
    props.updateAttributes({ embedUrl: validated, embedType: "url" });
  };

  const handleCodeChange = (event) => {
    setEmbedCode(event.target.value);
    props.updateAttributes({ embedCode: event.target.value, embedType: "code" });
  };

  const handleResizeStart = (event, direction) => {
    event.preventDefault();
    setIsResizing(true);
    const startX = event.clientX,
      startY = event.clientY;
    const startWidth = resizeRef.current?.offsetWidth || 0;
    const startHeight = resizeRef.current?.offsetHeight || 0;

    const handleMouseMove = (e) => {
      if (!resizeRef.current) return;
      if (direction === "horizontal") {
        const parentW = resizeRef.current.parentElement?.offsetWidth || 1;
        const pct = Math.min(
          100,
          Math.max(10, ((startWidth + e.clientX - startX) / parentW) * 100)
        );
        dimensionsRef.current.width = `${pct}%`;
        resizeRef.current.style.width = `${pct}%`;
      } else {
        const newH = Math.max(100, startHeight + e.clientY - startY);
        dimensionsRef.current.height = newH;
        resizeRef.current.style.height = `${newH}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setEmbedWidth(dimensionsRef.current.width);
      setEmbedHeight(dimensionsRef.current.height);
      props.updateAttributes({
        embedWidth: dimensionsRef.current.width,
        embedHeight: dimensionsRef.current.height,
      });
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleCenterBlock = () => {
    const newAlignment = alignment === "center" ? "left" : "center";
    setAlignment(newAlignment);
    props.updateAttributes({ alignment: newAlignment });
  };

  const handleRemove = () => {
    setEmbedUrl("");
    setEmbedCode("");
    props.updateAttributes({ embedUrl: "", embedCode: "" });
  };

  const handleProductSelection = (product) => {
    setEmbedType("url");
    setActiveInput("url");
    setSelectedProduct(product);
    setTimeout(() => urlInputRef.current?.focus(), 50);
  };

  const embedContent = useMemo(
    () =>
      !isResizing && (embedUrl || sanitizedEmbedCode) ? (
        <MemoizedEmbed
          embedUrl={embedUrl}
          sanitizedEmbedCode={sanitizedEmbedCode}
          embedType={embedType}
        />
      ) : (
        <div className="h-full w-full rounded-lg bg-neutral-100" />
      ),
    [embedUrl, sanitizedEmbedCode, embedType, isResizing]
  );

  return (
    <NodeViewWrapper className="embed-block w-full" ref={containerRef}>
      <div className="nice-shadow rounded-xl bg-neutral-50 px-5 py-4 transition-all ease-linear">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExternalLink className="text-neutral-400" size={16} />
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Embed
            </span>
          </div>
          {(embedUrl || sanitizedEmbedCode) && isEditable && (
            <button
              onClick={handleRemove}
              className="text-neutral-400 transition-colors hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div
          ref={resizeRef}
          className={cn(
            "nice-shadow relative overflow-hidden rounded-lg bg-white",
            alignment === "center" && "mx-auto"
          )}
          style={{ height: `${embedHeight}px`, width: embedWidth }}
        >
          {embedUrl || sanitizedEmbedCode ? (
            <>
              {embedContent}
              {isEditable && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 p-1 opacity-70 backdrop-blur-sm transition-opacity hover:opacity-100">
                  <button
                    onClick={() => setActiveInput(embedType)}
                    className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
                    title="Edit embed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCenterBlock}
                    className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
                    title={alignment === "center" ? "Align left" : "Align center"}
                  >
                    <AlignCenter size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4">
              <p className="mb-4 text-center text-base font-medium text-neutral-500">
                Add an embed
              </p>
              <div className="mb-4 flex flex-wrap justify-center gap-3">
                {SUPPORTED_PRODUCTS.map((product) => (
                  <button
                    key={product.name}
                    className="group flex flex-col items-center transition-transform hover:scale-110"
                    onClick={() => handleProductSelection(product)}
                    title={`Add ${product.name} embed`}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md"
                      style={{ backgroundColor: product.color }}
                    >
                      <span className="text-xs font-bold text-white">
                        {product.name.slice(0, 2)}
                      </span>
                    </div>
                    <span className="mt-1.5 text-xs font-medium text-neutral-600">
                      {product.name}
                    </span>
                  </button>
                ))}
              </div>
              {isEditable && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEmbedType("url");
                      setActiveInput("url");
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-300"
                  >
                    <LinkIcon size={14} />
                    <span>URL</span>
                  </button>
                  <button
                    onClick={() => {
                      setEmbedType("code");
                      setActiveInput("code");
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-300"
                  >
                    <Code size={14} />
                    <span>Code</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditable && activeInput !== "none" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-50/95 p-4 backdrop-blur-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setActiveInput("none");
                }}
                className="nice-shadow w-full max-w-lg rounded-xl bg-white p-4"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setActiveInput("none");
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-800">
                    {activeInput === "url"
                      ? selectedProduct
                        ? `Add ${selectedProduct.name} embed`
                        : "Add embed URL"
                      : "Add embed code"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveInput("none")}
                    className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                {activeInput === "url" ? (
                  <div className="relative mb-4">
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      ref={urlInputRef}
                      type="text"
                      value={embedUrl}
                      onChange={handleUrlChange}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                      placeholder={
                        selectedProduct ? `Paste ${selectedProduct.name} URL` : "Paste any URL"
                      }
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="relative mb-4">
                    <textarea
                      ref={codeInputRef}
                      value={embedCode}
                      onChange={handleCodeChange}
                      className="h-32 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                      placeholder="Paste embed code (iframe)..."
                      autoFocus
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveInput("none")}
                    className="rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    disabled={
                      (activeInput === "url" && !embedUrl) || (activeInput === "code" && !embedCode)
                    }
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>
          )}

          {isEditable && (embedUrl || sanitizedEmbedCode) && (
            <>
              <div
                className="absolute top-0 right-0 bottom-0 flex w-4 cursor-ew-resize items-center justify-center bg-white/70 transition-opacity hover:bg-white/90"
                onMouseDown={(e) => handleResizeStart(e, "horizontal")}
              >
                <GripVertical size={16} className="text-neutral-500" />
              </div>
              <div
                className="absolute right-0 bottom-0 left-0 flex h-4 cursor-ns-resize items-center justify-center bg-white/70 transition-opacity hover:bg-white/90"
                onMouseDown={(e) => handleResizeStart(e, "vertical")}
              >
                <GripHorizontal size={16} className="text-neutral-500" />
              </div>
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default EmbedObjectsComponent;
