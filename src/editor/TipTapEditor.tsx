"use client";

import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { LineHeight } from "@tiptap/extension-text-style/line-height";
import Underline from "@tiptap/extension-underline";
import { EditorProvider } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { all, createLowlight } from "lowlight";
import { useEffect, useRef, useState } from "react";

import CodeBlockComponent from "./extensions/CodeBlockComponent";
import { ResizableImage } from "./extensions/ResizeImage/resizable-image";
import { SlashCommand } from "./extensions/SlashCommandList";

// Create a lowlight instance
const lowlight = createLowlight(all);

// Register individual languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", javascript);
lowlight.register("javascript", javascript);
lowlight.register("ts", typescript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);

import { getEncoding } from "js-tiktoken";
const enc = getEncoding("cl100k_base");

import { MenuBar } from "./MenuBar/MenuBar";

const extensions = [
  Placeholder.configure({
    // Use a placeholder:
    placeholder: "Write something or ask the AI to create something...",
    // Use different placeholders depending on the node type:
    // placeholder: ({ node }) => {
    //   if (node.type.name === "heading") {
    //     return "What's the title?";
    //   }

    //   return "Can you add some further context?";
    // },
  }),
  Color.configure({ types: [TextStyleKit.name, ListItem.name] }),
  TextStyleKit,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  Underline,
  Paragraph,
  Text,
  TaskList,
  TextAlign,
  TaskItem.configure({
    nested: true,
  }),
  Document,
  Paragraph,
  Text,
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent);
    },
  }).configure({
    lowlight,
    defaultLanguage: null,
  }),
  Heading,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Document,
  Paragraph,
  Text,
  Highlight.configure({ multicolor: true }),
  Link,
  CharacterCount,
  SlashCommand,
  Image,
  ResizableImage,
  LineHeight,
];

export const TipTapEditor = ({
  initialDocument,
  initialDocumentContent,
  initialReferences = [],
}) => {
  const [editorContent, setEditorContent] = useState(
    initialDocument?.content || initialDocumentContent || ""
  );
  const [addRefContext, setAddRefContext] = useState(initialReferences);
  const isInitialMount = useRef(true);

  const sanitizeContent = (content) => {
    return content.replace(/\0/g, "").replace(/\\0/g, "\\\\0").replace(/\\/g, "\\\\");
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setEditorContent(sanitizeContent(initialDocument?.content || initialDocumentContent || ""));
      setAddRefContext(initialReferences);
    }
  }, [initialDocument, initialDocumentContent, initialReferences]);

  return (
    <div className="prose prose-headings:mt-0 max-w-none">
      <EditorProvider
        slotBefore={
          <MenuBar
            initialDocument={initialDocument ?? { content: "", ...{} }}
            initialReferences={addRefContext}
          />
        }
        extensions={extensions}
        content={editorContent}
      ></EditorProvider>
    </div>
  );
};
