import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider, Dropdown } from 'semantic-ui-react';
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Student',
    phone: '',
    bio: '',
    status: 1,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions(roles.map((r) => ({ key: r.name, text: r.name, value: r.name })));
      } catch (err) {
        setRoleOptions([
          { key: 'Student', text: 'Student', value: 'Student' },
          { key: 'Instructor', text: 'Instructor', value: 'Instructor' },
          { key: 'Team Lead', text: 'Team Lead', value: 'Team Lead' },
          { key: 'Administrator', text: 'Administrator', value: 'Administrator' },
        ]);
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setFetching(true);
        const data = await fetchUserById(id);
        setUser(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          role: data.role || 'Student',
          phone: data.phone || '',
          bio: data.bio || '',
          status: data.status !== undefined ? data.status : 1,
        });
      } catch (err) {
        setError('Failed to load user data.');
      } finally {
        setFetching(false);
      }
    };
    loadUser();
  }, [id]);

  const handleChange = (e, { name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updated = await updateUser(id, formData);
      addToast(`${formData.firstName} ${formData.lastName} updated successfully`, 'success');
      navigate(`/users/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update user. Please try again.');
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
        <SideBar />
        <div className='dashboard-main'>
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
      <SideBar />
      <div className='dashboard-main'>
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

            <form onSubmit={handleSubmit}>
              <Divider hidden />
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>First Name *</label>
                  <input name='firstName' value={formData.firstName} onChange={(e) => handleChange(e, { name: 'firstName', value: e.target.value })} placeholder='John' style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Last Name *</label>
                  <input name='lastName' value={formData.lastName} onChange={(e) => handleChange(e, { name: 'lastName', value: e.target.value })} placeholder='Doe' style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>
              </div>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Email *</label>
                <input name='email' type='email' value={formData.email} onChange={(e) => handleChange(e, { name: 'email', value: e.target.value })} placeholder='john@example.com' style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }} />
              </div>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Role</label>
                <Dropdown
                  name='role'
                  placeholder='Select a role'
                  selection
                  options={roleOptions}
                  value={formData.role}
                  onChange={handleChange}
                  style={{ marginTop: 4 }}
                />
              </div>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Status</label>
                <Dropdown
                  name='status'
                  selection
                  options={[
                    { key: 1, text: 'Active', value: 1 },
                    { key: 0, text: 'Inactive', value: 0 },
                  ]}
                  value={formData.status}
                  onChange={handleChange}
                  style={{ marginTop: 4 }}
                />
              </div>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Phone</label>
                <input name='phone' value={formData.phone} onChange={(e) => handleChange(e, { name: 'phone', value: e.target.value })} placeholder='+1 555-0100' style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }} />
              </div>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Bio</label>
                <textarea name='bio' value={formData.bio} onChange={(e) => handleChange(e, { name: 'bio', value: e.target.value })} placeholder='Short bio...' style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4, minHeight: 80 }} />
              </div>
              <Divider hidden />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 8 }}>
                <button type='button' onClick={handleCancel} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }} disabled={loading}>Cancel</button>
                <button type='submit' style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: '#2185d0', color: '#fff', cursor: 'pointer' }} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Segment>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
