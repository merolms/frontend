import { NodeViewWrapper } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";
import {
  RotateCw,
  Edit,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Maximize2,
  Minimize2,
  Square,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useEditorProvider } from "../../../contexts/EditorContext";

const FlipcardExtension = (props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [question, setQuestion] = useState(props.node.attrs.question);
  const [answer, setAnswer] = useState(props.node.attrs.answer);
  const [color, setColor] = useState(props.node.attrs.color || "blue");
  const [alignment, setAlignment] = useState(props.node.attrs.alignment || "center");
  const [size, setSize] = useState(props.node.attrs.size || "medium");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const colorPickerRef = useRef(null);
  const questionInputRef = useRef(null);
  const answerInputRef = useRef(null);
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target))
        setShowColorPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFlip = () => {
    if (!isEditingQuestion && !isEditingAnswer) setIsFlipped(!isFlipped);
  };
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    props.updateAttributes({ question: e.target.value });
  };
  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    props.updateAttributes({ answer: e.target.value });
  };
  const handleAlignmentChange = (newAlignment) => {
    setAlignment(newAlignment);
    props.updateAttributes({ alignment: newAlignment });
  };
  const handleColorSelect = (selectedColor) => {
    setColor(selectedColor);
    setShowColorPicker(false);
    props.updateAttributes({ color: selectedColor });
  };
  const handleSizeChange = (newSize) => {
    setSize(newSize);
    props.updateAttributes({ size: newSize });
  };

  const getAlignmentClass = () =>
    ({ left: "justify-start", center: "justify-center", right: "justify-end" })[alignment] ||
    "justify-center";
  const getSizeClass = () =>
    ({ small: "w-64 h-36", medium: "w-80 h-48", large: "w-96 h-60" })[size] || "w-80 h-48";
  const getFontSizeClass = () =>
    ({ small: "text-sm", medium: "text-lg", large: "text-xl" })[size] || "text-lg";
  const getIconSize = () => ({ small: 16, medium: 20, large: 24 })[size] || 20;

  const getCardColor = (c, isBack = false) => {
    const base = {
      sky: isBack ? "bg-sky-600 border-sky-700" : "bg-sky-500 border-sky-600",
      green: isBack ? "bg-emerald-600 border-emerald-700" : "bg-emerald-500 border-emerald-600",
      yellow: isBack ? "bg-amber-600 border-amber-700" : "bg-amber-500 border-amber-600",
      red: isBack ? "bg-red-600 border-red-700" : "bg-red-500 border-red-600",
      purple: isBack ? "bg-purple-600 border-purple-700" : "bg-purple-500 border-purple-600",
      teal: isBack ? "bg-teal-600 border-teal-700" : "bg-teal-500 border-teal-600",
      amber: isBack ? "bg-orange-600 border-orange-700" : "bg-orange-500 border-orange-600",
      indigo: isBack ? "bg-indigo-600 border-indigo-700" : "bg-indigo-500 border-indigo-600",
      neutral: isBack ? "bg-neutral-700 border-neutral-800" : "bg-neutral-600 border-neutral-700",
      blue: isBack ? "bg-blue-600 border-blue-700" : "bg-blue-500 border-blue-600",
    };
    return base[c] || base.blue;
  };

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
    <NodeViewWrapper className={cn("flipcard-wrapper my-4 flex", getAlignmentClass())}>
      <div className={cn("flipcard-container relative", getSizeClass())}>
        <div
          className={cn("flipcard-inner cursor-pointer", isFlipped && "flipped")}
          onClick={handleFlip}
        >
          {/* Front */}
          <div
            className={cn(
              "flipcard-front nice-shadow flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center text-white",
              getCardColor(color, false)
            )}
          >
            <div className="pointer-events-none mb-3 flex items-center justify-center select-none">
              <RotateCw size={getIconSize()} className="opacity-70" />
            </div>
            <div className="flex flex-1 items-center justify-center">
              {isEditable && isEditingQuestion ? (
                <textarea
                  ref={questionInputRef}
                  value={question}
                  onChange={handleQuestionChange}
                  onBlur={() => setIsEditingQuestion(false)}
                  className="h-20 w-full resize-none rounded-lg border-none bg-white/20 p-2 text-center text-white placeholder-white/70 backdrop-blur-sm outline-none"
                  placeholder="Enter question"
                />
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-center text-center leading-relaxed font-medium select-none",
                    getFontSizeClass()
                  )}
                >
                  <span className="pointer-events-none select-none">{question}</span>
                  {isEditable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingQuestion(true);
                        setTimeout(() => questionInputRef.current?.focus(), 0);
                      }}
                      className="pointer-events-auto ml-2 flex-shrink-0 opacity-60 hover:opacity-100"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            {!isEditingQuestion && (
              <div className="pointer-events-none mt-3 text-xs opacity-70 select-none">
                Click to flip
              </div>
            )}
          </div>

          {/* Back */}
          <div
            className={cn(
              "flipcard-back nice-shadow flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center text-white",
              getCardColor(color, true)
            )}
          >
            <div className="pointer-events-none mb-3 flex items-center justify-center select-none">
              <RotateCw size={getIconSize()} className="rotate-180 opacity-70" />
            </div>
            <div className="flex flex-1 items-center justify-center">
              {isEditable && isEditingAnswer ? (
                <textarea
                  ref={answerInputRef}
                  value={answer}
                  onChange={handleAnswerChange}
                  onBlur={() => setIsEditingAnswer(false)}
                  className="h-20 w-full resize-none rounded-lg border-none bg-white/20 p-2 text-center text-white placeholder-white/70 backdrop-blur-sm outline-none"
                  placeholder="Enter answer"
                />
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-center text-center leading-relaxed font-medium select-none",
                    getFontSizeClass()
                  )}
                >
                  <span className="pointer-events-none select-none">{answer}</span>
                  {isEditable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingAnswer(true);
                        setTimeout(() => answerInputRef.current?.focus(), 0);
                      }}
                      className="pointer-events-auto ml-2 flex-shrink-0 opacity-60 hover:opacity-100"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            {!isEditingAnswer && <div className="mt-3 text-xs opacity-70">Click to flip back</div>}
          </div>
        </div>

        {isEditable && (
          <div className="mt-3 flex justify-center gap-1 opacity-60 transition-opacity hover:opacity-100">
            {[
              ["left", <AlignLeft size={12} />],
              ["center", <AlignCenter size={12} />],
              ["right", <AlignRight size={12} />],
            ].map(([val, icon]) => (
              <button
                key={val}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAlignmentChange(val);
                }}
                className={cn(
                  "rounded-md p-1.5 text-xs transition-colors",
                  alignment === val
                    ? "bg-neutral-700 text-white"
                    : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                )}
                title={`Align ${val}`}
              >
                {icon}
              </button>
            ))}
            <div className="mx-1 h-4 w-px self-center bg-neutral-300"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSizeChange("small");
              }}
              className={cn(
                "rounded-md p-1.5 text-xs transition-colors",
                size === "small"
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              )}
              title="Small"
            >
              <Minimize2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSizeChange("medium");
              }}
              className={cn(
                "rounded-md p-1.5 text-xs transition-colors",
                size === "medium"
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              )}
              title="Medium"
            >
              <Square size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSizeChange("large");
              }}
              className={cn(
                "rounded-md p-1.5 text-xs transition-colors",
                size === "large"
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              )}
              title="Large"
            >
              <Maximize2 size={12} />
            </button>
            <div className="mx-1 h-4 w-px self-center bg-neutral-300"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="rounded-md bg-neutral-200 p-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-300"
              title="Change color"
            >
              <Palette size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(!isFlipped);
              }}
              className="rounded-md bg-neutral-200 p-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-300"
              title="Preview flip"
            >
              <RotateCw size={12} />
            </button>
          </div>
        )}

        {isEditable && showColorPicker && (
          <div
            ref={colorPickerRef}
            className="nice-shadow absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-3"
          >
            <div className="flex max-w-xs flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  className={cn(
                    "h-8 w-8 transform rounded-full border-2 border-white transition-transform hover:scale-110",
                    getCardColor(c),
                    color === c && "ring-2 ring-slate-400 ring-offset-2"
                  )}
                  onClick={() => handleColorSelect(c)}
                  title={c.charAt(0).toUpperCase() + c.slice(1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default FlipcardExtension;
