import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { Button } from "./button";

const RichTextEditor = ({ value, onChange, placeholder = "Enter content...", rows = 4 }) => {
  const editor = useEditor({
    extensions: [StarterKit, UnderlineExtension],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[100px] p-3 text-xs focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border-border bg-bg-surface rounded-md border">
      {/* Toolbar */}
      <div className="border-border border-b bg-bg-surface-hover flex gap-1 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("bold") ? "bg-bg-surface-active" : ""}`}
          title="Bold"
        >
          <Bold size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("italic") ? "bg-bg-surface-active" : ""}`}
          title="Italic"
        >
          <Italic size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("underline") ? "bg-bg-surface-active" : ""}`}
          title="Underline"
        >
          <Underline size={14} />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("bulletList") ? "bg-bg-surface-active" : ""}`}
          title="Bullet List"
        >
          <List size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("orderedList") ? "bg-bg-surface-active" : ""}`}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
      
      <style>{`
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
