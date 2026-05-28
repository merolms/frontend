import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Textarea, Select, Button, Stack, ColorInput, Group } from '@mantine/core';
import { IconPencil, IconPlus, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { getCategoryColorOptions, getCategoryIconOptions } from '@/app/services/categoryService';

const CategoryForm = ({ category = null, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: getCategoryColorOptions()[0], icon: 'folder' });
  const [errors, setErrors] = useState({});
  const isEditing = !!category;

  useEffect(() => {
    if (category) setForm({ name: category.name || '', slug: category.slug || '', description: category.description || '', color: category.color || getCategoryColorOptions()[0], icon: category.icon || 'folder' });
  }, [category]);

  const handleChange = (field, value) => { setForm((prev) => ({ ...prev, [field]: value })); if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null })); };
  const handleNameChange = (e) => { const val = e.target.value; const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); setForm((prev) => ({ ...prev, name: val, slug })); if (errors.name) setErrors((prev) => ({ ...prev, name: null })); };
  const validate = () => { const e = {}; if (!form.name.trim()) e.name = 'Category name is required'; if (!form.slug.trim()) e.slug = 'Slug is required'; setErrors(e); return Object.keys(e).length === 0; };
  const handleSubmit = async () => { if (!validate()) return; try { await onSubmit(form); } catch (err) { setErrors({ submit: err.message }); } };

  const colorOptions = getCategoryColorOptions().map((c) => ({ value: c, label: c }));
  const iconOptions = getCategoryIconOptions.map((ic) => ({ value: ic, label: ic }));

  return (
    <Modal opened={true} onClose={onClose} title={isEditing ? 'Edit Category' : 'Create Category'} size="sm" closeOnClickOutside={!loading}>
      <Stack>
        <TextInput label="Name" placeholder="e.g., Web Development" value={form.name} onChange={handleNameChange} error={errors.name} required />
        <TextInput label="Slug" placeholder="e.g., web-development" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} error={errors.slug} required />
        <Textarea label="Description" placeholder="What kind of courses belong in this category?" minRows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        <Select label="Color" data={colorOptions} value={form.color} onChange={(v) => handleChange('color', v)} />
        <Select label="Icon" data={iconOptions} value={form.icon} onChange={(v) => handleChange('icon', v)} searchable />
        {errors.submit && <TextInput value={styles.submit} disabled />}
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} disabled={loading} leftSection={<IconX size={14} />}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} leftSection={isEditing ? <IconDeviceFloppy size={14} /> : <IconPlus size={14} />}>{isEditing ? 'Save Changes' : 'Create Category'}</Button>
      </Group>
    </Modal>
  );
};

export default CategoryForm;
