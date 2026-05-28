import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { uploadBlockMedia } from '@/app/services/blockService';
import './BlockNoteEditor.scss';

const emptyDoc = () => [];

// BlockNote requires specific props per block type
const DEFAULT_PARAGRAPH_PROPS = { textAlignment: 'left', backgroundColor: 'default', textColor: 'default' };
const DEFAULT_HEADING_PROPS = { level: 1, textAlignment: 'left', backgroundColor: 'default', textColor: 'default' };

const normalizeProps = (type, props) => {
  if (props && typeof props === 'object' && Object.keys(props).length > 0) return props;
  if (type === 'heading') return { ...DEFAULT_HEADING_PROPS };
  if (type === 'bulletListItem' || type === 'numberedListItem') return { ...DEFAULT_PARAGRAPH_PROPS };
  if (type === 'checkListItem') return { checked: false, ...DEFAULT_PARAGRAPH_PROPS };
  return { ...DEFAULT_PARAGRAPH_PROPS };
};

const normalizeInlineContent = (content) => {
  if (!content) return [];
  // Already an array of proper inline content objects
  if (Array.isArray(content)) {
    return content.filter(c => c && typeof c === 'object' && c.type).map(c => {
      if (c.type === 'text') {
        return { type: 'text', text: c.text || '', styles: c.styles || {} };
      }
      return c;
    });
  }
  // Legacy: content is a plain string
  if (typeof content === 'string' && content.trim()) {
    return [{ type: 'text', text: content, styles: {} }];
  }
  // Legacy: content is an object with .text
  if (typeof content === 'object' && content.text) {
    return [{ type: 'text', text: content.text, styles: content.styles || {} }];
  }
  return [];
};

const sanitizeBlock = (block) => {
  if (!block || typeof block !== 'object') return null;
  if (!block.type || typeof block.type !== 'string') return null;

  const type = block.type;
  const props = normalizeProps(type, block.props);
  const content = normalizeInlineContent(block.content);
  const children = Array.isArray(block.children)
    ? block.children.map(sanitizeBlock).filter(Boolean)
    : [];

  return { type, props, content, children };
};

const parseContent = (content) => {
  if (!content) return emptyDoc();

  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    // BlockNote format: array of blocks
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed.map(sanitizeBlock).filter(Boolean);
      return sanitized.length > 0 ? sanitized : emptyDoc();
    }

    // Plain string
    if (typeof parsed === 'string' && parsed.trim()) {
      return [{ type: 'paragraph', props: { ...DEFAULT_PARAGRAPH_PROPS }, content: [{ type: 'text', text: parsed, styles: {} }], children: [] }];
    }

    // Object with .content field
    if (parsed && typeof parsed === 'object' && parsed.content) {
      const text = typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content);
      if (text.trim()) {
        return [{ type: 'paragraph', props: { ...DEFAULT_PARAGRAPH_PROPS }, content: [{ type: 'text', text, styles: {} }], children: [] }];
      }
    }

    return emptyDoc();
  } catch {
    // JSON parse failed — treat raw string as text
    if (typeof content === 'string' && content.trim()) {
      return [{ type: 'paragraph', props: { ...DEFAULT_PARAGRAPH_PROPS }, content: [{ type: 'text', text: content, styles: {} }], children: [] }];
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

  const initialContent = useMemo(() => {
    try {
      const parsed = parseContent(content);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      console.error('Failed to parse initial content:', e);
      return [];
    }
  }, [content]);

  const uploadFile = useCallback(
    async (file) => uploadBlockMedia(lessonId, `temp_${Date.now()}`, file),
    [lessonId]
  );

  const editor = useCreateBlockNote({ initialContent, uploadFile });

  // Sync content when switching lessons
  useEffect(() => {
    if (!editor) return;
    try {
      const next = parseContent(content);
      if (!Array.isArray(next)) return;
      if (JSON.stringify(editor.document) !== JSON.stringify(next)) {
        editor.replaceBlocks(editor.document, next);
        const wc = countWords(next);
        setWords(wc);
        onStatsChange?.({ words: wc });
      }
    } catch (e) {
      console.error('Failed to sync editor content:', e);
    }
  }, [content, editor, onStatsChange]);

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
