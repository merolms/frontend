import { NodeViewWrapper } from "@tiptap/react";
import React, { useEffect } from "react";
import { Resizable } from "re-resizable";
import {
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Expand,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useEditorProvider } from "../../../contexts/EditorContext";
import { constructAcceptValue } from "../../../lib/constants";
import Modal from "../../../components/ui/Modal";

const SUPPORTED_FILES = constructAcceptValue(["jpg", "png", "webp", "gif"]);

function ImageBlockComponent(props) {
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;
  const fileInputRef = React.useRef(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [imageSize, setImageSize] = React.useState({
    width: props.node.attrs.size ? props.node.attrs.size.width : 300,
  });
  const [alignment, setAlignment] = React.useState(props.node.attrs.alignment || "center");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const dataUrl = props.node.attrs.dataUrl || null;
  const unsplashUrl = props.node.attrs.unsplash_url || null;
  const imageUrl = dataUrl || unsplashUrl;

  const handleFileRead = (file) => {
    setIsLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      props.updateAttributes({
        dataUrl: result,
        fileName: file.name,
        size: imageSize,
        alignment: alignment,
      });
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      handleFileRead(file);
    }
  };

  const handleExpand = () => {
    setIsModalOpen(true);
  };

  const handleAlignmentChange = (newAlignment) => {
    setAlignment(newAlignment);
    props.updateAttributes({ alignment: newAlignment });
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case "left":
        return "justify-start";
      case "right":
        return "justify-end";
      default:
        return "justify-center";
    }
  };

  const getItemsAlignmentClass = () => {
    switch (alignment) {
      case "left":
        return "items-start";
      case "right":
        return "items-end";
      default:
        return "items-center";
    }
  };

  // View mode - show only the image without block wrapper
  if (!isEditable && imageUrl) {
    const viewFrameStyle = { width: imageSize.width, maxWidth: "100%" };
    return (
      <>
        <NodeViewWrapper className="block-image w-full">
          <div className={`flex w-full flex-col ${getItemsAlignmentClass()}`}>
            <div className="group relative" style={viewFrameStyle}>
              <img src={imageUrl} alt="" className="h-auto w-full max-w-full rounded-lg" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={handleExpand}
                  className="rounded-lg bg-black/50 p-2 transition-colors outline-none hover:bg-black/70"
                  title="Expand image"
                >
                  <Expand className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </NodeViewWrapper>

        <Modal
          isDialogOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          dialogTitle="Image Viewer"
          minWidth="lg"
          minHeight="lg"
          dialogContent={
            <div className="flex w-full flex-col items-center justify-center">
              <img
                src={imageUrl}
                alt=""
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
          }
        />
      </>
    );
  }

  // View mode - no image
  if (!isEditable && !imageUrl) {
    return null;
  }

  return (
    <>
      <NodeViewWrapper className="block-image w-full">
        <div className="nice-shadow rounded-xl bg-neutral-50 px-5 py-4 transition-all ease-linear">
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <Image className="text-neutral-400" size={16} />
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Image
            </span>
          </div>

          {/* Upload Zone */}
          {!imageUrl && isEditable && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all ${isDragging ? "border-neutral-400 bg-neutral-100" : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50"} `}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleImageChange}
                accept={SUPPORTED_FILES}
                className="hidden"
              />
              {isLoading ? (
                <div className="space-y-3">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-500" />
                  <p className="text-sm text-neutral-600">Uploading...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-7 w-7 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Drop or browse to upload</p>
                    <p className="mt-1 text-xs text-neutral-500">JPG, PNG, WebP, GIF supported</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-500">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Image display - edit mode */}
          {imageUrl && isEditable && (
            <div className={`flex w-full flex-col ${getItemsAlignmentClass()}`}>
              <Resizable
                defaultSize={{ width: imageSize.width, height: "100%" }}
                handleStyles={{
                  right: {
                    position: "unset",
                    width: 7,
                    height: 30,
                    borderRadius: 20,
                    cursor: "col-resize",
                    backgroundColor: "#94a3b8",
                    margin: "auto",
                    marginLeft: 5,
                  },
                }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  maxWidth: "100%",
                }}
                maxWidth="100%"
                minWidth={200}
                enable={{ right: true }}
                onResizeStop={(e, direction, ref, d) => {
                  const newWidth = Math.min(
                    imageSize.width + d.width,
                    ref.parentElement?.clientWidth || 1000
                  );
                  props.updateAttributes({ size: { width: newWidth } });
                  setImageSize({ width: newWidth });
                }}
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt=""
                    className="nice-shadow h-auto max-w-full rounded-lg"
                    style={{ width: "100%" }}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 p-1 opacity-80 backdrop-blur-sm transition-opacity hover:opacity-100">
                    <button
                      onClick={() => handleAlignmentChange("left")}
                      className={`rounded-md p-1.5 transition-colors outline-none ${alignment === "left" ? "bg-neutral-200 text-neutral-700" : "text-neutral-500 hover:bg-neutral-100"}`}
                      title="Align left"
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      onClick={() => handleAlignmentChange("center")}
                      className={`rounded-md p-1.5 transition-colors outline-none ${alignment === "center" ? "bg-neutral-200 text-neutral-700" : "text-neutral-500 hover:bg-neutral-100"}`}
                      title="Align center"
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      onClick={() => handleAlignmentChange("right")}
                      className={`rounded-md p-1.5 transition-colors outline-none ${alignment === "right" ? "bg-neutral-200 text-neutral-700" : "text-neutral-500 hover:bg-neutral-100"}`}
                      title="Align right"
                    >
                      <AlignRight size={14} />
                    </button>
                    <div className="mx-0.5 h-4 w-px bg-neutral-200"></div>
                    <button
                      onClick={handleExpand}
                      className="rounded-md p-1.5 text-neutral-500 transition-colors outline-none hover:bg-neutral-100"
                      title="Expand image"
                    >
                      <Expand size={14} />
                    </button>
                  </div>
                </div>
              </Resizable>
            </div>
          )}
        </div>
      </NodeViewWrapper>

      {imageUrl && (
        <Modal
          isDialogOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          dialogTitle="Image Viewer"
          minWidth="lg"
          minHeight="lg"
          dialogContent={
            <div className="flex w-full flex-col items-center justify-center">
              <img
                src={imageUrl}
                alt=""
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
          }
        />
      )}
    </>
  );
}

export default ImageBlockComponent;
