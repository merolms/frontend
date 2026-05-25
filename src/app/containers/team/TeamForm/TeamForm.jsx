import React, { useState, useEffect } from 'react';
import { Form, Input, TextArea, Button, Message, Label, Dropdown } from 'semantic-ui-react';
import { mockTeamColors } from '../../../services/teamService';

const colorOptions = mockTeamColors.map((color) => ({
  key: color,
  text: color,
  value: color,
  content: (
    <span>
      <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: color, marginRight: 8, verticalAlign: 'middle' }} />
      {color}
    </span>
  ),
}));

const TeamForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Team' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: mockTeamColors[0],
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Team name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e, { name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <Form onSubmit={handleSubmit} loading={loading} error={Object.keys(errors).length > 0}>
      {Object.keys(errors).length > 0 && (
        <Message error size='small'>
          <p>Please fix the errors below.</p>
        </Message>
      )}

      <Form.Field required error={!!errors.name}>
        <label>Team Name</label>
        <Input
          name='name'
          placeholder='e.g., Team Alpha'
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <Label basic color='red' pointing='left'>{errors.name}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.description}>
        <label>Description</label>
        <TextArea
          name='description'
          placeholder='What is this team about?'
          style={{ minHeight: 100 }}
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <Label basic color='red' pointing='left'>{errors.description}</Label>}
      </Form.Field>

      <Form.Field>
        <label>Team Color</label>
        <Dropdown
          name='color'
          selection
          options={colorOptions}
          value={formData.color}
          onChange={handleChange}
        />
        <div style={{ marginTop: 8 }}>
          <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: 4, background: formData.color, border: '1px solid #ddd' }} />
          <span style={{ marginLeft: 8, color: '#888', fontSize: '12px' }}>Preview</span>
        </div>
      </Form.Field>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        {onCancel && (
          <Button type='button' onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type='submit' primary loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
};

export default TeamForm;
