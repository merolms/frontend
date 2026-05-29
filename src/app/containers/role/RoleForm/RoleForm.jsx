import React, { useState, useEffect } from 'react';

import { t } from '@/styles/theme';
import { TextInput, Textarea, Button, Stack, Group, ColorSwatch, SimpleGrid, Accordion, Checkbox, Text, Alert } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { permissionCatalog } from '@/app/services/authService';

const ROLE_COLORS = ['red', 'blue', 'purple', 'teal', 'green', 'orange', 'pink', 'yellow', 'brown', 'gray', 'black', 'violet', 'olive', 'cyan'];

const RoleForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Role' }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: ROLE_COLORS[0], permissions: [], ...initialData });
  const [errors, setErrors] = useState({});
  const [expandedDomains, setExpandedDomains] = useState(Object.keys(permissionCatalog));

  useEffect(() => { if (initialData) setFormData({ ...initialData }); }, [initialData]);

  const validate = () => {
    const e = {}; if (!formData.name.trim()) e.name = 'Role name is required'; if (!formData.description.trim()) e.description = 'Description is required'; if (formData.permissions.length === 0) e.permissions = 'Select at least one permission'; setErrors(e); return Object.keys(e).length === 0;
  };
  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const handleChange = (field, value) => { setFormData((prev) => ({ ...prev, [field]: value })); if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null })); };

  const togglePermission = (permKey) => {
    setFormData((prev) => { const perms = prev.permissions.includes(permKey) ? prev.permissions.filter((p) => p !== permKey) : [...prev.permissions, permKey]; return { ...prev, permissions: perms }; });
    if (errors.permissions) setErrors((prev) => ({ ...prev, permissions: null }));
  };

  const toggleDomain = (domainKey) => {
    const domainPerms = permissionCatalog[domainKey].permissions.map((p) => p.key);
    setFormData((prev) => { const allSelected = domainPerms.every((p) => prev.permissions.includes(p)); const perms = allSelected ? prev.permissions.filter((p) => !domainPerms.includes(p)) : [...new Set([...prev.permissions, ...domainPerms])]; return { ...prev, permissions: perms }; });
    if (errors.permissions) setErrors((prev) => ({ ...prev, permissions: null }));
  };

  const getDomainSelectionState = (domainKey) => {
    const domainPerms = permissionCatalog[domainKey].permissions.map((p) => p.key);
    const selectedCount = domainPerms.filter((p) => formData.permissions.includes(p)).length;
    if (selectedCount === 0) return 'none'; if (selectedCount === domainPerms.length) return 'all'; return 'partial';
  };

  const totalSelected = formData.permissions.length;
  const totalAvailable = Object.values(permissionCatalog).reduce((sum, d) => sum + d.permissions.length, 0);

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {Object.keys(errors).length > 0 && <Alert icon={<AlertCircle size={16} />} color="red" size="sm">Please fix the errors below.</Alert>}

        <TextInput label="Role Name" placeholder="e.g., Content Manager" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} required />
        <Textarea label="Description" placeholder="What can this role do?" minRows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} error={errors.description} required />

        <div>
          <Text size="sm" fw={500} mb={4}>Color</Text>
          <Group gap={8}>{ROLE_COLORS.map((color) => (<ColorSwatch key={color} color={color} onClick={() => handleChange('color', color)} style={{ cursor: 'pointer', border: formData.color === color ? `3px solid ${t('text-primary')}` : `1px solid ${t('border-primary')}` }} size={28} />))}</Group>
        </div>

        <div>
          <Group justify="space-between" mb={8}>
            <Text size="sm" fw={600}>Permissions {errors.permissions && <span style={{ color: 'red', fontSize: 11, fontWeight: 400 }}>{errors.permissions}</span>}</Text>
            <Text size="xs" c="dimmed">{totalSelected} of {totalAvailable} selected</Text>
          </Group>

          <Accordion variant="contained" value={expandedDomains} onChange={setExpandedDomains} multiple>
            {Object.entries(permissionCatalog).map(([domainKey, domain]) => {
              const state = getDomainSelectionState(domainKey);
              return (
                <Accordion.Item key={domainKey} value={domainKey}>
                  <Accordion.Control>
                    <Group justify="space-between">
                      <Group gap={8}><Text size="sm" fw={500}>{domain.label}</Text><Text size="xs" c="dimmed">({domain.permissions.filter((p) => formData.permissions.includes(p.key)).length}/{domain.permissions.length})</Text></Group>
                      <Button size="xs" variant={state === 'all' ? 'filled' : state === 'partial' ? 'light' : 'default'} color={state === 'all' ? 'green' : state === 'partial' ? 'yellow' : 'gray'} onClick={(e) => { e.stopPropagation(); toggleDomain(domainKey); }}>
                        {state === 'all' ? 'All' : state === 'partial' ? 'Partial' : 'None'}
                      </Button>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <SimpleGrid cols={2}>
                      {domain.permissions.map((perm) => (
                        <Checkbox key={perm.key} label={perm.label} checked={formData.permissions.includes(perm.key)} onChange={() => togglePermission(perm.key)} size="sm" />
                      ))}
                    </SimpleGrid>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>

        <Group justify="flex-end" mt="md">
          {onCancel && <Button variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>}
          <Button type="submit" loading={loading}>{submitLabel}</Button>
        </Group>
      </Stack>
    </form>
  );
};

export default RoleForm;
