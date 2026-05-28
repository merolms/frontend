import React from 'react';

const Btn = ({ active, disabled, title, onClick, children }) => (
  <button
    className={`lh-toolbar-btn${active ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
    title={title}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const Sep = () => <span className="lh-toolbar-divider" />;

const EditorToolbar = ({ editor }) => {
  if (!editor) return <div className="lh-toolbar lh-toolbar--empty" />;

  return (
    <div className="lh-toolbar lh-toolbar--topbar">
      <Btn title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>↩</Btn>
      <Btn title="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>↪</Btn>
      <Sep />
      <Btn active={editor.isActive('bold')} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></Btn>
      <Btn active={editor.isActive('italic')} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></Btn>
      <Btn active={editor.isActive('strike')} title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>
      <Btn active={editor.isActive('code')} title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}>{'<>'}</Btn>
      <Sep />
      <Btn active={editor.isActive('paragraph')} title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}>¶</Btn>
      <Btn active={editor.isActive('heading', { level: 1 })} title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Btn>
      <Btn active={editor.isActive('heading', { level: 2 })} title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
      <Btn active={editor.isActive('heading', { level: 3 })} title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
      <Sep />
      <Btn active={editor.isActive('bulletList')} title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}>≡</Btn>
      <Btn active={editor.isActive('orderedList')} title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</Btn>
      <Btn active={editor.isActive('blockquote')} title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</Btn>
      <Btn active={editor.isActive('codeBlock')} title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</Btn>
    </div>
  );
};

export default EditorToolbar;
