import React, { useState, useEffect } from 'react';

import { t } from '@/styles/theme';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, TextInput, Select, Group, Title, Text, Loader } from '@mantine/core';
import { AlertCircle, Pencil, Plus } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchUserById, updateUser } from '@/app/services/userService';
import { fetchRoles } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: 'Student', phone: '', bio: '', status: 1 });

  useEffect(() => {
    const loadRoles = async () => { try { const roles = await fetchRoles(); setRoleOptions(roles.map((r) => ({ value: r.name, label: r.name }))); } catch (err) { setRoleOptions([{ value: 'Student', label: 'Student' }, { value: 'Instructor', label: 'Instructor' }]); } };
    loadRoles();
  }, []);

  useEffect(() => {
    const loadUser = async () => { try { setFetching(true); const data = await fetchUserById(id); setUser(data); setFormData({ firstName: data.firstName || '', lastName: data.lastName || '', email: data.email || '', role: data.role || 'Student', phone: data.phone || '', bio: data.bio || '', status: data.status !== undefined ? data.status : 1 }); } catch (err) { setError('Failed to load user data.'); } finally { setFetching(false); } };
    loadUser();
  }, [id]);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => { e.preventDefault(); try { setLoading(true); setError(null); const updated = await updateUser(id, formData); addToast(`${formData.firstName} ${formData.lastName} updated successfully`, 'success'); navigate(`/users/${id}`); } catch (err) { setError(err.message || 'Failed to update user.'); } finally { setLoading(false); } };
  const handleCancel = () => navigate(`/users/${id}`);

  if (fetching) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" mt={40}><Loader /><Title order={4}>Loading...</Title></Paper></div></div>);

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md"><Anchor onClick={() => navigate('/users')}>Users</Anchor><Anchor onClick={() => navigate(`/users/${id}`)}>{user?.firstName} {user?.lastName}</Anchor><span>Edit</span></Breadcrumbs>
        <Paper className='user-form-segment' p="lg" radius="md" withBorder>
          <Title order={3} mb={4}><Pencil size={20} color={t('accent')} /> Edit User</Title>
          <Text c="dimmed" size="sm" mb="md">Update the user details below.</Text>
          {error && <Text c="red" size="sm" mb="sm"><Plus size={14} /> {error}</Text>}
          <form onSubmit={handleSubmit}>
            <Group grow>
              <TextInput label="First Name *" placeholder="John" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
              <TextInput label="Last Name *" placeholder="Doe" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
            </Group>
            <TextInput label="Email *" placeholder="john@example.com" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required mt="sm" />
            <Group grow mt="sm">
              <Select label="Role" data={roleOptions} value={formData.role} onChange={(v) => handleChange('role', v)} />
              <Select label="Status" data={[{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }]} value={formData.status} onChange={(v) => handleChange('status', v)} />
            </Group>
            <TextInput label="Phone" placeholder="+1 555-0100" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} mt="sm" />
            <TextInput label="Bio" placeholder="Short bio..." value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} mt="sm" />
            <Group justify="flex-end" mt="lg">
              <Button variant="default" onClick={handleCancel} disabled={loading}>Cancel</Button>
              <Button type="submit" loading={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </Group>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default UserEdit;
