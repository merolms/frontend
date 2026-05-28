import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, Title, Text } from '@mantine/core';
import { Shield } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import RoleForm from '@/app/containers/role/RoleForm/RoleForm';
import { createRole } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const RoleCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try { setLoading(true); setError(null); await createRole(formData); addToast(`Role "${formData.name}" created successfully`, 'success'); navigate('/roles'); }
    catch (err) { setError(err.message || 'Failed to create role.'); } finally { setLoading(false); }
  };
  const handleCancel = () => navigate('/roles');

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'><div className='header-left'><h1 className='page-title'>Roles & Permissions</h1><p className='page-subtitle'>Create new role</p></div></div>
        <div className='dashboard-content'>
          <Breadcrumbs mb="md"><Anchor onClick={() => navigate('/roles')}>Roles</Anchor><span>Create Role</span></Breadcrumbs>
          <Paper className='role-form-segment' p="lg" radius="md" withBorder>
            <Title order={3} mb={4}><Shield size={20} color="#33a163" /> Create New Role</Title>
            <Text c="dimmed" size="sm" mb="md">Define a new role and assign permissions to it.</Text>
            <RoleForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} submitLabel='Create Role' />
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default RoleCreate;
