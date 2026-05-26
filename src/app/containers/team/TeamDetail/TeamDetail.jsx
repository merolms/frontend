import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Breadcrumb, Divider, Button, Label,
  Grid, Image, List, Header, Progress,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamMemberAssignModal from '@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchTeamById, deleteTeam } from '@/app/services/teamService';

const TeamDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => { loadTeam(); }, [id]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const data = await fetchTeamById(id);
      setTeam(data);
    } catch (err) {
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteTeam(id);
      navigate('/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
    } finally {
      setActionLoading(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment loading><h2>Loading team...</h2></Segment>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment placeholder>
              <Header icon><Icon name='warning circle' /> Team not found</Header>
              <Button primary onClick={() => navigate('/teams')}>Back to Teams</Button>
            </Segment>
          </div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return 'red';
      case 'Instructor': return 'blue';
      case 'Team Lead': return 'purple';
      case 'Student': return 'teal';
      default: return 'grey';
    }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Teams</h1>
            <p className='page-subtitle'>{team.name}</p>
          </div>
          <div className='header-right'>
            <Button onClick={() => setShowAssign(true)} icon>
              <Icon name='user plus' /> Add Member
            </Button>
            <Button as={Link} to={`/teams/${id}/edit`} icon>
              <Icon name='pencil' /> Edit
            </Button>
            <Button color='red' icon onClick={() => setShowDelete(true)}>
              <Icon name='trash' /> Delete
            </Button>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/teams')}>Teams</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>{team.name}</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          {/* Team Header */}
          <Segment className='team-detail-header' style={{ borderLeft: `4px solid ${team.color}` }}>
            <Grid stackable>
              <Grid.Column width={10}>
                <Header as='h2'>
                  <span className='team-color-dot' style={{ background: team.color }} />
                  {team.name}
                  <Label color={team.status === 'active' ? 'green' : 'grey'} style={{ marginLeft: 12 }}>
                    {team.status === 'active' ? 'Active' : 'Inactive'}
                  </Label>
                </Header>
                <p style={{ color: '#666', marginTop: 8 }}>{team.description}</p>
                <div style={{ marginTop: 12 }}>
                  <Label><Icon name='calendar' /> Created {team.createdAt}</Label>
                  {team.leader && (
                    <Label color='purple'><Icon name='star' /> Led by {team.leader}</Label>
                  )}
                </div>
              </Grid.Column>
              <Grid.Column width={6}>
                <div className='team-quick-stats'>
                  <div className='team-quick-stat'>
                    <div className='team-quick-stat-value'>{team.memberCount}</div>
                    <div className='team-quick-stat-label'>Members</div>
                  </div>
                  <div className='team-quick-stat'>
                    <div className='team-quick-stat-value'>{team.coursesAssigned}</div>
                    <div className='team-quick-stat-label'>Courses</div>
                  </div>
                  <div className='team-quick-stat'>
                    <div className='team-quick-stat-value' style={{ color: team.avgProgress >= 75 ? '#33a163' : team.avgProgress >= 50 ? '#f0a500' : '#e53935' }}>
                      {team.avgProgress}%
                    </div>
                    <div className='team-quick-stat-label'>Avg Progress</div>
                  </div>
                </div>
              </Grid.Column>
            </Grid>
          </Segment>

          <Grid stackable>
            <Grid.Column width={10}>
              {/* Members */}
              <Segment className='team-detail-segment'>
                <Header as='h3'>
                  <Icon name='users' color='teal' />
                  Team Members
                </Header>

                {team.members.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30 }}>
                    <Icon name='users' size='huge' color='grey' />
                    <Header as='h4' color='grey'>No members yet</Header>
                    <p>Start building your team by adding members.</p>
                    <Button primary onClick={() => setShowAssign(true)}>
                      <Icon name='user plus' /> Add First Member
                    </Button>
                  </div>
                ) : (
                  <List divided relaxed className='team-members-list'>
                    {team.members.map((member) => (
                      <List.Item key={member.id} className='team-member-item'>
                        <Image src={member.avatar} circular className='team-member-avatar' />
                        <List.Content>
                          <List.Header>
                            {member.firstName} {member.lastName}
                            {member.id === team.leaderId && (
                              <Label color='purple' size='tiny' style={{ marginLeft: 8 }}>
                                <Icon name='star' /> Leader
                              </Label>
                            )}
                          </List.Header>
                          <List.Description>
                            <Label color={getRoleColor(member.role)} size='tiny'>{member.role}</Label>
                          </List.Description>
                        </List.Content>
                      </List.Item>
                    ))}
                  </List>
                )}
              </Segment>
            </Grid.Column>

            <Grid.Column width={6}>
              {/* Progress */}
              <Segment className='team-detail-segment'>
                <Header as='h3'>
                  <Icon name='chart line' color='blue' />
                  Team Progress
                </Header>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: '50%',
                    border: `6px solid ${team.avgProgress >= 75 ? '#33a163' : team.avgProgress >= 50 ? '#f0a500' : '#e53935'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 700 }}>{team.avgProgress}%</span>
                  </div>
                  <p style={{ color: '#888', marginTop: 12 }}>Average course completion</p>
                </div>
              </Segment>

              {/* Quick Info */}
              <Segment className='team-detail-segment'>
                <Header as='h3'>
                  <Icon name='info circle' color='grey' />
                  Quick Info
                </Header>
                <List>
                  <List.Item>
                    <Icon name='calendar' />
                    <List.Content>Created: <strong>{team.createdAt}</strong></List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='users' />
                    <List.Content>Members: <strong>{team.memberCount}</strong></List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='book' />
                    <List.Content>Courses: <strong>{team.coursesAssigned}</strong></List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='chart bar' />
                    <List.Content>Progress: <strong>{team.avgProgress}%</strong></List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
          </Grid>
        </div>
      </div>

      {showAssign && (
        <TeamMemberAssignModal
          open={showAssign}
          onClose={() => setShowAssign(false)}
          team={team}
          onUpdated={() => { loadTeam(); setShowAssign(false); }}
        />
      )}

      <DeleteModal
        open={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        itemName={team.name}
        itemType='team'
        loading={actionLoading}
      />
    </div>
  );
};

export default TeamDetail;
