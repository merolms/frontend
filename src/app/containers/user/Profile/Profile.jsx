import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Header, Segment, Grid, Icon, Label, Image, Button,
  Divider, Statistic, Card, List,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import './Profile.scss';

const Profile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='profile-page'>
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

        <div className='profile-page'>
          <div className='dashboard-header'>
            <div className='header-left'>
              <h1 className='page-title'>My Profile</h1>
              <p className='page-subtitle'>{user.role} · {user.email}</p>
            </div>
            <div className='header-right'>
              <Button as={Link} to='/settings' primary icon>
                <Icon name='cog' /> Edit Profile
              </Button>
            </div>
          </div>

          <div className='profile-hero'>
            <div className='profile-hero-overlay'>
              <Image src={user.avatar} circular className='profile-avatar-xl' />
              <div className='profile-hero-info'>
                <Header as='h1' className='profile-hero-name'>
                  {user.firstName} {user.lastName}
                </Header>
                <div className='profile-hero-meta'>
                  <Label color={roleColors[user.role] || 'grey'} size='medium'>{user.role}</Label>
                  <span className='profile-hero-email'><Icon name='mail' /> {user.email}</span>
                  <span className={`profile-status-dot ${user.status}`}>
                    <Icon name={user.status === 'active' ? 'check circle' : 'pause circle'} />
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Grid stackable className='profile-grid'>
            <Grid.Column width={6}>
              <Segment className='profile-card'>
                <Header as='h4'><Icon name='user circle' /> About</Header>
                {user.bio ? (
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
                  <List.Item><Icon name='phone' color='blue' /><List.Content><List.Header>Phone</List.Header><List.Description>{user.phone || 'Not provided'}</List.Description></List.Content></List.Item>
                  <List.Item><Icon name='calendar' color='green' /><List.Content><List.Header>Member Since</List.Header><List.Description>{user.joinedAt}</List.Description></List.Content></List.Item>
                  <List.Item><Icon name='clock outline' color='orange' /><List.Content><List.Header>Last Active</List.Header><List.Description>{user.lastActive}</List.Description></List.Content></List.Item>
                </List>
              </Segment>

              <Segment className='profile-card'>
                <Header as='h4'><Icon name='shield' /> Permissions</Header>
                <div className='profile-permissions'>
                  {user.permissions?.includes('*') ? (
                    <Label color='red' size='medium'><Icon name='star' /> Full Administrator Access</Label>
                  ) : (
                    <div className='profile-perm-list'>
                      {user.permissions?.map((perm, i) => (
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
                  <Statistic.Value><Icon name='book' /> {user.coursesEnrolled || 0}</Statistic.Value>
                  <Statistic.Label>Enrolled</Statistic.Label>
                </Statistic>
                <Statistic color='green'>
                  <Statistic.Value><Icon name='check circle' /> {user.coursesCompleted || 0}</Statistic.Value>
                  <Statistic.Label>Completed</Statistic.Label>
                </Statistic>
                <Statistic color='teal'>
                  <Statistic.Value>{user.coursesEnrolled > 0 ? `${Math.round(((user.coursesCompleted || 0) / user.coursesEnrolled) * 100)}%` : '—'}</Statistic.Value>
                  <Statistic.Label>Completion</Statistic.Label>
                </Statistic>
              </Statistic.Group>

              <Segment className='profile-card'>
                <Header as='h4'><Icon name='sitemap' /> Team Assignments</Header>
                {user.teams?.length > 0 ? (
                  <div className='profile-teams'>
                    {user.teams.map((team, i) => (
                      <Card key={i} className='profile-team-card'>
                        <Card.Content><Card.Header><Icon name='users' color='teal' /> {team}</Card.Header></Card.Content>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className='profile-empty-text'><Icon name='users' color='grey' /><p>Not assigned to any teams yet.</p></div>
                )}
              </Segment>

              <Segment className='profile-card'>
                <Header as='h4'><Icon name='chart bar' /> Activity Summary</Header>
                <List relaxed>
                  <List.Item><List.Icon name='graduation cap' color='green' /><List.Content>Completed <strong>{user.coursesCompleted || 0}</strong> of <strong>{user.coursesEnrolled || 0}</strong> enrolled courses</List.Content></List.Item>
                  <List.Item><List.Icon name='users' color='teal' /><List.Content>Member of <strong>{user.teams?.length || 0}</strong> team{(user.teams?.length || 0) !== 1 ? 's' : ''}</List.Content></List.Item>
                  <List.Item><List.Icon name='clock outline' color='orange' /><List.Content>Last active on <strong>{user.lastActive}</strong></List.Content></List.Item>
                </List>
              </Segment>
            </Grid.Column>
          </Grid>
        </div>

      </div>
    </div>
  );
};

export default Profile;
