"use client";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { ResizableImage } from "./extensions/ResizeImage/resizable-image";
import React, { useState, useEffect, useRef } from "react";

import "./editor.css";

import Link from "@tiptap/extension-link";

import Heading from "@tiptap/extension-heading";

import CharacterCount from "@tiptap/extension-character-count";

import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./extensions/CodeBlockComponent";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, all } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";

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
