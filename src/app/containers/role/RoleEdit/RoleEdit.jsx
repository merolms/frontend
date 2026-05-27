import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider, Header, Button, Message } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import RoleForm from '@/app/containers/role/RoleForm/RoleForm';
import { fetchRoleById, updateRole } from '@/app/services/authService';

const RoleEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setFetching(true);
        const data = await fetchRoleById(id);
        if (!data) {
          setError('Role not found.');
          return;
        }
        setRole(data);
      } catch (err) {
        setError('Failed to load role data.');
      } finally {
        setFetching(false);
      }
    };
    loadRole();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await updateRole(id, formData);
      navigate('/roles');
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  if (fetching) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment loading className='role-form-segment'><Header as='h2'>Loading...</Header></Segment>
          </div>
        </div>
      </div>
    );
  }

  if (error && !role) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
            <Button primary onClick={() => navigate('/roles')}>Back to Roles</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Roles & Permissions</h1>
            <p className='page-subtitle'>Edit role</p>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/roles')}>Roles</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Edit: {role?.name}</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Segment className='role-form-segment'>
            <Header as='h2'>
              <Icon name='pencil' color='blue' />
              Edit Role
            </Header>
            <p className='role-form-subtitle'>Update the role details and permissions.</p>

            {error && (
              <Message negative onDismiss={() => setError(null)}>
                <p>{error}</p>
              </Message>
            )}

            <RoleForm
              initialData={role}
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

export default RoleEdit;
