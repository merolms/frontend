import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import UserForm from '@/app/containers/user/UserForm/UserForm';
import { mockFetchUserById, mockUpdateUser } from '@/app/services/userService';

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setFetching(true);
        const data = await mockFetchUserById(id);
        setUser(data);
      } catch (err) {
        setError('Failed to load user data.');
      } finally {
        setFetching(false);
      }
    };
    loadUser();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await mockUpdateUser(id, formData);
      navigate(`/users/${updated.id}`);
    } catch (err) {
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  if (fetching) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='dashboard-content'>
            <Segment loading className='user-form-segment'>
              <h2>Loading...</h2>
            </Segment>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Users</h1>
            <p className='page-subtitle'>Edit user</p>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/users')}>Users</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section link onClick={() => navigate(`/users/${id}`)}>
              {user?.firstName} {user?.lastName}
            </Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Edit</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Segment className='user-form-segment'>
            <h2 className='user-form-heading'>
              <Icon name='pencil' color='blue' />
              Edit User
            </h2>
            <p className='user-form-subtitle'>Update the user details below.</p>

            {error && (
              <div className='user-form-error'>
                <Icon name='warning circle' /> {error}
              </div>
            )}

            <UserForm
              initialData={user}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              submitLabel='Save Changes'
            />
          </Segment>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
