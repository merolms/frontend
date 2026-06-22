import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";

import { EditorProvider } from "../contexts/EditorContext";
import { getLinkExtension } from "./EditorConf";
import { lowlight } from "./editorLowlight";
import AISelectionHighlight from "./extensions/AISelectionHighlight/AISelectionHighlight";
import AIStreamingMark from "./extensions/AIStreaming/AIStreamingMark";
import AudioBlock from "./extensions/Audio/AudioBlock";
import Badges from "./extensions/Badges/Badges";
import Buttons from "./extensions/Buttons/Buttons";
import Callout from "./extensions/Callout/Callout";
import InfoCallout from "./extensions/Callout/Info/InfoCallout";
import WarningCallout from "./extensions/Callout/Warning/WarningCallout";
import CodePlayground from "./extensions/CodePlayground/CodePlayground";
import DragHandle from "./extensions/DragHandle/DragHandle";
import EmbedObjects from "./extensions/EmbedObjects/EmbedObjects";
import Flipcard from "./extensions/Flipcard/Flipcard";
import ImageBlock from "./extensions/Image/ImageBlock";
import MagicBlock from "./extensions/MagicBlocks/MagicBlock";
import MathEquationBlock from "./extensions/MathEquation/MathEquationBlock";
import PasteFileHandler from "./extensions/PasteFileHandler/PasteFileHandler";
import PDFBlock from "./extensions/PDF/PDFBlock";
import QuizBlock from "./extensions/Quiz/QuizBlock";
import Scenarios from "./extensions/Scenarios/Scenarios";
import { SlashCommands } from "./extensions/SlashCommands";
import UserBlock from "./extensions/Users/UserBlock";
import VideoBlock from "./extensions/Video/VideoBlock";
import WebPreview from "./extensions/WebPreview/WebPreview";
import { ToolbarButtons } from "./Toolbar/ToolbarButtons";

const DEFAULT_CONTENT = {
  type: "doc",
  content: [],
};

function MeroEduEditor({
  initialContent,
  onContentChange,
  editable = true,
  showToolbar = true,
  lessonId = null,
}) {
  const extensions = React.useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        link: false,
        bulletList: { HTMLAttributes: { class: "bullet-list" } },
        orderedList: { HTMLAttributes: { class: "ordered-list" } },
      }),
      Placeholder.configure({
        placeholder: "Start writing something amazing…",
      }),
      TextStyleKit,
      Callout,
      InfoCallout.configure({ editable }),
      WarningCallout.configure({ editable }),
      // 👇 Add premium block hover classes to your node wrappers
      ImageBlock.configure({
        editable,
        HTMLAttributes: { class: "image-block-wrapper" },
      }),
      VideoBlock.configure({
        editable,
        HTMLAttributes: { class: "video-block-wrapper" },
      }),
      AudioBlock.configure({ editable }),
      PDFBlock.configure({ editable }),
      MathEquationBlock.configure({ editable }),
      QuizBlock.configure({ editable }),
      Youtube.configure({ controls: true, modestBranding: true }),
      CodeBlockLowlight.configure({ lowlight }),
      EmbedObjects.configure({ editable }),
      WebPreview.configure({ editable }),
      Flipcard.configure({ editable }),
      Scenarios.configure({ editable }),
      Badges.configure({ editable }),
      Buttons.configure({ editable }),
      UserBlock.configure({ editable }),
      MagicBlock.configure({ editable }),
      CodePlayground.configure({ editable }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      getLinkExtension(),
      AISelectionHighlight,
      AIStreamingMark,
      DragHandle,
      // 👇 For slash command staggered animation, in SlashCommands component
      // add style={{ animationDelay: `${index * 30}ms` }} to each item.
      SlashCommands.configure({ currentPlan: "pro" }),
      Highlight.configure({ multicolor: true }),
      PasteFileHandler.configure({ activity: null, getAccessToken: () => undefined }),
    ],
    [editable]
  );

  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Debounce function to delay saving
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedContent = useDebounce(content, 1000);

  // 2. Trigger save and show saving indicator
  useEffect(() => {
    if (debouncedContent) {
      setIsSaving(true);
      const saveToServer = async () => {
        await onContentChange(debouncedContent);
        // The indicator disappears automatically via CSS animation
      };
      saveToServer();
      // Reset saving state after a short delay for the animation to play
      const timer = setTimeout(() => setIsSaving(false), 800);
      return () => clearTimeout(timer);
    }
  }, [debouncedContent, onContentChange]);

  const editor = useEditor({
    editable,
    extensions,
    immediatelyRender: false,
    autofocus: "start",
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON());
    },
  });

  const hasLoadedRef = useRef(false);
  const prevContentRef = useRef(null);

  useEffect(() => {
    if (!editor || !initialContent) return;

    const contentKey =
      typeof initialContent === "string" ? initialContent : JSON.stringify(initialContent);
    if (contentKey !== prevContentRef.current) {
      prevContentRef.current = contentKey;
      hasLoadedRef.current = false;
    }

    if (!hasLoadedRef.current) {
      let parsedContent = initialContent;

      if (typeof initialContent === "string") {
        try {
          parsedContent = JSON.parse(initialContent);
        } catch (error) {
          console.error("❌ Failed to parse Tiptap JSON content string:", error);
        }
      }

      try {
        editor.commands.setContent(parsedContent, {
          emitUpdate: false,
          errorOnInvalidContent: true,
        });
      } catch (error) {
        console.error("❌ Failed to load content into Tiptap editor:", error);
        editor.commands.setContent("", {
          emitUpdate: false,
          errorOnInvalidContent: true,
        });
      }

      hasLoadedRef.current = true;
    }
  }, [editor, initialContent]);

  // Determine if editor is empty (for premium empty state)
  const isEditorEmpty = editor?.isEmpty;

  return (
    <EditorProvider isEditable={editable} lessonId={lessonId}>
      {isSaving && <span className="editor-saving-pulse">Saved</span>}
      {/* <Toaster position="top-right" /> */}
       
      {showToolbar && (
        <div className="editor-topbar">
          <div className="editor-toolbar-center">
            <ToolbarButtons editor={editor} />
            {/* Premium saving indicator */}
           
          </div>
        </div>
      )}
      <div className="editor-content-area">
        <div className="editor-content-inner activity-editor-content-wrapper">
          <EditorContent editor={editor} dark={"false"} />
          {/* Premium empty state */}
          {isEditorEmpty && (
            <div className="editor-empty-state">
              <p>Press <kbd>/</kbd> for magic blocks or start typing…</p>
            </div>
          )}
        </div>
      </div>
    </EditorProvider>
  );
}

export default MeroEduEditor;