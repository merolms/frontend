import React, { useState, useEffect } from 'react';
import { TextInput, Select, Group, Button, Stack, Text, Alert } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { fetchRoles } from '@/app/services/authService';

const UserForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save User' }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: 'Student', phone: '', bio: '', ...initialData });
  const [errors, setErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const loadRoles = async () => { try { const roles = await fetchRoles(); setRoleOptions(roles.map((role) => ({ value: role.name, label: role.name }))); } catch (err) { setRoleOptions([{ value: 'Student', label: 'Student' }, { value: 'Instructor', label: 'Instructor' }, { value: 'Team Lead', label: 'Team Lead' }, { value: 'Administrator', label: 'Administrator' }]); } };
    loadRoles();
  }, []);

  useEffect(() => { if (initialData) setFormData({ ...initialData }); }, [initialData]);

  const validate = () => {
    const e = {}; if (!formData.firstName.trim()) e.firstName = 'First name is required'; if (!formData.lastName.trim()) e.lastName = 'Last name is required'; if (!formData.email.trim()) e.email = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email address'; if (!formData.role) e.role = 'Role is required'; setErrors(e); return Object.keys(e).length === 0;
  };
  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const handleChange = (field, value) => { setFormData((prev) => ({ ...prev, [field]: value })); if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null })); };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {Object.keys(errors).length > 0 && <Alert icon={<AlertCircle size={16} />} color="red" size="sm">Please fix the errors below.</Alert>}
        <Group grow>
          <TextInput label="First Name" placeholder="John" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} error={errors.firstName} required />
          <TextInput label="Last Name" placeholder="Doe" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} error={errors.lastName} required />
        </Group>
        <TextInput label="Email" placeholder="john@example.com" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} required />
        <Select label="Role" placeholder="Select a role" data={roleOptions} value={formData.role} onChange={(v) => handleChange('role', v)} error={errors.role} required />
        <TextInput label="Phone" placeholder="+1 555-0100" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        <TextInput label="Bio" placeholder="Short bio..." value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />
        <Group justify="flex-end">
          {onCancel && <Button variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>}
          <Button type="submit" loading={loading}>{submitLabel}</Button>
        </Group>
      </Stack>
    </form>
  );
};

export default UserForm;
