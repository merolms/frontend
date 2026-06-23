// @ts-nocheck
import { NodeViewWrapper } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight, Edit2, Save, Trash, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useEditorProvider } from "@/contexts/EditorContext";

import Modal from "../../../components/ui/Modal";

const ALIGNMENTS = [
  { value: "left", label: <AlignLeft size={16} /> },
  { value: "center", label: <AlignCenter size={16} /> },
  { value: "right", label: <AlignRight size={16} /> },
];

function WebPreviewComponent({ node, updateAttributes, deleteNode }) {
  const [inputUrl, setInputUrl] = useState(node.attrs.url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(!node.attrs.url);
  const [modalOpen, setModalOpen] = useState(!node.attrs.url);
  const [popupOpen, setPopupOpen] = useState(false);
  const [buttonLabel, setButtonLabel] = useState(node.attrs.buttonLabel || "");
  const [showButton, setShowButton] = useState(node.attrs.showButton !== false);
  const [openInPopup, setOpenInPopup] = useState(node.attrs.openInPopup || false);
  const inputRef = useRef(null);
  const editorContext = useEditorProvider();
  const isEditable = editorContext?.isEditable ?? true;

  const previewData = {
    title: node.attrs.title,
    description: node.attrs.description,
    og_image: node.attrs.og_image,
    favicon: node.attrs.favicon,
    url: node.attrs.url,
  };

  const alignment = node.attrs.alignment || "left";
  const hasPreview = !!previewData.title;

  useEffect(() => {
    setButtonLabel(node.attrs.buttonLabel || "Visit Site");
    setShowButton(!!node.attrs.showButton);
    setOpenInPopup(!!node.attrs.openInPopup);
  }, [node.attrs.buttonLabel, node.attrs.showButton, node.attrs.openInPopup]);

  useEffect(() => {
    if (!node.attrs.url) {
      setEditing(true);
      setModalOpen(true);
    }
  }, [node.attrs.url]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  // Standalone: no backend, so we just store the URL and show a basic card
  const handleSaveEdit = () => {
    if (inputUrl.trim()) {
      updateAttributes({
        url: inputUrl.trim(),
        title: inputUrl.trim(),
        description: "",
        og_image: null,
        favicon: null,
        buttonLabel,
        showButton,
        openInPopup,
      });
    } else {
      updateAttributes({ buttonLabel, showButton, openInPopup });
    }
    setEditing(false);
    setModalOpen(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setInputUrl(node.attrs.url || "");
    setError(null);
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (typeof deleteNode === "function") {
      deleteNode();
    } else {
      updateAttributes({
        url: null,
        title: null,
        description: null,
        og_image: null,
        favicon: null,
      });
    }
  };

  const handleAlignmentChange = (value) => updateAttributes({ alignment: value });

  let alignClass = "justify-start";
  if (alignment === "center") alignClass = "justify-center";
  else if (alignment === "right") alignClass = "justify-end";

  return (
    <NodeViewWrapper className="web-preview-block relative">
      <Modal
        isDialogOpen={popupOpen}
        onOpenChange={setPopupOpen}
        dialogTitle={previewData.title || "Website Preview"}
        minWidth="xl"
        minHeight="xl"
        dialogContent={
          <iframe
            src={previewData.url}
            title="Embedded preview"
            className="h-full w-full border-0 bg-white"
            style={{ minHeight: 400 }}
            allowFullScreen
          />
        }
      />
      <div className={`flex w-full ${alignClass}`}>
        <div className="nice-shadow relative my-2 max-w-[420px] min-w-[260px] rounded-xl bg-white px-6 pt-6 pb-4">
          {isEditable && !editing && (
            <div className="absolute -top-3 -right-3 z-20 flex flex-col gap-2">
              <button
                className="flex items-center justify-center rounded-md border border-yellow-200 bg-yellow-50 p-1.5 text-yellow-700 shadow-md hover:bg-yellow-100"
                onClick={() => {
                  setEditing(true);
                  setInputUrl(node.attrs.url || "");
                  setModalOpen(true);
                }}
                type="button"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-1.5 text-red-700 shadow-md hover:bg-red-100"
                onClick={handleDelete}
                type="button"
              >
                <Trash size={16} />
              </button>
            </div>
          )}

          <Modal
            isDialogOpen={modalOpen}
            onOpenChange={(open) => {
              setModalOpen(open);
              if (!open) handleCancelEdit();
            }}
            dialogTitle="Edit Web Preview Card"
            dialogContent={
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit();
                }}
              >
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Website URL</label>
                  <input
                    ref={inputRef}
                    id="web-url-input"
                    type="text"
                    placeholder="https://example.com"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    autoFocus
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">
                    Button Options
                  </label>
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showButton}
                        onChange={(e) => setShowButton(e.target.checked)}
                      />
                      Show button
                    </label>
                    {showButton && (
                      <>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={openInPopup}
                            onChange={(e) => setOpenInPopup(e.target.checked)}
                          />
                          Open in popup
                        </label>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-neutral-600">Button label</label>
                          <input
                            type="text"
                            value={buttonLabel}
                            onChange={(e) => setButtonLabel(e.target.value)}
                            placeholder="Visit Site"
                            className="w-36 rounded border border-neutral-200 px-2 py-1 text-sm outline-none focus:border-neutral-400"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Alignment</label>
                  <div className="flex gap-2 pt-1">
                    {ALIGNMENTS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAlignmentChange(opt.value)}
                        className={`rounded-full border px-2 py-1 text-sm transition-colors ${alignment === opt.value ? "text-secondary border-black bg-black" : "border-neutral-200 hover:bg-neutral-50"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <div className="text-xs text-red-600">{error}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !inputUrl}
                    className="text-secondary flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-900 disabled:opacity-50"
                  >
                    <Save size={14} /> Save
                  </button>
                </div>
              </form>
            }
          />

          {hasPreview && !editing && (
            <>
              <a
                href={previewData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
                style={{ textDecoration: "none" }}
              >
                {previewData.og_image && (
                  <div className="-mx-6 -mt-6 mb-0 overflow-hidden rounded-t-xl">
                    <img
                      src={previewData.og_image}
                      alt="preview"
                      className="block h-40 w-full object-cover"
                    />
                  </div>
                )}
                <div className="pt-4 pb-2">
                  <span className="mb-1.5 block text-lg leading-tight font-semibold text-[#232323]">
                    {previewData.title}
                  </span>
                  {previewData.description && (
                    <span className="mb-3 block text-sm leading-snug text-gray-700">
                      {previewData.description}
                    </span>
                  )}
                </div>
              </a>
              <div className="mt-0 flex items-center border-t border-gray-100 pt-2">
                {previewData.favicon && (
                  <img
                    src={previewData.favicon}
                    alt="favicon"
                    className="mr-2 h-[18px] w-[18px] rounded bg-gray-100"
                  />
                )}
                <span className="truncate text-xs text-gray-500">{previewData.url}</span>
              </div>
              {showButton &&
                previewData.url &&
                (openInPopup ? (
                  <button
                    type="button"
                    className="text-secondary mt-4 block w-full rounded-xl bg-black px-4 py-2.5 text-center text-[16px] font-semibold transition-all hover:bg-gray-900"
                    onClick={() => setPopupOpen(true)}
                  >
                    {buttonLabel || "Visit Site"}
                  </button>
                ) : (
                  <a
                    href={previewData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary mt-4 block w-full rounded-xl bg-black px-4 py-2.5 text-center text-[16px] font-semibold transition-all hover:bg-gray-900"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    {buttonLabel || "Visit Site"}
                  </a>
                ))}
              {isEditable && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className="mr-1 text-xs text-gray-500">Align:</span>
                    {ALIGNMENTS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAlignmentChange(opt.value)}
                        className={`flex items-center justify-center rounded-full border p-1.5 text-gray-600 transition-colors ${alignment === opt.value ? "text-secondary border-gray-600 bg-gray-600" : "border-gray-200 bg-white hover:bg-gray-100"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!hasPreview && !editing && (
            <div className="py-4 text-center text-sm text-neutral-400">
              No preview available.{" "}
              <button
                onClick={() => {
                  setEditing(true);
                  setModalOpen(true);
                }}
                className="text-blue-500 underline"
              >
                Edit URL
              </button>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default WebPreviewComponent;
