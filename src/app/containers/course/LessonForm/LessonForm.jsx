import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Textarea, Button, Stack, Group } from '@mantine/core';
import { Save, X } from 'lucide-react';

const LessonForm = ({ open, onClose, onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({ title: '', duration: '', content: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({ title: '', duration: '', content: '' });
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

  const handleSubmit = () => { if (validate()) onSubmit(formData); };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const isEditing = !!initialData;

  return (
    <Modal opened={open} onClose={onClose} title={isEditing ? 'Edit Lesson' : 'Create Lesson'} size="lg" closeOnClickOutside={!loading} closeOnEscape={!loading}>
      <Stack gap="sm">
        <TextInput label="Lesson Title" placeholder="Enter a lesson title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} error={errors.title} required />
        <TextInput label="Duration" placeholder="e.g., 30 mins, 1 hour" value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} />
        <Textarea label="Content" placeholder="Lesson content or notes" minRows={5} value={formData.content} onChange={(e) => handleChange('content', e.target.value)} />
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} disabled={loading} leftSection={<X size={14} />}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} leftSection={<Save size={14} />}>{isEditing ? 'Save Changes' : 'Create Lesson'}</Button>
      </Group>
    </Modal>
  );
};

export default LessonForm;
