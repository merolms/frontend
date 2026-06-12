import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "./button";

const RichTextEditor = ({ value, onChange, placeholder = "Enter content...", rows = 4 }) => {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(value || "");

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  const handleChange = () => {
    const newHtml = editorRef.current.innerHTML;
    setHtml(newHtml);
    onChange(newHtml);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleChange();
  };

  return (
    <div className="border-border bg-bg-surface rounded-md border">
      {/* Toolbar */}
      <div className="border-border border-b bg-bg-surface-hover flex gap-1 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("bold")}
          className="h-7 w-7 p-0"
          title="Bold"
        >
          <Bold size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("italic")}
          className="h-7 w-7 p-0"
          title="Italic"
        >
          <Italic size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("underline")}
          className="h-7 w-7 p-0"
          title="Underline"
        >
          <Underline size={14} />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-7 w-7 p-0"
          title="Bullet List"
        >
          <List size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className="h-7 w-7 p-0"
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[100px] p-3 text-xs focus:outline-none"
        style={{ minHeight: `${rows * 24}px` }}
        onInput={handleChange}
        dangerouslySetInnerHTML={{ __html: html }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 1.5rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
