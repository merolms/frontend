import React, { useState, useEffect } from 'react';
import { TextInput, Textarea, Select, Button, Stack, ColorInput, Group, Text, SimpleGrid, ActionIcon } from '@mantine/core';
import { AlertCircle } from 'lucide-react';

const TEAM_COLORS = ['#1976d2', '#7b1fa2', '#e65100', '#33a163', '#c62828', '#00838f', '#f57f17', '#4a148c', '#2185d0', '#d32f2f', '#388e3c', '#f57c00'];

const colorOptions = TEAM_COLORS.map((color) => ({ value: color, label: color }));

const TeamForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Team' }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: TEAM_COLORS[0] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setFormData({ name: initialData.name || '', description: initialData.description || '', color: initialData.color || TEAM_COLORS[0], status: initialData.status !== undefined ? initialData.status : 1 });
  }, [initialData]);

  const validate = () => { const e = {}; if (!formData.name.trim()) e.name = 'Team name is required'; setErrors(e); return Object.keys(e).length === 0; };
  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const handleChange = (field, value) => { setFormData((prev) => ({ ...prev, [field]: value })); if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null })); };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {Object.keys(errors).length > 0 && <Text c="red" size="sm"><AlertCircle size={14} /> Please fix the errors below.</Text>}
        <TextInput label="Team Name" name="name" placeholder="Engineering Team" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} />
        <Textarea label="Description" name="description" placeholder="What is this team about?" minRows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />

        <div>
          <Text size="sm" fw={500} mb={4}>Color</Text>
          <Select data={colorOptions} value={formData.color} onChange={(v) => handleChange('color', v)} name="color" />
          <Group gap={8} mt={8}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: formData.color, border: '1px solid #e8e8e8' }} />
            <Text size="sm" c="dimmed" ff="monospace">{formData.color}</Text>
          </Group>
        </div>

        <Group justify="flex-end" mt="md">
          {onCancel && <Button variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>}
          <Button type="submit" loading={loading}>{submitLabel}</Button>
        </Group>
      </Stack>
    </form>
  );
};

export default TeamForm;
