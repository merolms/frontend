import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Header, Segment, Grid, Icon, Label, Image, Button,
  Divider, Statistic, Card, List,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { getProfile } from '@/app/services/authService';
import './Profile.scss';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const reduxUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        // Also update Redux store with fresh data
        if (data) {
          dispatch({ type: 'auth/loginSuccess', payload: { user: data, token: localStorage.getItem('auth_token') } });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        // Fall back to Redux user if API fails
        setProfile(reduxUser);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const user = profile || reduxUser;

  if (!user && !loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='dashboard-content'>
            <Segment placeholder>
              <Header icon><Icon name='lock' /> Please log in</Header>
              <Button primary onClick={() => navigate('/login')}>Sign In</Button>
            </Segment>
          </div>
        </div>
      </div>
    );
  }

  const roleColors = {
    Administrator: 'red',
    Instructor: 'blue',
    'Team Lead': 'purple',
    Student: 'teal',
  };

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>My Profile</h1>
            <p className='page-subtitle'>{user?.role} &middot; {user?.email}</p>
          </div>
          <div className='header-right'>
            <Button as={Link} to='/settings' primary icon>
              <Icon name='cog' /> Edit Profile
            </Button>
          </div>
        </div>

        <div className='dashboard-content'>
          {loading ? (
            <Segment loading><h2>Loading profile...</h2></Segment>
          ) : (
            <>
              <div className='profile-hero'>
                <div className='profile-hero-overlay'>
                  <Image src={user?.avatar || 'https://i.pravatar.cc/150?img=1'} circular className='profile-avatar-xl' />
                  <div className='profile-hero-info'>
                    <Header as='h1' className='profile-hero-name'>
                      {user?.firstName} {user?.lastName}
                    </Header>
                    <div className='profile-hero-meta'>
                      <Label color={roleColors[user?.role] || 'grey'} size='medium'>{user?.role}</Label>
                      <span className='profile-hero-email'><Icon name='mail' /> {user?.email}</span>
                      <span className={`profile-status-dot ${user?.status === 1 ? 'active' : 'inactive'}`}>
                        <Icon name={user?.status === 1 ? 'check circle' : 'pause circle'} />
                        {user?.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Grid stackable className='profile-grid'>
                <Grid.Column width={6}>
                  <Segment className='profile-card'>
                    <Header as='h4'><Icon name='user circle' /> About</Header>
                    {user?.bio ? (
                      <p className='profile-bio'>{user.bio}</p>
                    ) : (
                      <div className='profile-empty-text'>
                        <Icon name='edit' color='grey' />
                        <p>No bio yet. Tell others about yourself.</p>
                        <Button as={Link} to='/settings' size='small' basic>Add Bio</Button>
                      </div>
                    )}
                    <Divider />
                    <List relaxed className='profile-details-list'>
                      <List.Item><Icon name='phone' color='blue' /><List.Content><List.Header>Phone</List.Header><List.Description>{user?.phone || 'Not provided'}</List.Description></List.Content></List.Item>
                      <List.Item><Icon name='calendar' color='green' /><List.Content><List.Header>Member Since</List.Header><List.Description>{user?.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : 'N/A'}</List.Description></List.Content></List.Item>
                      <List.Item><Icon name='clock outline' color='orange' /><List.Content><List.Header>Last Online</List.Header><List.Description>{user?.last_online ? new Date(user.last_online * 1000).toLocaleDateString() : 'N/A'}</List.Description></List.Content></List.Item>
                    </List>
                  </Segment>

                  <Segment className='profile-card'>
                    <Header as='h4'><Icon name='shield' /> Permissions</Header>
                    <div className='profile-permissions'>
                      {user?.permissions?.includes('*') ? (
                        <Label color='red' size='medium'><Icon name='star' /> Full Administrator Access</Label>
                      ) : (
                        <div className='profile-perm-list'>
                          {user?.permissions?.map((perm, i) => (
                            <Label key={i} size='tiny' basic>{perm}</Label>
                          ))}
                        </div>
                      )}
                    </div>
                  </Segment>
                </Grid.Column>

                <Grid.Column width={10}>
                  <Statistic.Group widths={3} className='profile-stats'>
                    <Statistic color='blue'>
                      <Statistic.Value><Icon name='book' /> 0</Statistic.Value>
                      <Statistic.Label>Enrolled</Statistic.Label>
                    </Statistic>
                    <Statistic color='green'>
                      <Statistic.Value><Icon name='check circle' /> 0</Statistic.Value>
                      <Statistic.Label>Completed</Statistic.Label>
                    </Statistic>
                    <Statistic color='teal'>
                      <Statistic.Value>—</Statistic.Value>
                      <Statistic.Label>Completion</Statistic.Label>
                    </Statistic>
                  </Statistic.Group>

                  <Segment className='profile-card'>
                    <Header as='h4'><Icon name='sitemap' /> Team Assignments</Header>
                    <div className='profile-empty-text'><Icon name='users' color='grey' /><p>Team management coming soon.</p></div>
                  </Segment>
                </Grid.Column>
              </Grid>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
