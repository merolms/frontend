import React, { useState } from 'react';
import { Form, Input, Select, TextArea, Button, Label, Icon, Segment, Divider } from 'semantic-ui-react';
import RichTextEditor from './RichTextEditor';
import VideoEditor from './VideoEditor';
import AudioEditor from './AudioEditor';
import PdfEditor from './PdfEditor';

const nodeTypeLabels = {
  section: { label: 'Section', icon: 'folder', color: 'blue' },
  module: { label: 'Module', icon: 'cubes', color: 'teal' },
  lesson: { label: 'Lesson', icon: 'file alternate', color: 'green' },
  topic: { label: 'Topic', icon: 'bookmark', color: 'grey' },
};

const lessonTypes = [
  { key: 'text', text: 'Text / Article', icon: 'file text', value: 'text' },
  { key: 'video', text: 'Video', icon: 'video', value: 'video' },
  { key: 'audio', text: 'Audio / Podcast', icon: 'volume up', value: 'audio' },
  { key: 'pdf', text: 'PDF Document', icon: 'file pdf', value: 'pdf' },
  { key: 'quiz', text: 'Quiz', icon: 'question circle', value: 'quiz' },
  { key: 'assignment', text: 'Assignment', icon: 'edit', value: 'assignment' },
];

const unlockTypes = [
  { key: null, text: 'None (always available)', value: null },
  { key: 'previous_complete', text: 'After completing previous', value: 'previous_complete' },
  { key: 'quiz_pass', text: 'After passing a quiz', value: 'quiz_pass' },
  { key: 'manual', text: 'Manual unlock only', value: 'manual' },
];

const statusOptions = [
  { key: 'draft', text: 'Draft', value: 'draft' },
  { key: 'published', text: 'Published', value: 'published' },
];

const NodeEditor = ({ node, nodeType, onSave, saving }) => {
  if (!node) {
    return (
      <div className='node-editor-empty'>
        <Icon name='arrow left' size='large' color='grey' />
        <p>Select an item from the structure tree to edit it.</p>
      </div>
    );
  }

  const typeInfo = nodeTypeLabels[nodeType] || nodeTypeLabels.lesson;
  const [form, setForm] = useState({
    title: node.title || '',
    description: node.description || '',
    status: node.status || 'draft',
    type: node.type || 'text',
    duration: node.duration || '',
    isLocked: node.isLocked || false,
    unlockCondition: node.unlockCondition || null,
    points: node.points || 0,
    content: node.content || {},
  });

  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = `${typeInfo.label} title is required`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  // ─── Content Editor Switch ──────────────────────────────────
  const renderContentEditor = () => {
    if (nodeType === 'topic') {
      return (
        <Form.Field>
          <label>Content</label>
          <Form.Group widths='equal' style={{ marginBottom: 8 }}>
            <Select
              options={[
                { key: 'text', text: 'Text', value: 'text' },
                { key: 'video', text: 'Video', value: 'video' },
                { key: 'audio', text: 'Audio', value: 'audio' },
              ]}
              value={form.type}
              onChange={(e, { value }) => update('type', value)}
            />
            <Input
              value={form.duration}
              onChange={(e) => update('duration', e.target.value)}
              placeholder='Duration (e.g., 5 mins)'
            />
          </Form.Group>
          {form.type === 'text' ? (
            <RichTextEditor
              value={form.content?.html || form.content || ''}
              onChange={(html) => update('content', { ...form.content, html })}
              placeholder='Write topic content...'
            />
          ) : (
            <div className='node-editor-placeholder'>
              <Icon name={form.type === 'video' ? 'video' : 'volume up'} size='large' color='grey' />
              <p>Use the lesson editor to configure {form.type} content.</p>
            </div>
          )}
        </Form.Field>
      );
    }

    if (nodeType !== 'lesson') return null;

    switch (form.type) {
      case 'text':
        return (
          <Form.Field>
            <label>Content</label>
            <RichTextEditor
              value={form.content?.html || ''}
              onChange={(html) => update('content', { ...form.content, html })}
              placeholder='Write your lesson content...'
            />
          </Form.Field>
        );

      case 'video':
        return (
          <Form.Field>
            <label>Video Content</label>
            <VideoEditor
              content={form.content}
              onChange={(content) => update('content', content)}
            />
          </Form.Field>
        );

      case 'audio':
        return (
          <Form.Field>
            <label>Audio Content</label>
            <AudioEditor
              content={form.content}
              onChange={(content) => update('content', content)}
            />
          </Form.Field>
        );

      case 'pdf':
        return (
          <Form.Field>
            <label>PDF Document</label>
            <PdfEditor
              content={form.content}
              onChange={(content) => update('content', content)}
            />
          </Form.Field>
        );

      case 'quiz':
        return (
          <div className='node-editor-placeholder'>
            <Icon name='question circle' size='large' color='grey' />
            <p style={{ margin: '8px 0 4px' }}>Quiz Builder</p>
            <p style={{ fontSize: 12, color: '#aaa' }}>
              Create and configure quizzes in the Quiz Builder.
            </p>
            <Button size='small' disabled style={{ marginTop: 8 }}>
              <Icon name='plus' /> Create Quiz
            </Button>
            <p style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
              Quiz builder coming in a future phase
            </p>
          </div>
        );

      case 'assignment':
        return (
          <div className='node-editor-placeholder'>
            <Icon name='edit' size='large' color='grey' />
            <p style={{ margin: '8px 0 4px' }}>Assignment Builder</p>
            <p style={{ fontSize: 12, color: '#aaa' }}>
              Create assignments with instructions and submission requirements.
            </p>
            <Button size='small' disabled style={{ marginTop: 8 }}>
              <Icon name='plus' /> Create Assignment
            </Button>
            <p style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
              Assignment builder coming in a future phase
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='node-editor'>
      <div className='node-editor-header'>
        <Label color={typeInfo.color} size='medium'>
          <Icon name={typeInfo.icon} /> {typeInfo.label}
        </Label>
        <span className='node-editor-id' style={{ fontSize: 11, color: '#aaa' }}>ID: {node.id}</span>
      </div>

      <Form loading={saving}>
        {/* ─── Basic Fields ─────────────────────────────────── */}
        <Form.Field required error={!!errors.title}>
          <label>Title</label>
          <Input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder={`${typeInfo.label} title`}
          />
          {errors.title && <Label basic color='red' pointing>{errors.title}</Label>}
        </Form.Field>

        <Form.Field>
          <label>Description</label>
          <TextArea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder={`Describe this ${typeInfo.label.toLowerCase()}...`}
            style={{ minHeight: 60 }}
          />
        </Form.Field>

        <Form.Group widths='equal'>
          <Form.Field>
            <label>Status</label>
            <Select
              options={statusOptions}
              value={form.status}
              onChange={(e, { value }) => update('status', value)}
            />
          </Form.Field>

          {nodeType === 'lesson' && (
            <Form.Field>
              <label>Content Type</label>
              <Select
                options={lessonTypes}
                value={form.type}
                onChange={(e, { value }) => update('type', value)}
              />
            </Form.Field>
          )}

          {nodeType !== 'topic' && (
            <Form.Field>
              <label>Duration</label>
              <Input
                value={form.duration}
                onChange={(e) => update('duration', e.target.value)}
                placeholder='e.g., 15 mins'
              />
            </Form.Field>
          )}
        </Form.Group>

        {/* ─── Lesson-specific Fields ────────────────────────── */}
        {nodeType === 'lesson' && (
          <>
            <Form.Group widths='equal'>
              <Form.Field>
                <label>Points</label>
                <Input
                  type='number'
                  min={0}
                  value={form.points}
                  onChange={(e) => update('points', parseInt(e.target.value) || 0)}
                />
              </Form.Field>

              <Form.Field>
                <label>Unlock Condition</label>
                <Select
                  options={unlockTypes}
                  value={form.unlockCondition?.type || null}
                  onChange={(e, { value }) => update('unlockCondition', value ? { type: value } : null)}
                />
              </Form.Field>
            </Form.Group>

            <Divider style={{ margin: '20px 0' }} />

            {/* ─── Content Editor ─────────────────────────────── */}
            {renderContentEditor()}
          </>
        )}

        {/* ─── Topic Content ─────────────────────────────────── */}
        {nodeType === 'topic' && (
          <>
            <Divider style={{ margin: '20px 0' }} />
            {renderContentEditor()}
          </>
        )}

        {/* ─── Actions ──────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <Button type='button' onClick={() => onSave(null)}>
            Cancel
          </Button>
          <Button primary onClick={handleSave} loading={saving}>
            <Icon name='save' /> Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NodeEditor;
