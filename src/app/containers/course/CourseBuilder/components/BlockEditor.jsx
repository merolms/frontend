import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon, Input, Confirm } from 'semantic-ui-react';
import { BLOCK_TYPES } from '@/app/services/blockService';
import TipTapEditor from './TipTapEditor/TipTapEditor';
import './BlockEditor.scss';

// ─── Slash commands ──────────────────────────────────────────
const SLASH_ITEMS = [
  { type: BLOCK_TYPES.TEXT,       icon: '¶',    label: 'Text',        desc: 'Plain paragraph' },
  { type: BLOCK_TYPES.HEADING,    icon: 'H1',   label: 'Heading 1',   desc: 'Large heading' },
  { type: 'heading2',             icon: 'H2',   label: 'Heading 2',   desc: 'Medium heading' },
  { type: 'heading3',             icon: 'H3',   label: 'Heading 3',   desc: 'Small heading' },
  { type: BLOCK_TYPES.CODE,       icon: '</>',  label: 'Code',        desc: 'Code snippet' },
  { type: BLOCK_TYPES.IMAGE,      icon: '🖼',   label: 'Image',       desc: 'Upload or embed' },
  { type: BLOCK_TYPES.VIDEO,      icon: '▶',    label: 'Video',       desc: 'Upload or embed' },
  { type: BLOCK_TYPES.AUDIO,      icon: '🎵',   label: 'Audio',       desc: 'Upload audio' },
  { type: BLOCK_TYPES.QUIZ,       icon: '?',    label: 'Quiz',        desc: 'Multiple-choice quiz' },
  { type: BLOCK_TYPES.ATTACHMENT, icon: '📎',   label: 'Attachment',  desc: 'File attachment' },
  { type: BLOCK_TYPES.EMBED,      icon: '🔗',   label: 'Embed',       desc: 'Embed a URL' },
];

function makeBlock(type = BLOCK_TYPES.TEXT) {
  return { id: `temp_${Date.now()}_${Math.random()}`, type, title: '', content: '', data: '' };
}

// ─── Slash Menu ──────────────────────────────────────────────
function SlashMenu({ query, onSelect, onClose, anchorRef }) {
  const [sel, setSel] = useState(0);
  const items = SLASH_ITEMS.filter(
    (i) => !query || i.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => setSel(0), [query]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (s + 1) % items.length); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSel((s) => (s - 1 + items.length) % items.length); }
      if (e.key === 'Enter')     { e.preventDefault(); if (items[sel]) onSelect(items[sel]); }
      if (e.key === 'Escape')    onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items, sel, onSelect, onClose]);

  if (!items.length) return null;

  return (
    <div className="nb-slash-menu">
      {items.map((item, i) => (
        <button
          key={item.type}
          className={`nb-slash-item${i === sel ? ' is-selected' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
          onMouseEnter={() => setSel(i)}
        >
          <span className="nb-slash-icon">{item.icon}</span>
          <span className="nb-slash-text">
            <span className="nb-slash-label">{item.label}</span>
            <span className="nb-slash-desc">{item.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Single block row ────────────────────────────────────────
function BlockRow({ block, index, isFirst, isLast, onUpdate, onDelete, onAdd, onMediaUpload, isDragging }) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging: isSelfDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSelfDragging ? 0.35 : 1,
  };

  const [showSlash, setShowSlash]   = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashTriggerIdx, setSlashTriggerIdx] = useState(-1); // caret pos when / typed
  const [showGutter, setShowGutter] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const textareaRef = useRef(null);
  const fileRef     = useRef(null);

  // Auto-grow textarea
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => { autoResize(); }, [block.content]);

  // Textarea keydown — slash menu + Enter/Backspace
  const onKeyDown = (e) => {
    if (showSlash) return; // slash menu intercepts

    if (e.key === '/') {
      const ta = textareaRef.current;
      if (ta && (ta.value === '' || ta.selectionStart === 0)) {
        setSlashTriggerIdx(ta.selectionStart);
        setSlashQuery('');
        setShowSlash(true);
        e.preventDefault();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAdd(index + 1);
    }

    if (e.key === 'Backspace' && (block.content === '' && block.title === '')) {
      e.preventDefault();
      if (index > 0) onDelete(block.id);
    }
  };

  const onTextChange = (e) => {
    const val = e.target.value;
    onUpdate(block.id, { content: val });
    autoResize();
    if (showSlash) {
      setSlashQuery(val.slice(slashTriggerIdx + 1));
    }
  };

  const handleSlashSelect = (item) => {
    setShowSlash(false);
    const normalized = item.type === 'heading2'
      ? { type: BLOCK_TYPES.HEADING, data: JSON.stringify({ level: 2 }) }
      : item.type === 'heading3'
      ? { type: BLOCK_TYPES.HEADING, data: JSON.stringify({ level: 3 }) }
      : { type: item.type };
    onUpdate(block.id, { ...normalized, content: '', title: '' });
  };

  const triggerUpload = (accept) => {
    if (!fileRef.current) return;
    fileRef.current.accept = accept;
    fileRef.current.value = '';
    fileRef.current.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !onMediaUpload) return;
    setUploading(true);
    try {
      const url = await onMediaUpload(block.id, file);
      if (url) onUpdate(block.id, { content: url });
    } finally {
      setUploading(false);
    }
  };

  // ── Block content renderers ──────────────────────────────
  const renderContent = () => {
    switch (block.type) {
      case BLOCK_TYPES.HEADING: {
        const lvl = (() => { try { return JSON.parse(block.data || '{}').level || 1; } catch { return 1; } })();
        const cls  = ['', 'nb-h1', 'nb-h2', 'nb-h3'][lvl] || 'nb-h1';
        return (
          <textarea
            ref={textareaRef}
            className={`nb-textarea ${cls}`}
            value={block.title || ''}
            placeholder={`Heading ${lvl}`}
            rows={1}
            onChange={(e) => { onUpdate(block.id, { title: e.target.value }); autoResize(); }}
            onKeyDown={onKeyDown}
          />
        );
      }

      case BLOCK_TYPES.TEXT:
        return (
          <div className="nb-text-wrap">
            <TipTapEditor
              content={block.content || ''}
              onChange={(html) => onUpdate(block.id, { content: html })}
              placeholder='Type "/" for commands, or start writing…'
            />
            {showSlash && (
              <SlashMenu
                query={slashQuery}
                onSelect={handleSlashSelect}
                onClose={() => setShowSlash(false)}
              />
            )}
          </div>
        );

      case BLOCK_TYPES.CODE:
        return (
          <div className="nb-code-block">
            <div className="nb-code-lang">
              <Input
                size="mini"
                placeholder="Language"
                value={block.title || ''}
                onChange={(e) => onUpdate(block.id, { title: e.target.value })}
              />
            </div>
            <textarea
              className="nb-code-textarea"
              value={block.content || ''}
              placeholder="// code here…"
              rows={5}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              spellCheck={false}
            />
          </div>
        );

      case BLOCK_TYPES.IMAGE:
        return (
          <div className="nb-media-block">
            {block.content ? (
              <div className="nb-media-preview">
                <img src={block.content} alt={block.title || 'Image'} />
                <button className="nb-media-remove" onClick={() => onUpdate(block.id, { content: '' })}>
                  <Icon name="times" />
                </button>
              </div>
            ) : (
              <div className="nb-media-upload" onClick={() => triggerUpload('image/*')}>
                <Icon name="image" size="large" />
                <span>{uploading ? 'Uploading…' : 'Click to upload image'}</span>
                <span className="nb-media-hint">or paste a URL below</span>
                <Input
                  size="small"
                  placeholder="https://…"
                  value={block.content || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.VIDEO:
        return (
          <div className="nb-media-block">
            {block.content ? (
              <div className="nb-media-preview nb-media-preview--video">
                <video src={block.content} controls style={{ maxWidth: '100%' }} />
                <button className="nb-media-remove" onClick={() => onUpdate(block.id, { content: '' })}>
                  <Icon name="times" />
                </button>
              </div>
            ) : (
              <div className="nb-media-upload" onClick={() => triggerUpload('video/*')}>
                <Icon name="video" size="large" />
                <span>{uploading ? 'Uploading…' : 'Click to upload video'}</span>
                <Input
                  size="small"
                  placeholder="Video URL"
                  value={block.content || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.AUDIO:
        return (
          <div className="nb-media-block">
            {block.content ? (
              <div className="nb-media-preview">
                <audio src={block.content} controls style={{ width: '100%' }} />
                <button className="nb-media-remove" onClick={() => onUpdate(block.id, { content: '' })}>
                  <Icon name="times" />
                </button>
              </div>
            ) : (
              <div className="nb-media-upload" onClick={() => triggerUpload('audio/*')}>
                <Icon name="volume up" size="large" />
                <span>{uploading ? 'Uploading…' : 'Click to upload audio'}</span>
                <Input
                  size="small"
                  placeholder="Audio URL"
                  value={block.content || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.QUIZ:
        return <QuizEditor block={block} onUpdate={onUpdate} />;

      case BLOCK_TYPES.EMBED:
        return (
          <div className="nb-embed-block">
            <Input
              fluid
              placeholder="Embed URL (YouTube, Vimeo, etc.)"
              value={block.content || ''}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            />
            {block.content && (
              <div className="nb-embed-preview">
                <iframe src={block.content} title="embed" frameBorder="0" allowFullScreen />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.ATTACHMENT:
        return (
          <div className="nb-media-block">
            {block.content ? (
              <a className="nb-attachment-link" href={block.content} target="_blank" rel="noreferrer">
                <Icon name="paperclip" /> {block.title || 'Download attachment'}
              </a>
            ) : (
              <div className="nb-media-upload" onClick={() => triggerUpload('*/*')}>
                <Icon name="paperclip" size="large" />
                <span>{uploading ? 'Uploading…' : 'Click to attach a file'}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <textarea
            ref={textareaRef}
            className="nb-textarea"
            value={block.content || ''}
            placeholder="Type something…"
            rows={1}
            onChange={onTextChange}
            onKeyDown={onKeyDown}
          />
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`nb-row${showGutter ? ' nb-row--hover' : ''}`}
      onMouseEnter={() => setShowGutter(true)}
      onMouseLeave={() => setShowGutter(false)}
    >
      {/* Hidden file input */}
      <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile} />

      {/* Left gutter: drag + add */}
      <div className="nb-gutter">
        <button
          className="nb-gutter-btn nb-add-btn"
          title="Add block below"
          onClick={() => onAdd(index + 1)}
        >+</button>
        <div
          ref={setActivatorNodeRef}
          className="nb-gutter-btn nb-drag-handle"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >⠿</div>
      </div>

      {/* Block content */}
      <div className="nb-content">
        {renderContent()}
      </div>

      {/* Delete (shown on hover, far right) */}
      <button
        className="nb-delete-btn"
        title="Delete block"
        onClick={() => setConfirmDel(true)}
      >
        <Icon name="times" />
      </button>

      <Confirm
        open={confirmDel}
        size="mini"
        content="Delete this block?"
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => { setConfirmDel(false); onDelete(block.id); }}
      />
    </div>
  );
}

// ─── Quiz editor ─────────────────────────────────────────────
function QuizEditor({ block, onUpdate }) {
  const quiz = (() => { try { return JSON.parse(block.data) || { questions: [] }; } catch { return { questions: [] }; } })();
  const save = (q) => onUpdate(block.id, { data: JSON.stringify(q) });
  const addQ  = () => save({ ...quiz, questions: [...quiz.questions, { id: Date.now(), question: '', options: ['','','',''], correctIndex: 0 }] });
  const delQ  = (i) => save({ ...quiz, questions: quiz.questions.filter((_, j) => j !== i) });
  const updQ  = (i, f, v) => save({ ...quiz, questions: quiz.questions.map((q, j) => j === i ? { ...q, [f]: v } : q) });
  const updOpt = (qi, oi, v) => save({ ...quiz, questions: quiz.questions.map((q, j) => {
    if (j !== qi) return q;
    const options = [...q.options]; options[oi] = v; return { ...q, options };
  }) });

  return (
    <div className="nb-quiz">
      {quiz.questions.length === 0 && <p className="nb-quiz-empty">No questions yet.</p>}
      {quiz.questions.map((q, qi) => (
        <div key={q.id || qi} className="nb-quiz-q">
          <div className="nb-quiz-q-row">
            <span className="nb-quiz-q-num">Q{qi + 1}</span>
            <input className="nb-quiz-q-input" placeholder={`Question ${qi + 1}`} value={q.question}
              onChange={(e) => updQ(qi, 'question', e.target.value)} />
            <button className="nb-quiz-del" onClick={() => delQ(qi)}>×</button>
          </div>
          {(q.options || []).map((opt, oi) => (
            <div key={oi} className="nb-quiz-opt">
              <input type="radio" checked={q.correctIndex === oi} onChange={() => updQ(qi, 'correctIndex', oi)} />
              <input className="nb-quiz-opt-input" placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                value={opt} onChange={(e) => updOpt(qi, oi, e.target.value)} />
            </div>
          ))}
        </div>
      ))}
      <button className="nb-quiz-add-btn" onClick={addQ}>+ Add Question</button>
    </div>
  );
}

// ─── Main BlockEditor ─────────────────────────────────────────
const BlockEditor = ({ blocks, onBlocksChange, onSave, onAutosave, onMediaUpload, saving, autosaving }) => {
  const [activeId, setActiveId] = useState(null);
  const autosaveTimer = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Ensure at least one block
  const ensuredBlocks = blocks.length === 0 ? [makeBlock()] : blocks;

  useEffect(() => {
    if (blocks.length === 0) onBlocksChange([makeBlock()]);
  }, []);

  const scheduleAutosave = (updated) => {
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => onAutosave?.(updated), 2000);
  };

  const updateBlock = useCallback((id, patch) => {
    const updated = blocks.map((b) => b.id === id ? { ...b, ...patch } : b);
    onBlocksChange(updated);
    scheduleAutosave(updated);
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((id) => {
    const updated = blocks.filter((b) => b.id !== id);
    const final = updated.length === 0 ? [makeBlock()] : updated;
    onBlocksChange(final);
    scheduleAutosave(final);
  }, [blocks, onBlocksChange]);

  const addBlock = useCallback((atIndex, type = BLOCK_TYPES.TEXT) => {
    const nb = makeBlock(type);
    const updated = [...blocks];
    updated.splice(atIndex, 0, nb);
    onBlocksChange(updated);
    scheduleAutosave(updated);
  }, [blocks, onBlocksChange]);

  const onDragStart = ({ active }) => setActiveId(active.id);

  const onDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const updated = arrayMove(blocks, oldIdx, newIdx);
    onBlocksChange(updated);
    scheduleAutosave(updated);
  };

  const activeBlock = blocks.find((b) => b.id === activeId);

  return (
    <div className="nb-editor">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <SortableContext items={ensuredBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {ensuredBlocks.map((block, i) => (
            <BlockRow
              key={block.id}
              block={block}
              index={i}
              isFirst={i === 0}
              isLast={i === ensuredBlocks.length - 1}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
              onAdd={addBlock}
              onMediaUpload={onMediaUpload}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeBlock && (
            <div className="nb-drag-overlay">
              <span className="nb-drag-overlay-type">{activeBlock.type}</span>
              <span className="nb-drag-overlay-content">
                {activeBlock.title || activeBlock.content || '…'}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add block at end */}
      <button className="nb-add-end" onClick={() => addBlock(ensuredBlocks.length)}>
        <Icon name="plus circle" /> Add block
      </button>
    </div>
  );
};

export default BlockEditor;
