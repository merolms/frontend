import { Undo2, Redo2 } from "lucide-react";
import type { Editor } from "@tiptap/react";

import { ToolbarGroup } from "../components/ToolbarGroup";

interface UndoRedoGroupProps {
  editor: Editor;
}

export function UndoRedoGroup({ editor }: UndoRedoGroupProps) {
  const canUndo = editor.can().chain().focus().undo().run();
  const canRedo = editor.can().chain().focus().redo().run();

  return (
    <ToolbarGroup hasDivider>
      <button
        type="button"
        className="editor-tool-btn"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!canUndo}
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="editor-tool-btn"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!canRedo}
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </ToolbarGroup>
  );
}

export default UndoRedoGroup;
