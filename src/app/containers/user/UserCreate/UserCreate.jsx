import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, TextInput, Select, Group, Title, Text } from '@mantine/core';
import { Plus, UserPlus } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { createUser } from '@/app/services/userService';
import { fetchRoles } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const UserCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Student', phone: '', bio: '' });

  useEffect(() => {
    const loadRoles = async () => { try { const roles = await fetchRoles(); setRoleOptions(roles.map((r) => ({ value: r.name, label: r.name }))); } catch (err) { setRoleOptions([{ value: 'Student', label: 'Student' }, { value: 'Instructor', label: 'Instructor' }, { value: 'Team Lead', label: 'Team Lead' }, { value: 'Administrator', label: 'Administrator' }]); } };
    loadRoles();
  }, []);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) { setError('Please fill in all required fields.'); return; }
    try { setLoading(true); setError(null); const user = await createUser(formData); addToast(`${formData.firstName} ${formData.lastName} created successfully`, 'success'); navigate(`/users/${user.id}`); }
    catch (err) { setError(err.message || 'Failed to create user.'); } finally { setLoading(false); }
  };
  const handleCancel = () => navigate('/users');

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md"><Anchor onClick={() => navigate('/users')}>Users</Anchor><span>Create User</span></Breadcrumbs>
        <Paper className='user-form-segment' p="lg" radius="md" withBorder>
          <Title order={3} mb={4}><UserPlus size={20} color="#33a163" /> Create New User</Title>
          <Text c="dimmed" size="sm" mb="md">Fill in the details below to create a new user account.</Text>
          {error && <Text c="red" size="sm" mb="sm"><Plus size={14} /> {error}</Text>}
          <form onSubmit={handleSubmit}>
            <Group grow>
              <TextInput label="First Name *" placeholder="John" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
              <TextInput label="Last Name *" placeholder="Doe" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
            </Group>
            <TextInput label="Email *" placeholder="john@example.com" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required mt="sm" />
            <TextInput label="Password *" placeholder="Min 6 characters" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required mt="sm" />
            <Select label="Role" data={roleOptions} value={formData.role} onChange={(v) => handleChange('role', v)} mt="sm" />
            <TextInput label="Phone" placeholder="+1 555-0100" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} mt="sm" />
            <Group justify="flex-end" mt="lg">
              <Button variant="default" onClick={handleCancel} disabled={loading}>Cancel</Button>
              <Button type="submit" loading={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
            </Group>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default UserCreate;
