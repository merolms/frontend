import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button, Icon, Divider } from 'semantic-ui-react';
import './RichTextEditor.scss';

const RichTextEditor = ({ value = '', onChange, placeholder = 'Start writing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  const handleImageInsert = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleLinkInsert = useCallback(() => {
    const url = prompt('Enter link URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, title, children }) => (
    <Button
      size='mini'
      compact
      onClick={onClick}
      active={active}
      type='button'
      title={title}
      style={{ marginRight: 2 }}
    >
      {children}
    </Button>
  );

  return (
    <div className='rich-text-editor'>
      {/* Toolbar */}
      <div className='rte-toolbar'>
        <div className='rte-toolbar-group'>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title='Bold (Ctrl+B)'>
            <Icon name='bold' />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title='Italic (Ctrl+I)'>
            <Icon name='italic' />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title='Strikethrough'>
            <Icon name='strikethrough' />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title='Inline Code'>
            <Icon name='code' />
          </ToolbarButton>
        </div>

        <div className='rte-toolbar-divider' />

        <div className='rte-toolbar-group'>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title='Heading 2'>
            <Icon name='header' />2
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title='Heading 3'>
            <Icon name='header' />3
          </ToolbarButton>
        </div>

        <div className='rte-toolbar-divider' />

        <div className='rte-toolbar-group'>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title='Bullet List'>
            <Icon name='list ul' />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title='Numbered List'>
            <Icon name='list ol' />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title='Quote'>
            <Icon name='quote left' />
          </ToolbarButton>
        </div>

        <div className='rte-toolbar-divider' />

        <div className='rte-toolbar-group'>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title='Code Block'>
            <Icon name='file code' />
          </ToolbarButton>
          <ToolbarButton onClick={handleLinkInsert} active={editor.isActive('link')} title='Insert Link'>
            <Icon name='linkify' />
          </ToolbarButton>
          <ToolbarButton onClick={handleImageInsert} title='Insert Image'>
            <Icon name='image' />
          </ToolbarButton>
        </div>

        <div className='rte-toolbar-divider' />

        <div className='rte-toolbar-group'>
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title='Undo'>
            <Icon name='undo' />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title='Redo'>
            <Icon name='redo' />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title='Clear Formatting'>
            <Icon name='eraser' />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className='rte-content'>
        <EditorContent editor={editor} />
      </div>

      {/* Footer info */}
      <div className='rte-footer'>
        <span style={{ fontSize: 11, color: '#aaa' }}>
          {editor.storage.characterCount?.characters?.() || 0} characters
        </span>
        <span style={{ fontSize: 11, color: '#aaa' }}>
          HTML editing supported
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
