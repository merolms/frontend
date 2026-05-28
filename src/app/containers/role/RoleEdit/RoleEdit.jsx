import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Title, Text, Loader, Alert, Button } from '@mantine/core';
import { AlertCircle, Pencil } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import RoleForm from '@/app/containers/role/RoleForm/RoleForm';
import { fetchRoleById, updateRole } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const RoleEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRole = async () => { try { setFetching(true); const data = await fetchRoleById(id); if (!data) setError('Role not found.'); else setRole(data); } catch (err) { setError('Failed to load role data.'); } finally { setFetching(false); } };
    loadRole();
  }, [id]);

  const handleSubmit = async (formData) => { try { setLoading(true); setError(null); await updateRole(id, formData); addToast(`Role "${formData.name}" updated successfully`, 'success'); navigate('/roles'); } catch (err) { setError(err.message || 'Failed to update role.'); } finally { setLoading(false); } };
  const handleCancel = () => navigate('/roles');

  if (fetching) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" radius="md" mt={40}><Loader /><Title order={4}>Loading...</Title></Paper></div></div>);
  if (error && !role) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Alert icon={<AlertCircle size={16} />} color="red">{error}</Alert><Button mt="md" onClick={() => navigate('/roles')}>Back to Roles</Button></div></div>);

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md"><Anchor onClick={() => navigate('/roles')}>Roles</Anchor><span>Edit: {role?.name}</span></Breadcrumbs>
        <Paper className='role-form-segment' p="lg" radius="md" withBorder>
          <Title order={3} mb={4}><Pencil size={20} color="#2185d0" /> Edit Role</Title>
          <Text c="dimmed" size="sm" mb="md">Update the role details and permissions.</Text>
          <RoleForm initialData={role} onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} submitLabel='Save Changes' />
        </Paper>
      </div>
    </div>
  );
};

export default RoleEdit;
