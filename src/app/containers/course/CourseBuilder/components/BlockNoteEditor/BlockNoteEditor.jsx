import React, { useCallback, useEffect, useRef, useState } from 'react';
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

import { t } from '@/styles/theme';
import { uploadBlockMedia } from '@/app/services/blockService';
import { ArrowConversionExtension } from "./extensions/ArrowConversionExtension";

const PARA_PROPS = {
  textAlignment: 'left',
  backgroundColor: 'default',
  textColor: 'default',
};

const toInlineContent = (content) => {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content
      .filter((c) => c && c.type)
      .map((c) =>
        c.type === 'text'
          ? { type: 'text', text: c.text || '', styles: c.styles || {} }
          : c
      );
  }
  if (typeof content === 'string' && content.trim()) {
    return [{ type: 'text', text: content, styles: {} }];
  }
  if (typeof content === 'object' && content.text) {
    return [{ type: 'text', text: content.text, styles: content.styles || {} }];
  }
  return [];
};

const sanitizeBlocks = (content) => {
  if (!content) return [];
  let parsed;
  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    if (typeof content === 'string' && content.trim()) {
      return [{ type: 'paragraph', props: { ...PARA_PROPS }, content: [{ type: 'text', text: content, styles: {} }], children: [] }];
    }
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((b) => b && b.type)
    .map((b) => ({
      type: b.type,
      props: b.props || { ...PARA_PROPS },
      content: toInlineContent(b.content),
      children: Array.isArray(b.children) ? sanitizeBlocks(b.children) : [],
    }));
};

const countWords = (blocks) => {
  let n = 0;
  const walk = (bs) => {
    for (const b of bs) {
      if (Array.isArray(b.content)) {
        for (const c of b.content) {
          if (c.type === 'text' && c.text) n += c.text.trim().split(/\s+/).filter(Boolean).length;
        }
      }
      if (Array.isArray(b.children)) walk(b.children);
    }
  };
  walk(blocks);
  return n;
};

const resolveTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};

const BlockNoteEditorComponent = ({ lessonId, content, contentRef, onChange, onSave, onStatsChange, theme }) => {
  const [effectiveTheme, setEffectiveTheme] = useState(resolveTheme());
  const isSyncing = useRef(false);
  const [words, setWords] = useState(0);
  const [ready, setReady] = useState(false);
  const [pasteError, setPasteError] = useState(false);
  const loadedContent = useRef(null);

  const uploadFile = useCallback(
    async (file) => uploadBlockMedia(lessonId, `temp_${Date.now()}`, file),
    [lessonId]
  );

  const editor = useCreateBlockNote({
    uploadFile,
    _tiptapOptions: {
      extensions: [ArrowConversionExtension],
    },
  });

  // Keep effectiveTheme in sync with <html data-theme> changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setEffectiveTheme(resolveTheme());
    const observer = new MutationObserver(handler);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    mq.addEventListener('change', handler);
    return () => { observer.disconnect(); mq.removeEventListener('change', handler); };
  }, []);

  useEffect(() => { if (editor) setReady(true); }, [editor]);

  // BlockNoteView onChange — fires on every document change
  const handleChange = useCallback(() => {
    if (isSyncing.current) return;
    if (pasteError) return; // skip processing during paste error recovery
    try {
      const doc = editor.document;
      const wc = countWords(doc);
      const json = JSON.stringify(doc);
      setWords(wc);
      contentRef.current = json;
      onStatsChange?.({ words: wc });
      onChange?.(json);
    } catch (e) {
      console.error('handleChange error:', e);
    }
  }, [editor, onChange, onStatsChange, contentRef, pasteError]);

  // Sync content from parent into the editor.
  // Runs when: lesson changes, editor mounts, parent content prop changes.
  useEffect(() => {
    if (!editor || !ready) return;
    const raw = contentRef.current || content || '';
    if (loadedContent.current === raw) return;
    loadedContent.current = raw;
    const blocks = sanitizeBlocks(raw);
    if (JSON.stringify(editor.document) === JSON.stringify(blocks)) return;
    isSyncing.current = true;
    try {
      if (blocks.length > 0) {
        editor.replaceBlocks(editor.document, blocks);
        setWords(countWords(blocks));
      } else {
        editor.replaceBlocks(editor.document, []);
        setWords(0);
      }
    } catch (e) { console.error('Sync failed:', e); }
    isSyncing.current = false;
  }, [lessonId, editor, ready, content]);

  // Catch paste errors from BlockNote's internal pasteHTML handler.
  // When pasting external HTML, BlockNote can throw "Invalid array length"
  // inside its serializeBlocks/blocksToFullHTML chain.
  useEffect(() => {
    const onError = (event) => {
      if (event.error instanceof RangeError && event.error.message.includes('Invalid array length')) {
        console.warn('Caught paste error, suppressing re-throw');
        event.preventDefault();
        setPasteError(true);
        // Reset paste error flag after a tick so user can continue editing
        setTimeout(() => setPasteError(false), 100);
      }
    };
    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); onSave?.(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave]);

  if (!editor) return null;

  return (
    <div>
      <BlockNoteView editor={editor} theme={effectiveTheme} onChange={handleChange}  />
<div
  className="bn-statusbar"
  style={{
    borderTop: `1px solid ${t('border-primary')}`,
    background: t('surface-secondary'),
    color: t('text-secondary'),
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '12px',
    backdropFilter: 'blur(10px)',
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ color: t('text-primary'), fontWeight: 600 }}>
      {words.toLocaleString()} {words === 1 ? 'word' : 'words'}
    </span>

    <span style={{ opacity: 0.4 }}>•</span>

    <span>
      ~{Math.max(1, Math.ceil(words / 200))} min read
    </span>
  </div>

  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: t('text-muted'),
      whiteSpace: 'nowrap',
    }}
  >
    <span>Type</span>

    <kbd
      style={{
        background: t('surface-primary'),
        border: `1px solid ${t('border-secondary')}`,
        borderRadius: '5px',
        padding: '1px 5px',
        fontSize: '11px',
        color: t('text-primary'),
      }}
    >
      /
    </kbd>

    <span>•</span>

    <kbd
      style={{
        background: t('surface-primary'),
        border: `1px solid ${t('border-secondary')}`,
        borderRadius: '5px',
        padding: '1px 5px',
        fontSize: '11px',
        color: t('text-primary'),
      }}
    >
      ⌘S
    </kbd>
  </div>
</div>
    </div>
  );
};

export default BlockNoteEditorComponent;
