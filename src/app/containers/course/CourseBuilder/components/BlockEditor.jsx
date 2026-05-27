import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Segment, Icon, Button, Input, TextArea, Dropdown, Label,
  Popup, Confirm, Message, Dimmer, Loader,
} from 'semantic-ui-react';
import {
  BLOCK_TYPES, BLOCK_TYPE_LABELS, BLOCK_TYPE_ICONS,
} from '@/app/services/blockService';
import RichTextEditor from './RichTextEditor';
import './BlockEditor.scss';

// ─── Slash Command Menu ─────────────────────────────────────
const SLASH_COMMANDS = [
  { type: BLOCK_TYPES.TEXT, label: 'Text', icon: 'file text', description: 'Plain text paragraph' },
  { type: BLOCK_TYPES.HEADING, label: 'Heading', icon: 'heading', description: 'Section heading' },
  { type: BLOCK_TYPES.IMAGE, label: 'Image', icon: 'image', description: 'Upload or embed an image' },
  { type: BLOCK_TYPES.VIDEO, label: 'Video', icon: 'video', description: 'Upload or embed a video' },
  { type: BLOCK_TYPES.AUDIO, label: 'Audio', icon: 'volume up', description: 'Upload or embed audio' },
  { type: BLOCK_TYPES.QUIZ, label: 'Quiz', icon: 'question circle', description: 'Add a quiz block' },
  { type: BLOCK_TYPES.CODE, label: 'Code', icon: 'code', description: 'Code snippet' },
  { type: BLOCK_TYPES.ATTACHMENT, label: 'Attachment', icon: 'paperclip', description: 'File attachment' },
  { type: BLOCK_TYPES.AI_SUMMARY, label: 'AI Summary', icon: 'magic', description: 'AI-generated summary' },
  { type: BLOCK_TYPES.EMBED, label: 'Embed', icon: 'linkify', description: 'Embed external content' },
];

// ─── AI Action Menu ─────────────────────────────────────────
const AI_ACTIONS = [
  { key: 'generate', label: 'Generate Content', icon: 'magic', description: 'Generate new content from prompt' },
  { key: 'improve', label: 'Improve Writing', icon: 'edit', description: 'Rewrite for clarity and style' },
  { key: 'summarize', label: 'Summarize', icon: 'compress', description: 'Create a summary of this content' },
  { key: 'expand', label: 'Expand', icon: 'expand', description: 'Add more detail to this content' },
  { key: 'quiz', label: 'Generate Quiz', icon: 'question circle', description: 'Create quiz from content' },
];

// ─── Block Type Dropdown Options ────────────────────────────
const blockTypeOptions = Object.entries(BLOCK_TYPE_LABELS).map(([value, text]) => ({
  key: value, value, text, icon: BLOCK_TYPE_ICONS[value],
}));

// ─── Individual Block Renderer ──────────────────────────────
const BlockItem = ({
  block, index, isSelected, onSelect, onUpdate, onDelete, onMoveUp, onMoveDown,
  onAddAfter, onAIAction, isFirst, isLast, dragHandlers,
}) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const contentRef = useRef(null);

  const filteredCommands = SLASH_COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(slashFilter.toLowerCase()) ||
    cmd.type.toLowerCase().includes(slashFilter.toLowerCase())
  );

  const handleContentKeyDown = (e) => {
    if (e.key === '/' && !showSlashMenu) {
      // Only trigger slash command at start of empty block
      setShowSlashMenu(true);
      setSlashFilter('');
      e.preventDefault();
    }
    if (showSlashMenu && e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const handleSlashSelect = (cmd) => {
    onUpdate(block.id, { type: cmd.type, title: '', content: '', data: null });
    setShowSlashMenu(false);
  };

  const handleAIAction = async (action) => {
    setAiLoading(true);
    setShowAIMenu(false);
    try {
      await onAIAction(block.id, action.key, aiPrompt);
    } catch (err) {
      console.error('AI action failed:', err);
    } finally {
      setAiLoading(false);
      setAiPrompt('');
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case BLOCK_TYPES.HEADING:
        return (
          <input
            className='block-content-input block-heading-input'
            value={block.title || ''}
            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
            placeholder='Heading...'
            onKeyDown={handleContentKeyDown}
          />
        );

      case BLOCK_TYPES.TEXT:
        return (
          <div className='block-text-wrapper' ref={contentRef}>
            <RichTextEditor
              value={block.content || ''}
              onChange={(html) => onUpdate(block.id, { content: html })}
              placeholder='Type / for commands, or start writing...'
              onKeyDown={handleContentKeyDown}
            />
            {showSlashMenu && (
              <div className='slash-menu'>
                <div className='slash-menu-header'>
                  <Input
                    size='mini'
                    placeholder='Filter...'
                    value={slashFilter}
                    onChange={(e) => setSlashFilter(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className='slash-menu-items'>
                  {filteredCommands.map(cmd => (
                    <div
                      key={cmd.type}
                      className='slash-menu-item'
                      onClick={() => handleSlashSelect(cmd)}
                    >
                      <Icon name={cmd.icon} />
                      <div className='slash-menu-item-text'>
                        <span className='slash-menu-item-label'>{cmd.label}</span>
                        <span className='slash-menu-item-desc'>{cmd.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.CODE:
        return (
          <div className='block-code-editor'>
            <div className='block-code-header'>
              <Input
                size='mini'
                placeholder='Language (e.g., javascript)'
                value={block.data ? (JSON.parse(block.data).language || '') : ''}
                onChange={(e) => {
                  const data = { language: e.target.value };
                  onUpdate(block.id, { data: JSON.stringify(data) });
                }}
                className='block-code-lang'
              />
            </div>
            <TextArea
              className='block-code-textarea'
              value={block.content || ''}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder='Write code here...'
              rows={6}
            />
          </div>
        );

      case BLOCK_TYPES.IMAGE:
        return (
          <div className='block-media-editor'>
            {block.content ? (
              <div className='block-image-preview'>
                <img src={block.content} alt={block.title || 'Image'} />
                <Button size='mini' onClick={() => onUpdate(block.id, { content: '' })}>
                  Replace
                </Button>
              </div>
            ) : (
              <div className='block-media-upload'>
                <Icon name='image' size='large' color='grey' />
                <p>Click to upload or paste image URL</p>
                <Input
                  size='small'
                  placeholder='Image URL'
                  onChange={(e) => {
                    if (e.target.value) onUpdate(block.id, { content: e.target.value });
                  }}
                />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.VIDEO:
        return (
          <div className='block-media-editor'>
            {block.content ? (
              <div className='block-video-preview'>
                <video src={block.content} controls width='100%' />
                <Button size='mini' onClick={() => onUpdate(block.id, { content: '' })}>
                  Replace
                </Button>
              </div>
            ) : (
              <div className='block-media-upload'>
                <Icon name='video' size='large' color='grey' />
                <p>Click to upload or paste video URL</p>
                <Input
                  size='small'
                  placeholder='Video URL'
                  onChange={(e) => {
                    if (e.target.value) onUpdate(block.id, { content: e.target.value });
                  }}
                />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.AUDIO:
        return (
          <div className='block-media-editor'>
            {block.content ? (
              <div className='block-audio-preview'>
                <audio src={block.content} controls />
                <Button size='mini' onClick={() => onUpdate(block.id, { content: '' })}>
                  Replace
                </Button>
              </div>
            ) : (
              <div className='block-media-upload'>
                <Icon name='volume up' size='large' color='grey' />
                <p>Click to upload or paste audio URL</p>
                <Input
                  size='small'
                  placeholder='Audio URL'
                  onChange={(e) => {
                    if (e.target.value) onUpdate(block.id, { content: e.target.value });
                  }}
                />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.QUIZ:
        return (
          <div className='block-quiz-editor'>
            <Icon name='question circle' size='large' color='grey' />
            <p>Quiz Builder</p>
            <p style={{ fontSize: 12, color: '#aaa' }}>
              Configure quiz questions and answers.
            </p>
            <Button size='small' disabled>
              <Icon name='plus' /> Add Question
            </Button>
          </div>
        );

      case BLOCK_TYPES.ATTACHMENT:
        return (
          <div className='block-attachment-editor'>
            <Icon name='paperclip' size='large' color='grey' />
            <p>File Attachment</p>
            <Input
              size='small'
              placeholder='File URL or upload'
              value={block.content || ''}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            />
          </div>
        );

      case BLOCK_TYPES.AI_SUMMARY:
        return (
          <div className='block-ai-summary'>
            <div className='block-ai-summary-header'>
              <Icon name='magic' color='purple' />
              <span>AI Summary</span>
            </div>
            <RichTextEditor
              value={block.content || ''}
              onChange={(html) => onUpdate(block.id, { content: html })}
              placeholder='AI-generated summary will appear here...'
            />
          </div>
        );

      case BLOCK_TYPES.EMBED:
        return (
          <div className='block-embed-editor'>
            <Input
              size='small'
              placeholder='Embed URL (YouTube, Vimeo, etc.)'
              value={block.content || ''}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            />
            {block.content && (
              <div className='block-embed-preview'>
                <iframe
                  src={block.content}
                  title='Embed preview'
                  frameBorder='0'
                  allowFullScreen
                  style={{ width: '100%', height: 200 }}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <RichTextEditor
            value={block.content || ''}
            onChange={(html) => onUpdate(block.id, { content: html })}
            placeholder='Start writing...'
          />
        );
    }
  };

  return (
    <div
      className={`block-item ${isSelected ? 'selected' : ''} block-type-${block.type}`}
      onClick={() => onSelect(block.id)}
      {...dragHandlers}
    >
      {/* Block Header / Toolbar */}
      <div className='block-toolbar'>
        <div className='block-toolbar-left'>
          <span className='block-drag-handle' title='Drag to reorder'>
            <Icon name='bars' />
          </span>
          <Label size='mini' color={isSelected ? 'blue' : 'grey'}>
            <Icon name={BLOCK_TYPE_ICONS[block.type] || 'file'} />
            {BLOCK_TYPE_LABELS[block.type] || block.type}
          </Label>
        </div>
        <div className='block-toolbar-right'>
          {!isFirst && (
            <Button icon size='mini' onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }}>
              <Icon name='arrow up' />
            </Button>
          )}
          {!isLast && (
            <Button icon size='mini' onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }}>
              <Icon name='arrow down' />
            </Button>
          )}
          <Popup
            trigger={
              <Button icon size='mini' onClick={(e) => e.stopPropagation()}>
                <Icon name='magic' />
              </Button>}
            content={
              <div className='ai-action-menu'>
                {AI_ACTIONS.map(action => (
                  <Button
                    key={action.key}
                    size='small'
                    basic
                    fluid
                    onClick={() => handleAIAction(action)}
                    disabled={aiLoading}
                  >
                    <Icon name={action.icon} /> {action.label}
                  </Button>
                ))}
              </div>
            }
            on='click'
            position='bottom right'
          />
          <Button icon size='mini' onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}>
            <Icon name='trash' />
          </Button>
        </div>
      </div>

      {/* Block Content */}
      <div className='block-content'>
        {renderBlockContent()}
      </div>

      {/* Add Block Button (appears on hover between blocks) */}
      <div className='block-add-after'>
        <Button icon size='mini' onClick={(e) => { e.stopPropagation(); onAddAfter(block.id); }}>
          <Icon name='plus' />
        </Button>
      </div>

      {/* Delete Confirmation */}
      <Confirm
        open={showDeleteConfirm}
        content='Delete this block? This cannot be undone.'
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => { setShowDeleteConfirm(false); onDelete(block.id); }}
      />

      {/* AI Loading */}
      {aiLoading && (
        <Dimmer active inverted>
          <Loader inverted>Generating...</Loader>
        </Dimmer>
      )}
    </div>
  );
};

// ─── Main BlockEditor Component ─────────────────────────────
const BlockEditor = ({
  blocks: initialBlocks = [],
  onBlocksChange,
  onSave,
  onAutosave,
  onAIGenerate,
  saving = false,
  autosaving = false,
  error = null,
  successMsg = null,
}) => {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const autosaveTimerRef = useRef(null);

  // Sync with parent
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  // Notify parent of changes
  const notifyChange = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    if (onBlocksChange) onBlocksChange(newBlocks);
  }, [onBlocksChange]);

  // Autosave debounce
  const triggerAutosave = useCallback((newBlocks) => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      if (onAutosave) onAutosave(newBlocks);
    }, 2000);
  }, [onAutosave]);

  // ─── Block Operations ─────────────────────────────────────

  const handleBlockUpdate = (blockId, updates) => {
    const newBlocks = blocks.map(b => b.id === blockId ? { ...b, ...updates, updatedAt: Date.now() } : b);
    notifyChange(newBlocks);
    triggerAutosave(newBlocks);
  };

  const handleBlockDelete = (blockId) => {
    const newBlocks = blocks.filter(b => b.id !== blockId).map((b, i) => ({ ...b, order: i }));
    notifyChange(newBlocks);
    if (selectedBlockId === blockId) setSelectedBlockId(null);
    triggerAutosave(newBlocks);
  };

  const handleBlockMove = (blockId, direction) => {
    const idx = blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    newBlocks.forEach((b, i) => { b.order = i; });
    notifyChange(newBlocks);
    triggerAutosave(newBlocks);
  };

  const handleAddBlock = (afterBlockId, type = 'text') => {
    const idx = afterBlockId ? blocks.findIndex(b => b.id === afterBlockId) + 1 : blocks.length;
    const newBlock = {
      id: `temp_${Date.now()}`,
      lessonId: blocks[0]?.lessonId || 0,
      type,
      title: type === 'heading' ? 'New Heading' : '',
      content: '',
      data: null,
      order: idx,
      status: 'draft',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    const newBlocks = [...blocks];
    newBlocks.splice(idx, 0, newBlock);
    newBlocks.forEach((b, i) => { b.order = i; });
    notifyChange(newBlocks);
    setSelectedBlockId(newBlock.id);
    triggerAutosave(newBlocks);
  };

  const handleAIAction = async (blockId, action, prompt) => {
    if (!onAIGenerate) return;
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const result = await onAIGenerate(block, action, prompt);
    if (result) {
      handleBlockUpdate(blockId, {
        content: result.content || block.content,
        data: result.data || block.data,
      });
    }
  };

  // ─── Drag and Drop ────────────────────────────────────────

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newBlocks = [...blocks];
      const [moved] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(dragOverIndex, 0, moved);
      newBlocks.forEach((b, i) => { b.order = i; });
      notifyChange(newBlocks);
      triggerAutosave(newBlocks);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ─── Render ───────────────────────────────────────────────

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className='block-editor'>
      {/* Status Messages */}
      {error && (
        <Message error onDismiss={() => {}} style={{ marginBottom: 12 }}>
          <Icon name='warning circle' /> {error}
        </Message>
      )}
      {successMsg && (
        <Message success onDismiss={() => {}} style={{ marginBottom: 12 }}>
          <Icon name='check circle' /> {successMsg}
        </Message>
      )}
      {autosaving && (
        <div className='autosave-indicator'>
          <Icon name='save' /> Autosaving...
        </div>
      )}

      {/* Block List */}
      <div className='block-list'>
        {blocks.length === 0 ? (
          <div className='block-editor-empty'>
            <Icon name='plus circle' size='large' color='grey' />
            <p>No blocks yet. Click the button below to add your first block.</p>
            <Button primary onClick={() => handleAddBlock(null, 'text')}>
              <Icon name='plus' /> Add Block
            </Button>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={dragOverIndex === index ? 'drag-over' : ''}
            >
              <BlockItem
                block={block}
                index={index}
                isSelected={selectedBlockId === block.id}
                onSelect={(id) => setSelectedBlockId(id)}
                onUpdate={handleBlockUpdate}
                onDelete={handleBlockDelete}
                onMoveUp={(id) => handleBlockMove(id, 'up')}
                onMoveDown={(id) => handleBlockMove(id, 'down')}
                onAddAfter={handleAddBlock}
                onAIAction={handleAIAction}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
              />
            </div>
          ))
        )}
      </div>

      {/* Add Block Button (bottom) */}
      {blocks.length > 0 && (
        <div className='block-add-bottom'>
          <Dropdown
            button
            floating
            labeled
            icon='plus'
            className='icon'
            text='Add Block'
            options={blockTypeOptions.map(opt => ({
              ...opt,
              onClick: () => handleAddBlock(null, opt.value),
            }))}
          />
        </div>
      )}

      {/* Save Button */}
      {onSave && (
        <div className='block-editor-actions'>
          <Button primary onClick={() => onSave(blocks)} loading={saving}>
            <Icon name='save' /> Save All Blocks
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlockEditor;
