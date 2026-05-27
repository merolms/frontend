import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Breadcrumb, Divider, Button, Label,
  Grid, Image, List, Card, Header, Message,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchUserById, deleteUser } from '@/app/services/userService';
import { adminResetPassword } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserById(id);
      setUser(data);
    } catch (err) {
      setError('Failed to load user data.');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteUser(id);
      addToast(`${user.firstName} ${user.lastName} deleted`, 'error');
      navigate('/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
    } finally {
      setActionLoading(false);
      setShowDelete(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetPasswordError('Password must be at least 6 characters.');
      return;
    }
    try {
      setActionLoading(true);
      setResetPasswordError(null);
      await adminResetPassword(id, newPassword);
      addToast(`Password reset for ${user.firstName} ${user.lastName}`, 'success');
      setShowResetPassword(false);
      setNewPassword('');
    } catch (err) {
      setResetPasswordError(err.message || 'Failed to reset password.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return 'red';
      case 'Instructor': return 'blue';
      case 'Team Lead': return 'purple';
      case 'Student': return 'teal';
      default: return 'grey';
    }
  };

  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment loading><h2>Loading user...</h2></Segment>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
            <Button primary onClick={() => navigate('/users')}>Back to Users</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment placeholder>
              <Header icon><Icon name='warning circle' /> User not found</Header>
              <Button primary onClick={() => navigate('/users')}>Back to Users</Button>
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
            <p className='page-subtitle'>{user.firstName} {user.lastName}</p>
          </div>
          <div className='header-right'>
            <Button as={Link} to={`/users/${id}/edit`} icon>
              <Icon name='pencil' /> Edit
            </Button>
            <Button icon onClick={() => setShowResetPassword(true)} title='Reset Password'>
              <Icon name='key' /> Reset Password
            </Button>
            <Button color='red' icon onClick={() => setShowDelete(true)}>
              <Icon name='trash' /> Delete
            </Button>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/users')}>Users</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>{user.firstName} {user.lastName}</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Grid stackable>
            <Grid.Column width={6}>
              {/* Profile Card */}
              <Segment className='user-profile-card'>
                <div className='user-profile-header'>
                  <Image src={user.avatar || 'https://i.pravatar.cc/150?img=1'} circular className='user-avatar-large' />
                  <Header as='h2' style={{ margin: '12px 0 4px' }}>
                    {user.firstName} {user.lastName}
                  </Header>
                  <Label color={getRoleColor(user.role)} size='medium'>{user.role}</Label>
                  <p className='user-profile-email'>
                    <Icon name='mail' /> {user.email}
                  </p>
                  <div className={`user-status-badge ${user.status === 1 ? 'active' : 'inactive'}`}>
                    <Icon name={user.status === 1 ? 'check circle' : 'pause circle'} />
                    {user.status === 1 ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {user.bio && (
                  <div className='user-profile-bio'>
                    <Header as='h4'>About</Header>
                    <p>{user.bio}</p>
                  </div>
                )}

                <Divider />

                <List className='user-profile-details'>
                  <List.Item>
                    <Icon name='phone' />
                    <List.Content>
                      <strong>Phone:</strong> {user.phone || 'N/A'}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='calendar' />
                    <List.Content>
                      <strong>Joined:</strong> {user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : 'N/A'}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='clock outline' />
                    <List.Content>
                      <strong>Last Online:</strong> {user.last_online ? new Date(user.last_online * 1000).toLocaleDateString() : 'N/A'}
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>

            <Grid.Column width={10}>
              {/* Permissions */}
              <Segment className='user-detail-segment'>
                <Header as='h3'>
                  <Icon name='shield' color='purple' />
                  Permissions
                </Header>
                {user.permissions && user.permissions.length > 0 ? (
                  <div>
                    {user.permissions.includes('*') ? (
                      <Label color='red' size='medium'><Icon name='star' /> Full Administrator Access</Label>
                    ) : (
                      <div>
                        {user.permissions.map((perm, i) => (
                          <Label key={i} size='tiny' basic style={{ margin: '2px' }}>{perm}</Label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>No specific permissions assigned.</p>
                )}
              </Segment>

              {/* Activity Summary */}
              <Segment className='user-detail-segment'>
                <Header as='h3'>
                  <Icon name='chart bar' color='orange' />
                  Account Summary
                </Header>
                <Grid columns={2} stackable>
                  <Grid.Column>
                    <Card className='user-stat-card'>
                      <Card.Content>
                        <div className='user-stat-value'>{user.status === 1 ? 'Active' : 'Inactive'}</div>
                        <div className='user-stat-label'>Account Status</div>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                  <Grid.Column>
                    <Card className='user-stat-card'>
                      <Card.Content>
                        <div className='user-stat-value'>{user.role}</div>
                        <div className='user-stat-label'>Role</div>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
          </Grid>
        </div>
      </div>

      <DeleteModal
        open={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        itemName={`${user.firstName} ${user.lastName}`}
        itemType='user'
        loading={actionLoading}
      />

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className='role-delete-overlay' onClick={() => { setShowResetPassword(false); setNewPassword(''); setResetPasswordError(null); }}>
          <div className='role-delete-modal' onClick={(e) => e.stopPropagation()}>
            <Header as='h3'><Icon name='key' /> Reset Password</Header>
            <p>Enter a new password for <strong>{user?.firstName} {user?.lastName}</strong>.</p>
            {resetPasswordError && (
              <Message negative size='small' onDismiss={() => setResetPasswordError(null)}>
                <p>{resetPasswordError}</p>
              </Message>
            )}
            <div style={{ margin: '12px 0' }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>New Password</label>
              <input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='Minimum 6 characters'
                style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button onClick={() => { setShowResetPassword(false); setNewPassword(''); setResetPasswordError(null); }}>Cancel</Button>
              <Button primary onClick={handleResetPassword} loading={actionLoading}>Reset Password</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
