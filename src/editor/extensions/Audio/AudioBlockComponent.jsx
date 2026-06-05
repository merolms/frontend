import { NodeViewWrapper } from "@tiptap/react";
import { AlertCircle, Headphones, Loader2, RefreshCcw, Upload } from "lucide-react";
import React from "react";

import { useEditorProvider } from "@/contexts/EditorContext";
import { uploadEditorMedia } from "@/editor/utils/mediaUpload";

function AudioBlockComponent(props) {
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;
  const fileInputRef = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState(null);

  const dataUrl = props.node.attrs.dataUrl;
  const fileUrl = props.node.attrs.fileUrl;
  const fileName = props.node.attrs.fileName;
  const audioUrl = fileUrl || dataUrl;

  const uploadFile = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const { url, fileName: uploadedFileName } = await uploadEditorMedia(
        file,
        editorState.lessonId,
        props.node.attrs.blockObject?.id || props.node.attrs.id
      );
      props.updateAttributes({
        fileUrl: url,
        fileName: uploadedFileName || file.name,
      });
      setPendingFile(null);
    } catch (err) {
      setError(err.message || "Failed to upload audio");
      setPendingFile(file);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileRead = (file) => {
    setPendingFile(file);
    uploadFile(file);
  };

  const handleRetry = () => {
    if (pendingFile) {
      uploadFile(pendingFile);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"].includes(file.type)) {
      await handleFileRead(file);
    }
  };

  if (!isEditable && !audioUrl) return null;

  if (!isEditable && audioUrl) {
    return (
      <NodeViewWrapper className="block-audio w-full">
        <audio src={audioUrl} controls className="w-full" />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="block-audio w-full">
      <div className="nice-shadow rounded-xl bg-neutral-50 px-5 py-4 transition-all ease-linear">
        <div className="mb-3 flex items-center gap-2">
          <Headphones className="text-neutral-400" size={16} />
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
            Audio
          </span>
        </div>

        {audioUrl ? (
          <div>
            <audio src={audioUrl} controls className="w-full" />
            {fileName && <p className="mt-2 text-xs text-neutral-500">{fileName}</p>}
            {isEditable && (
              <button
                onClick={() => props.updateAttributes({ fileUrl: null, dataUrl: null, fileName: null })}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Remove audio
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all ${isDragging ? "border-neutral-400 bg-neutral-100" : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".mp3,.wav,.ogg"
              className="hidden"
            />
            {isLoading ? (
              <div className="space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-500" />
                <p className="text-sm text-neutral-600">Loading audio...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-7 w-7 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-700">
                    Drop or browse to upload audio
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">MP3, WAV, OGG supported</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-500">
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              <RefreshCcw size={12} />
              Retry
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default AudioBlockComponent;
