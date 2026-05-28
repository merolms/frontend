import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { uploadBlockMedia } from '@/app/services/blockService';
import './BlockNoteEditor.scss';


const emptyDoc = () => [];

const parseContent = (content) => {
  if (!content) return emptyDoc();
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    if (typeof parsed === 'string' && parsed.trim()) {
      return [{ type: 'paragraph', props: {}, content: [{ type: 'text', text: parsed, styles: {} }], children: [] }];
    }
    if (parsed?.content) {
      const text = typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content);
      return [{ type: 'paragraph', props: {}, content: [{ type: 'text', text, styles: {} }], children: [] }];
    }
    return emptyDoc();
  } catch {
    if (typeof content === 'string' && content.trim()) {
      return [{ type: 'paragraph', props: {}, content: [{ type: 'text', text: content, styles: {} }], children: [] }];
    }
    return emptyDoc();
  }
};

const countWords = (blocks) => {
  let n = 0;
  const walk = (bs) => {
    for (const b of bs) {
      if (Array.isArray(b.content)) {
        for (const c of b.content) {
          if (c.type === 'text' && c.text) {
            n += c.text.trim().split(/\s+/).filter(Boolean).length;
          }
        }
      }
      if (Array.isArray(b.children)) walk(b.children);
    }
  };
  walk(blocks);
  return n;
};

const BlockNoteEditorComponent = ({
  lessonId,
  content,
  onChange,
  onSave,
  onStatsChange,
}) => {
  const changeTimer = useRef(null);
  const [words, setWords] = useState(0);

  const initialContent = useMemo(() => parseContent(content), []); // eslint-disable-line

  const uploadFile = useCallback(
    async (file) => uploadBlockMedia(lessonId, `temp_${Date.now()}`, file),
    [lessonId]
  );

  const editor = useCreateBlockNote({ initialContent, uploadFile });

  // Sync content when switching lessons (content prop changes)
  useEffect(() => {
    if (!editor) return;
    const next = parseContent(content);
    try {
      if (JSON.stringify(editor.document) !== JSON.stringify(next)) {
        editor.replaceBlocks(editor.document, next);
        const wc = countWords(next);
        setWords(wc);
        onStatsChange?.({ words: wc });
      }
    } catch { /* ignore */ }
  }, [content, editor]); // eslint-disable-line

  useEffect(() => () => clearTimeout(changeTimer.current), []);

  const handleChange = useCallback(() => {
    if (!editor) return;
    clearTimeout(changeTimer.current);
    changeTimer.current = setTimeout(() => {
      try {
        onChange?.(JSON.stringify(editor.document));
        const wc = countWords(editor.document);
        setWords(wc);
        onStatsChange?.({ words: wc });
      } catch { /* ignore */ }
    }, 300);
  }, [editor, onChange, onStatsChange]);

  // Keyboard shortcut: Ctrl+S / Cmd+S → save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave]);

  if (!editor) return null;

  return (
    <div className="bn-wrapper">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
        className="bn-view"
      />

      {/* Status bar */}
      <div className="bn-statusbar">
        <span className="bn-statusbar-stat">{words} {words === 1 ? 'word' : 'words'}</span>
        <span className="bn-statusbar-dot">·</span>
        <span className="bn-statusbar-stat">~{Math.max(1, Math.ceil(words / 200))} min read</span>
        <span className="bn-statusbar-hint">
          Type <kbd>/</kbd> for blocks &nbsp;·&nbsp; <kbd>⌘S</kbd> to save
        </span>
      </div>
    </div>
  );
};

export default BlockNoteEditorComponent;
