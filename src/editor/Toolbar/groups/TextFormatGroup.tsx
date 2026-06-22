import { Bold, Italic, Strikethrough, Underline as UnderlineIcon } from "lucide-react";
import type { Editor } from "@tiptap/react";

import { ToolbarGroup } from "../components/ToolbarGroup";

interface TextFormatGroupProps {
  editor: Editor;
}

export function TextFormatGroup({ editor }: TextFormatGroupProps) {
  return (
    <ToolbarGroup hasDivider>
      <button
        type="button"
        className={`editor-tool-btn ${editor.isActive("bold") ? "is-active" : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`editor-tool-btn ${editor.isActive("italic") ? "is-active" : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`editor-tool-btn ${editor.isActive("underline") ? "is-active" : ""}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
        aria-label="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`editor-tool-btn ${editor.isActive("strike") ? "is-active" : ""}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>
    </ToolbarGroup>
  );
}

export default TextFormatGroup;
