import React, { useState, useEffect } from 'react';
import { TextInput, Textarea, Select, Button, FileButton, Group, Stack, Image, Text, Paper } from '@mantine/core';
import { ImageIcon, Save, Trash2 } from 'lucide-react';
import { fetchCategories } from '@/app/services/categoryService';
import UnsplashPicker from '@/app/containers/course/components/UnsplashPicker';

const tagOptions = [
  'javascript', 'react', 'python', 'css', 'html', 'nodejs', 'typescript',
  'machine-learning', 'data-science', 'design', 'ui', 'ux', 'devops',
  'cloud', 'aws', 'docker', 'api', 'database', 'security',
].map((tag) => ({ value: tag, label: tag }));

const CourseForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Course' }) => {
  const [formData, setFormData] = useState({ title: '', description: '', category: '', tags: [], coverImage: '', ...initialData });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  useEffect(() => {
    if (initialData) setFormData({ ...initialData });
    fetchCategories({ status: 'active' }).then((cats) => {
      setCategoryOptions(cats.map((c) => ({ value: c.name, label: c.name })));
    }).catch(() => {});
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Course title is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <form onSubmit={handleSubmit} className='course-form'>
      <Stack gap="sm">
        {Object.keys(errors).length > 0 && <Paper p="sm" withBorder><Text size="sm" c="red">Please fix the errors below.</Text></Paper>}

        <TextInput label="Course Title" placeholder="e.g., Advanced React Patterns" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} error={errors.title} required />
        <Textarea label="Description" placeholder="What will students learn?" minRows={4} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} error={errors.description} required />
        <Select label="Category" placeholder="Select a category" data={categoryOptions} value={formData.category} onChange={(v) => handleChange('category', v)} error={errors.category} required searchable />
        <Select label="Tags" placeholder="Add tags to help discovery" data={tagOptions} value={formData.tags} onChange={(v) => handleChange('tags', v)} searchable multiple />

        <div>
          <Text size="sm" fw={500} mb={4}>Cover ImageIcon</Text>
          <Group>
            <TextInput placeholder="https://example.com/cover.jpg" value={formData.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} style={{ flex: 1 }} />
            <Button variant="default" leftSection={<ImageIcon size={14} />} onClick={() => setUnsplashOpen(true)} disabled={loading}>Unsplash</Button>
          </Group>
          {formData.coverImage && (
            <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
              <ImageIcon src={formData.coverImage} radius="sm" height={180} fit="cover" />
              <Button size="xs" color="red" variant="filled" onClick={() => handleChange('coverImage', '')} style={{ position: 'absolute', top: 4, right: 4 }}><Trash2 size={12} /></Button>
            </div>
          )}
        </div>

        <UnsplashPicker
          open={unsplashOpen}
          onClose={() => setUnsplashOpen(false)}
          onSelect={(url) => { handleChange('coverImage', url); setUnsplashOpen(false); }}
          initialQuery={formData.title || 'education'}
        />

        <Group justify="flex-end" mt="md">
          {onCancel && <Button variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>}
          <Button type="submit" loading={loading} leftSection={<Save size={14} />}>{submitLabel}</Button>
        </Group>
      </Stack>
    </form>
  );
};

export default CourseForm;
