import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, TextArea, Label } from 'semantic-ui-react';

const LessonForm = ({ open, onClose, onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    content: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({ title: '', description: '', duration: '', content: '' });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Lesson title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
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

  const isEditing = !!initialData;

  return (
    <Modal open={open} onClose={onClose} size='large' closeOnDimmerClick={!loading}>
      <Modal.Header>{isEditing ? 'Edit Lesson' : 'Create Lesson'}</Modal.Header>
      <Modal.Content>
        <Form loading={loading} error={Object.keys(errors).length > 0}>
          <Form.Field required error={!!errors.title}>
            <label>Lesson Title</label>
            <Input
              name='title'
              placeholder='Enter a lesson title'
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <Label basic color='red' pointing='left'>{errors.title}</Label>}
          </Form.Field>

          <Form.Field>
            <label>Description</label>
            <TextArea
              name='description'
              placeholder='Describe what this lesson covers'
              style={{ minHeight: 100 }}
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Field>

          <Form.Field>
            <label>Duration</label>
            <Input
              name='duration'
              placeholder='e.g., 30 mins, 1 hour'
              value={formData.duration}
              onChange={handleChange}
            />
          </Form.Field>

          <Form.Field>
            <label>Content</label>
            <TextArea
              name='content'
              placeholder='Lesson content or notes'
              style={{ minHeight: 150 }}
              value={formData.content}
              onChange={handleChange}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button primary onClick={handleSubmit} loading={loading}>
          {isEditing ? 'Save Changes' : 'Create Lesson'}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default LessonForm;
