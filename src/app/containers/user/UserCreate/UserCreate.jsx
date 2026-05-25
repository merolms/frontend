import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import UserForm from '@/app/containers/user/UserForm/UserForm';
import { mockCreateUser } from '@/app/services/userService';

const UserCreate = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const user = await mockCreateUser(formData);
      navigate(`/users/${user.id}`);
    } catch (err) {
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onNavigate={(path) => navigate(path)} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Users</h1>
            <p className='page-subtitle'>Create new user</p>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/users')}>Users</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Create User</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Segment className='user-form-segment'>
            <h2 className='user-form-heading'>
              <Icon name='user plus' color='green' />
              Create New User
            </h2>
            <p className='user-form-subtitle'>Fill in the details below to create a new user account.</p>

            {error && (
              <div className='user-form-error'>
                <Icon name='warning circle' /> {error}
              </div>
            )}

            <UserForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              submitLabel='Create User'
            />
          </Segment>
        </div>
      </div>
    </div>
  );
};

export default UserCreate;
