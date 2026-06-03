import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
const Picker = lazy(() => import("@emoji-mart/react"));
import { ChevronDown, ChevronRight, Palette } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useEditorProvider } from "../../../contexts/EditorContext";

const BadgesExtension = (props) => {
  const [color, setColor] = useState(props.node.attrs.color);
  const [emoji, setEmoji] = useState(props.node.attrs.emoji);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPredefinedCallouts, setShowPredefinedCallouts] = useState(false);
  const pickerRef = useRef(null);
  const colorPickerRef = useRef(null);
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (pickerRef.current && !pickerRef.current.contains(event.target)) ||
        (colorPickerRef.current && !colorPickerRef.current.contains(event.target))
      ) {
        setShowEmojiPicker(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiSelect = (e) => {
    setEmoji(e.native);
    setShowEmojiPicker(false);
    props.updateAttributes({ emoji: e.native });
  };
  const handleColorSelect = (c) => {
    setColor(c);
    setShowColorPicker(false);
    props.updateAttributes({ color: c });
  };

  const handlePredefinedBadgeSelect = (badge) => {
    setEmoji(badge.emoji);
    setColor(badge.color);
    props.updateAttributes({ emoji: badge.emoji, color: badge.color });
    const { editor } = props;
    if (editor) {
      editor.commands.setTextSelection({
        from: props.getPos() + 1,
        to: props.getPos() + props.node.nodeSize - 1,
      });
      editor.commands.insertContent(badge.content);
    }
    setShowPredefinedCallouts(false);
  };

  const colors = ["sky", "green", "yellow", "red", "purple", "teal", "amber", "indigo", "neutral"];
  const predefinedBadges = [
    { emoji: "📝", color: "sky", content: "Key Concept" },
    { emoji: "💡", color: "yellow", content: "Example" },
    { emoji: "🔍", color: "teal", content: "Deep Dive" },
    { emoji: "⚠️", color: "red", content: "Important Note" },
    { emoji: "🧠", color: "purple", content: "Remember This" },
    { emoji: "🏋️", color: "green", content: "Exercise" },
    { emoji: "🎯", color: "amber", content: "Learning Objective" },
    { emoji: "📚", color: "indigo", content: "Further Reading" },
    { emoji: "💬", color: "neutral", content: "Discussion Topic" },
  ];

  const getBadgeColor = (c) =>
    ({
      sky: "bg-sky-400 text-sky-50",
      green: "bg-green-400 text-green-50",
      yellow: "bg-yellow-400 text-black",
      red: "bg-red-500 text-red-50",
      purple: "bg-purple-400 text-purple-50",
      teal: "bg-teal-400 text-teal-900",
      amber: "bg-amber-600 text-amber-100",
      indigo: "bg-indigo-400 text-indigo-50",
      neutral: "bg-neutral-800 text-white",
    })[c] || "bg-sky-400 text-white";

  return (
    <NodeViewWrapper>
      <div className="relative flex items-center space-x-2">
        <div
          className={twMerge(
            "nice-shadow my-2 flex w-fit items-center space-x-1 rounded-full px-3.5 py-1.5 text-sm font-semibold outline outline-2 outline-white/20",
            getBadgeColor(color)
          )}
        >
          <div className="flex items-center justify-center space-x-1">
            <span>{emoji}</span>
            {isEditable && (
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <ChevronDown size={14} />
              </button>
            )}
          </div>
          <NodeViewContent
            contentEditable={isEditable}
            className="content text tracking-wide capitalize"
          />
          {isEditable && (
            <div className="relative flex items-center justify-center space-x-2">
              <button onClick={() => setShowColorPicker(!showColorPicker)}>
                <Palette size={14} />
              </button>
              {showColorPicker && (
                <div
                  ref={colorPickerRef}
                  className="nice-shadow absolute left-full ml-2 rounded-full bg-white p-2"
                >
                  <div className="flex space-x-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        className={`h-8 w-8 rounded-full ${getBadgeColor(c)}`}
                        onClick={() => handleColorSelect(c)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditable && (
          <button
            onClick={() => setShowPredefinedCallouts(!showPredefinedCallouts)}
            className="text-neutral-300 transition-colors hover:text-neutral-400"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {isEditable && showPredefinedCallouts && (
          <div className="nice-shadow absolute top-full left-0 z-10 mt-2 flex flex-wrap gap-2 rounded-lg bg-white/90 p-2 backdrop-blur-md">
            {predefinedBadges.map((badge, index) => (
              <button
                key={index}
                onClick={() => handlePredefinedBadgeSelect(badge)}
                className={`flex items-center space-x-2 rounded-xl px-3 py-1 text-xs ${getBadgeColor(badge.color)} font-bold transition-all hover:opacity-80`}
              >
                <span>{badge.emoji}</span>
                <span className="capitalize">{badge.content}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isEditable && showEmojiPicker && (
        <div ref={pickerRef}>
          <Suspense fallback={<div className="p-4 text-sm text-gray-400">Loading...</div>}>
            <Picker
              searchPosition="top"
              theme="light"
              previewPosition="none"
              maxFrequentRows={0}
              autoFocus={false}
              onEmojiSelect={handleEmojiSelect}
            />
          </Suspense>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default BadgesExtension;
