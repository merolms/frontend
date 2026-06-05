import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
const Picker = lazy(() => import("@emoji-mart/react"));
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  ChevronDown,
  Link,
  Palette,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { useEditorProvider } from "@/contexts/EditorContext";

const ButtonsExtension = (props) => {
  const [emoji, setEmoji] = useState(props.node.attrs.emoji);
  const [link, setLink] = useState(props.node.attrs.link);
  const [alignment, setAlignment] = useState(props.node.attrs.alignment);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [color, setColor] = useState(props.node.attrs.color || "blue");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const pickerRef = useRef(null);
  const linkInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) setShowEmojiPicker(false);
      if (linkInputRef.current && !linkInputRef.current.contains(event.target))
        setShowLinkInput(false);
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target))
        setShowColorPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiSelect = (e) => {
    setEmoji(e.native);
    setShowEmojiPicker(false);
    props.updateAttributes({ emoji: e.native });
  };
  const handleLinkChange = (e) => {
    setLink(e.target.value);
    props.updateAttributes({ link: e.target.value });
  };
  const handleAlignmentChange = (newAlignment) => {
    setAlignment(newAlignment);
    props.updateAttributes({ alignment: newAlignment });
  };
  const handleColorSelect = (c) => {
    setColor(c);
    setShowColorPicker(false);
    props.updateAttributes({ color: c });
  };

  const getAlignmentClass = () =>
    ({ left: "text-left", center: "text-center", right: "text-right" })[alignment] || "text-left";

  const getButtonColor = (c) =>
    ({
      sky: "bg-sky-500 hover:bg-sky-600",
      green: "bg-green-500 hover:bg-green-600",
      yellow: "bg-yellow-500 hover:bg-yellow-600",
      red: "bg-red-500 hover:bg-red-600",
      purple: "bg-purple-500 hover:bg-purple-600",
      teal: "bg-teal-500 hover:bg-teal-600",
      amber: "bg-amber-500 hover:bg-amber-600",
      indigo: "bg-indigo-500 hover:bg-indigo-600",
      neutral: "bg-neutral-500 hover:bg-neutral-600",
    })[c] || "bg-blue-500 hover:bg-blue-600";

  const colors = [
    "sky",
    "green",
    "yellow",
    "red",
    "purple",
    "teal",
    "amber",
    "indigo",
    "neutral",
    "blue",
  ];

  return (
    <NodeViewWrapper className={`block-button ${getAlignmentClass()}`}>
      <div className="inline-block">
        <button
          onClick={isEditable ? undefined : () => window.open(link, "_blank")}
          className={twMerge(
            "flex items-center space-x-2 rounded-xl px-4 py-2 text-white transition-colors",
            getButtonColor(color),
            isEditable && "pointer-events-none",
            !link && "opacity-60"
          )}
        >
          <span>{emoji}</span>
          <NodeViewContent className="content" />
          <ArrowRight size={14} />
        </button>
        {isEditable && (
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="rounded-md bg-gray-200 p-1"
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={() => setShowLinkInput(!showLinkInput)}
              className="rounded-md bg-gray-200 p-1"
            >
              <Link size={14} />
            </button>
            <button
              onClick={() => handleAlignmentChange("left")}
              className="rounded-md bg-gray-200 p-1"
            >
              <AlignLeft size={14} />
            </button>
            <button
              onClick={() => handleAlignmentChange("center")}
              className="rounded-md bg-gray-200 p-1"
            >
              <AlignCenter size={14} />
            </button>
            <button
              onClick={() => handleAlignmentChange("right")}
              className="rounded-md bg-gray-200 p-1"
            >
              <AlignRight size={14} />
            </button>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="rounded-md bg-gray-200 p-1"
            >
              <Palette size={14} />
            </button>
          </div>
        )}
      </div>
      {isEditable && showEmojiPicker && (
        <div ref={pickerRef}>
          <Suspense fallback={<div className="p-4 text-sm text-gray-400">Loading...</div>}>
            <Picker onEmojiSelect={handleEmojiSelect} />
          </Suspense>
        </div>
      )}
      {isEditable && showLinkInput && (
        <input
          ref={linkInputRef}
          type="text"
          value={link}
          onChange={handleLinkChange}
          placeholder="Enter link URL"
          className="mt-2 w-full rounded-md border p-2 text-sm outline-none"
        />
      )}
      {isEditable && showColorPicker && (
        <div
          ref={colorPickerRef}
          className="nice-shadow absolute z-10 mt-2 rounded-md bg-white p-2"
        >
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className={`h-6 w-6 rounded-full ${getButtonColor(c)}`}
                onClick={() => handleColorSelect(c)}
              />
            ))}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default ButtonsExtension;
