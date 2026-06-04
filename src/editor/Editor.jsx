import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import { TextStyleKit } from "@tiptap/extension-text-style";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

import { Toaster } from "react-hot-toast";
import "./editor.css";
import { EditorProvider } from "../contexts/EditorContext";
import { ToolbarButtons } from "./Toolbar/ToolbarButtons";
import { getLinkExtension } from "./EditorConf";
import { lowlight } from "./editorLowlight";

import Callout from "./extensions/Callout/Callout";
import InfoCallout from "./extensions/Callout/Info/InfoCallout";
import WarningCallout from "./extensions/Callout/Warning/WarningCallout";
import ImageBlock from "./extensions/Image/ImageBlock";
import VideoBlock from "./extensions/Video/VideoBlock";
import AudioBlock from "./extensions/Audio/AudioBlock";
import PDFBlock from "./extensions/PDF/PDFBlock";
import MathEquationBlock from "./extensions/MathEquation/MathEquationBlock";
import QuizBlock from "./extensions/Quiz/QuizBlock";
import EmbedObjects from "./extensions/EmbedObjects/EmbedObjects";
import WebPreview from "./extensions/WebPreview/WebPreview";
import Flipcard from "./extensions/Flipcard/Flipcard";
import Scenarios from "./extensions/Scenarios/Scenarios";
import Badges from "./extensions/Badges/Badges";
import Buttons from "./extensions/Buttons/Buttons";
import UserBlock from "./extensions/Users/UserBlock";
import MagicBlock from "./extensions/MagicBlocks/MagicBlock";
import CodePlayground from "./extensions/CodePlayground/CodePlayground";
import AISelectionHighlight from "./extensions/AISelectionHighlight/AISelectionHighlight";
import AIStreamingMark from "./extensions/AIStreaming/AIStreamingMark";
import DragHandle from "./extensions/DragHandle/DragHandle";
import { SlashCommands } from "./extensions/SlashCommands";
import PasteFileHandler from "./extensions/PasteFileHandler/PasteFileHandler";

const DEFAULT_CONTENT = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hi there" }] }],
};

function MeroEduEditor({ initialContent, onSave, onContentChange, editable = true }) {
  const [editorReady, setEditorReady] = React.useState(false);

  const extensions = React.useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        link: false,
        bulletList: { HTMLAttributes: { class: "bullet-list" } },
        orderedList: { HTMLAttributes: { class: "ordered-list" } },
      }),
      Color.configure({ types: [TextStyleKit.name, ListItem.name] }),
      TextStyleKit,
      Callout,
      InfoCallout.configure({ editable }),
      WarningCallout.configure({ editable }),
      ImageBlock.configure({ editable }),
      VideoBlock.configure({ editable }),
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

  const debouncedContent = useDebounce(content, 1000); // Saves 1 second after last keystroke

  // 2. Trigger save to backend
  useEffect(() => {
    if (debouncedContent) {
      const saveToServer = async () => {
        setIsSaving(true);
        onContentChange(debouncedContent); // Call the passed-in onSave handler
        setIsSaving(false);
      };
      saveToServer();
    }
  }, [debouncedContent]);

  const editor = useEditor({
    editable,
    extensions,
    content: DEFAULT_CONTENT,
    immediatelyRender: false,
    onCreate: () => {
      setTimeout(() => setEditorReady(true), 0);
    },
    onUpdate: ({ editor }) => {
      // Get JSON format (recommended) or editor.getHTML()
      setContent(editor.getJSON());
    },
  });
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!editor || !initialContent) return;

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

      // 3. Prevent this block from executing ever again
      hasLoadedRef.current = true;
    }
  }, [editor, initialContent]);

  return (
    <EditorProvider isEditable={editable}>
      <Toaster position="top-right" />
      <div className="editor-topbar">
        <div className="editor-toolbar-center">
          <ToolbarButtons editor={editor} />
        </div>
      </div>
      <div className="editor-content-area">
        <div className="editor-content-inner">
          <EditorContent editor={editor} dark={"false"} />
        </div>
      </div>
    </EditorProvider>
  );
}

export default MeroEduEditor;
