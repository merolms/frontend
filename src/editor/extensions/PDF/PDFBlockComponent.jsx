import { NodeViewWrapper } from "@tiptap/react";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import React from "react";

import { useEditorProvider } from "../../../contexts/EditorContext";

function PDFBlockComponent(props) {
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;
  const fileInputRef = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [urlInput, setUrlInput] = React.useState(props.node.attrs.pdfUrl || "");

  const dataUrl = props.node.attrs.dataUrl;
  const pdfUrl = props.node.attrs.pdfUrl;
  const fileName = props.node.attrs.fileName;
  const src = dataUrl || pdfUrl;

  const handleFileRead = (file) => {
    setIsLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      props.updateAttributes({ dataUrl: e.target.result, fileName: file.name });
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to read PDF file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      props.updateAttributes({ pdfUrl: urlInput.trim() });
    }
  };

  if (!isEditable && !src) return null;

  if (!isEditable && src) {
    return (
      <NodeViewWrapper className="block-pdf w-full">
        <iframe
          src={src}
          className="w-full rounded-lg border border-neutral-200"
          style={{ height: 500 }}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="block-pdf w-full">
      <div className="nice-shadow rounded-xl bg-neutral-50 px-5 py-4 transition-all ease-linear">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="text-neutral-400" size={16} />
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">PDF</span>
        </div>

        {src ? (
          <div>
            <iframe
              src={src}
              className="w-full rounded-lg border border-neutral-200"
              style={{ height: 500 }}
            />
            {fileName && <p className="mt-2 text-xs text-neutral-500">{fileName}</p>}
            {isEditable && (
              <button
                onClick={() =>
                  props.updateAttributes({ dataUrl: null, fileName: null, pdfUrl: null })
                }
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Remove PDF
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-white p-6 text-center transition-all hover:border-neutral-400 hover:bg-neutral-50"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              {isLoading ? (
                <div className="space-y-3">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-500" />
                  <p className="text-sm text-neutral-600">Loading PDF...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-7 w-7 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-700">Upload PDF file</p>
                </div>
              )}
            </div>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or enter PDF URL..."
                className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-neutral-700 px-3 py-2 text-sm text-white hover:bg-neutral-800"
              >
                Load
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-500">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default PDFBlockComponent;
