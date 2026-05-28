import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import SlashCommandsList from './SlashCommandsList';

const COMMANDS = [
  {
    id: 'paragraph',
    title: 'Paragraph',
    description: 'Plain text',
    icon: '¶',
    keywords: ['paragraph', 'text', 'plain', 'p'],
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Large heading',
    icon: 'H1',
    keywords: ['h1', 'heading', 'title'],
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Medium heading',
    icon: 'H2',
    keywords: ['h2', 'heading', 'subtitle'],
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Small heading',
    icon: 'H3',
    keywords: ['h3', 'heading'],
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bullet',
    title: 'Bullet List',
    description: 'Unordered list',
    icon: '•',
    keywords: ['bullet', 'list', 'ul', 'unordered'],
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'ordered',
    title: 'Numbered List',
    description: 'Ordered list',
    icon: '1.',
    keywords: ['numbered', 'ordered', 'list', 'ol'],
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'blockquote',
    title: 'Quote',
    description: 'Block quotation',
    icon: '"',
    keywords: ['quote', 'blockquote'],
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code',
    title: 'Code Block',
    description: 'Monospace code',
    icon: '</>',
    keywords: ['code', 'codeblock', 'pre'],
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'hr',
    title: 'Divider',
    description: 'Horizontal rule',
    icon: '—',
    keywords: ['hr', 'divider', 'rule', 'line'],
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Upload an image',
    icon: '🖼',
    keywords: ['image', 'photo', 'picture', 'upload'],
    command: (editor) => editor.chain().focus().insertContent({ type: 'blockImage' }).run(),
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Upload a video',
    icon: '🎬',
    keywords: ['video', 'movie', 'upload', 'mp4'],
    command: (editor) => editor.chain().focus().insertContent({ type: 'blockVideo' }).run(),
  },
  {
    id: 'callout',
    title: 'Callout',
    description: 'Info, warning, tip or error block',
    icon: '💡',
    keywords: ['callout', 'info', 'warning', 'tip', 'note', 'alert'],
    command: (editor) => editor.chain().focus().insertContent({ type: 'callout', attrs: { type: 'info' }, content: [] }).run(),
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Interactive multiple-choice quiz',
    icon: '❓',
    keywords: ['quiz', 'question', 'test', 'multiple choice'],
    command: (editor) => editor.chain().focus().insertContent({ type: 'blockQuiz', attrs: { questions: [] } }).run(),
  },
];

function filterCommands(query) {
  if (!query) return COMMANDS;
  const q = query.toLowerCase();
  return COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
  );
}

export const SlashCommandsExtension = Extension.create({
  name: 'slashCommands',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return $from.parent.type.name !== 'codeBlock';
        },
        items: ({ query }) => filterCommands(query),
        render: () => {
          let component = null;
          let popup = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandsList, {
                props: { items: props.items, command: (item) => props.command(item) },
                editor: props.editor,
              });
              if (!props.clientRect) return;
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                animation: 'shift-away',
                maxWidth: 'none',
                theme: 'light-border',
              });
            },
            onUpdate: (props) => {
              component?.updateProps({
                items: props.items,
                command: (item) => props.command(item),
              });
              if (props.clientRect) {
                popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect });
              }
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props.event) ?? false;
            },
            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
