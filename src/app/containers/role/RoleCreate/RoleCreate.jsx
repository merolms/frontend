import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider, Header } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import RoleForm from '@/app/containers/role/RoleForm/RoleForm';
import { createRole } from '@/app/services/authService';

const RoleCreate = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await createRole(formData);
      navigate('/roles');
    } catch (err) {
      setError(err.message || 'Failed to create role.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Roles & Permissions</h1>
            <p className='page-subtitle'>Create new role</p>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/roles')}>Roles</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Create Role</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Segment className='role-form-segment'>
            <Header as='h2'>
              <Icon name='shield' color='green' />
              Create New Role
            </Header>
            <p className='role-form-subtitle'>Define a new role and assign permissions to it.</p>

            <RoleForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              submitLabel='Create Role'
            />
          </Segment>
        </div>
      </div>
    </div>
  );
};

export default RoleCreate;
