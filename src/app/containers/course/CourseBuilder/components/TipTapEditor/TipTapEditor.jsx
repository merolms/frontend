import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { SlashCommandsExtension } from './SlashCommands';
import DragHandle from './DragHandle';
import { lowlight } from './editorLowlight';
import { ImageBlock } from './extensions/ImageBlock';
import { VideoBlock } from './extensions/VideoBlock';
import { CalloutBlock } from './extensions/CalloutBlock';
import { QuizBlock } from './extensions/QuizBlock';
import Toolbar from './Toolbar';
import 'tippy.js/dist/tippy.css';
import './TipTapEditor.scss';

const TipTapEditor = ({
  content,
  onChange,
  onEditorReady,
  placeholder = 'Type "/" for commands…',
  editable = true,
  fullPage = false,
  lessonId = null,
}) => {
  const editor = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: { HTMLAttributes: { class: 'lh-bullet-list' } },
        orderedList: { HTMLAttributes: { class: 'lh-ordered-list' } },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      ImageBlock.configure({ lessonId }),
      VideoBlock.configure({ lessonId }),
      CalloutBlock,
      QuizBlock,
      ...(editable ? [SlashCommandsExtension, DragHandle] : []),
    ],
    content: content || '',
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML());
    },
    onCreate: ({ editor: ed }) => {
      onEditorReady?.(ed);
    },
  });

  // Expose editor instance when it becomes available (e.g. after async create)
  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor]);

  // Sync content when switching lessons (key prop handles most of this)
  useEffect(() => {
    if (!editor || !content) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content]);

  return (
    <div className={`lh-editor${fullPage ? ' lh-editor--fullpage' : ''}`}>
      {editable && !fullPage && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="lh-editor-content" />
    </div>
  );
};

export default TipTapEditor;
