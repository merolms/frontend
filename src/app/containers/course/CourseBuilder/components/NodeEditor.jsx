import React, { useState } from 'react';
import { Form, Input, Select, TextArea, Button, Label, Icon } from 'semantic-ui-react';

const nodeTypeLabels = {
  section: { label: 'Section', icon: 'folder', color: 'blue' },
  module: { label: 'Module', icon: 'cubes', color: 'teal' },
  lesson: { label: 'Lesson', icon: 'file alternate', color: 'green' },
  topic: { label: 'Topic', icon: 'bookmark', color: 'grey' },
};

const lessonTypes = [
  { key: 'text', text: 'Text / HTML', icon: 'file text', value: 'text' },
  { key: 'video', text: 'Video', icon: 'video', value: 'video' },
  { key: 'audio', text: 'Audio', icon: 'volume up', value: 'audio' },
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

  return (
    <div className='node-editor'>
      <div className='node-editor-header'>
        <Label color={typeInfo.color} size='medium'>
          <Icon name={typeInfo.icon} /> {typeInfo.label}
        </Label>
        <span className='node-editor-id' style={{ fontSize: 11, color: '#aaa' }}>ID: {node.id}</span>
      </div>

      <Form loading={saving}>
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
              <label>Type</label>
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

        {/* Lesson-specific fields */}
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

            {/* Content editor based on type */}
            {form.type === 'text' && (
              <Form.Field>
                <label>Content (HTML)</label>
                <TextArea
                  value={form.content?.html || ''}
                  onChange={(e) => update('content', { ...form.content, html: e.target.value })}
                  placeholder='<h2>Title</h2><p>Your content here...</p>'
                  style={{ minHeight: 100, fontFamily: 'monospace', fontSize: 12 }}
                />
              </Form.Field>
            )}

            {(form.type === 'video' || form.type === 'audio') && (
              <>
                <Form.Field>
                  <label>{form.type === 'video' ? 'Video' : 'Audio'} URL</label>
                  <Input
                    value={form.content?.videoUrl || form.content?.audioUrl || ''}
                    onChange={(e) => {
                      const key = form.type === 'video' ? 'videoUrl' : 'audioUrl';
                      update('content', { ...form.content, [key]: e.target.value });
                    }}
                    placeholder='https://example.com/media.mp4'
                  />
                </Form.Field>
                <Form.Field>
                  <label>Transcript</label>
                  <TextArea
                    value={form.content?.transcript || ''}
                    onChange={(e) => update('content', { ...form.content, transcript: e.target.value })}
                    placeholder='Video transcript or notes...'
                    style={{ minHeight: 60 }}
                  />
                </Form.Field>
              </>
            )}

            {form.type === 'pdf' && (
              <Form.Field>
                <label>PDF URL</label>
                <Input
                  value={form.content?.pdfUrl || ''}
                  onChange={(e) => update('content', { ...form.content, pdfUrl: e.target.value })}
                  placeholder='https://example.com/document.pdf'
                />
              </Form.Field>
            )}

            {(form.type === 'quiz' || form.type === 'assignment') && (
              <div className='node-editor-placeholder'>
                <Icon name={form.type === 'quiz' ? 'question circle' : 'edit'} size='large' color='grey' />
                <p>Use the {form.type === 'quiz' ? 'Quiz' : 'Assignment'} builder to configure this content.</p>
              </div>
            )}
          </>
        )}

        {/* Topic content */}
        {nodeType === 'topic' && (
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
            <TextArea
              value={form.content?.html || form.content || ''}
              onChange={(e) => update('content', e.target.value)}
              placeholder='Topic content...'
              style={{ minHeight: 80 }}
            />
          </Form.Field>
        )}

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
