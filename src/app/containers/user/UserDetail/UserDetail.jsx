import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Breadcrumb, Divider, Button, Label,
  Grid, Image, List, Card, Header,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { mockFetchUserById, mockDeleteUser } from '@/app/services/userService';

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await mockFetchUserById(id);
      setUser(data);
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await mockDeleteUser(id);
      navigate('/users');
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setActionLoading(false);
      setShowDelete(false);
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
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='dashboard-content'>
            <Segment loading><h2>Loading user...</h2></Segment>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Users</h1>
            <p className='page-subtitle'>{user.firstName} {user.lastName}</p>
          </div>
          <div className='header-right'>
            <Button as={Link} to={`/users/${id}/edit`} icon>
              <Icon name='pencil' /> Edit
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
                  <Image src={user.avatar} circular className='user-avatar-large' />
                  <Header as='h2' style={{ margin: '12px 0 4px' }}>
                    {user.firstName} {user.lastName}
                  </Header>
                  <Label color={getRoleColor(user.role)} size='medium'>{user.role}</Label>
                  <p className='user-profile-email'>
                    <Icon name='mail' /> {user.email}
                  </p>
                  <div className={`user-status-badge ${user.status}`}>
                    <Icon name={user.status === 'active' ? 'check circle' : 'pause circle'} />
                    {user.status === 'active' ? 'Active' : 'Inactive'}
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
                      <strong>Joined:</strong> {user.joinedAt}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='clock outline' />
                    <List.Content>
                      <strong>Last Active:</strong> {user.lastActive}
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>

            <Grid.Column width={10}>
              {/* Teams */}
              <Segment className='user-detail-segment'>
                <Header as='h3'>
                  <Icon name='users' color='teal' />
                  Team Assignments
                </Header>
                {user.teams && user.teams.length > 0 ? (
                  <div className='user-teams-list'>
                    {user.teams.map((team, i) => (
                      <Label key={i} color='teal' size='large' style={{ marginRight: 8, marginBottom: 8 }}>
                        <Icon name='users' /> {team}
                      </Label>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>Not assigned to any teams yet.</p>
                )}
              </Segment>

              {/* Learning Progress */}
              <Segment className='user-detail-segment'>
                <Header as='h3'>
                  <Icon name='book' color='blue' />
                  Learning Progress
                </Header>
                <Grid columns={2} stackable>
                  <Grid.Column>
                    <Card className='user-stat-card'>
                      <Card.Content>
                        <div className='user-stat-value'>{user.coursesEnrolled}</div>
                        <div className='user-stat-label'>Courses Enrolled</div>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                  <Grid.Column>
                    <Card className='user-stat-card'>
                      <Card.Content>
                        <div className='user-stat-value'>{user.coursesCompleted}</div>
                        <div className='user-stat-label'>Courses Completed</div>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>

              {/* Activity Summary */}
              <Segment className='user-detail-segment'>
                <Header as='h3'>
                  <Icon name='chart bar' color='orange' />
                  Activity Summary
                </Header>
                <List>
                  <List.Item>
                    <List.Icon name='graduation cap' color='green' />
                    <List.Content>
                      <strong>{user.coursesCompleted}</strong> of <strong>{user.coursesEnrolled}</strong> courses completed
                      {user.coursesEnrolled > 0 && (
                        <span style={{ color: '#888', marginLeft: 8 }}>
                          ({Math.round((user.coursesCompleted / user.coursesEnrolled) * 100)}%)
                        </span>
                      )}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='users' color='teal' />
                    <List.Content>
                      Member of <strong>{user.teams?.length || 0}</strong> team{(user.teams?.length || 0) !== 1 ? 's' : ''}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='clock outline' color='blue' />
                    <List.Content>
                      Last active on <strong>{user.lastActive}</strong>
                    </List.Content>
                  </List.Item>
                </List>
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
    </div>
  );
};

export default UserDetail;
