import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Breadcrumb, Divider, Button, Label,
  Grid, Image, List, Header, Message,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamMemberAssignModal from '@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchTeamById, fetchTeamMembers, deleteTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';

const TeamDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTeamById(id);
      setTeam(data);
      // Also load members separately
      try {
        const memberData = await fetchTeamMembers(id);
        setMembers(memberData);
      } catch (memberErr) {
        console.error('Error loading members:', memberErr);
        setMembers([]);
      }
    } catch (err) {
      setError('Failed to load team data.');
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const teamName = team?.name;
    try {
      setActionLoading(true);
      await deleteTeam(id);
      addToast(`Team "${teamName}" deleted successfully`, 'success');
      navigate('/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team.');
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

  if (error || !team) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Message negative>
              <Message.Header>{error || 'Team not found'}</Message.Header>
              <Button primary onClick={() => navigate('/teams')}>Back to Teams</Button>
            </Message>
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
          <Segment className='team-detail-header' style={{ borderLeft: `4px solid ${team.color || '#2185d0'}` }}>
            <Grid stackable>
              <Grid.Column width={10}>
                <Header as='h2'>
                  <span className='team-color-dot' style={{ background: team.color || '#2185d0' }} />
                  {team.name}
                  <Label color={team.status === 1 ? 'green' : 'grey'} style={{ marginLeft: 12 }}>
                    {team.status === 1 ? 'Active' : 'Inactive'}
                  </Label>
                </Header>
                <p style={{ color: '#666', marginTop: 8 }}>{team.description}</p>
                <div style={{ marginTop: 12 }}>
                  <Label><Icon name='calendar' /> Created {team.created_at ? new Date(team.created_at * 1000).toLocaleDateString() : '—'}</Label>
                </div>
              </Grid.Column>
              <Grid.Column width={6}>
                <div className='team-quick-stats'>
                  <div className='team-quick-stat'>
                    <div className='team-quick-stat-value'>{members.length}</div>
                    <div className='team-quick-stat-label'>Members</div>
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
                  Team Members ({members.length})
                </Header>

                {members.length === 0 ? (
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
                    {members.map((member) => {
                      const userId = member.userId;
                      const userName = member.userName || 'Unknown';
                      return (
                        <List.Item key={userId} className='team-member-item'>
                          <Image src={member.avatar || 'https://i.pravatar.cc/150?img=1'} circular className='team-member-avatar' />
                          <List.Content>
                            <List.Header>{userName}</List.Header>
                            <List.Description>
                              <Label color={getRoleColor(member.role)} size='tiny'>{member.role || 'N/A'}</Label>
                            </List.Description>
                          </List.Content>
                        </List.Item>
                      );
                    })}
                  </List>
                )}
              </Segment>
            </Grid.Column>

            <Grid.Column width={6}>
              {/* Quick Info */}
              <Segment className='team-detail-segment'>
                <Header as='h3'>
                  <Icon name='info circle' color='grey' />
                  Quick Info
                </Header>
                <List>
                  <List.Item>
                    <Icon name='calendar' />
                    <List.Content>Created: <strong>{team.created_at ? new Date(team.created_at * 1000).toLocaleDateString() : '—'}</strong></List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='users' />
                    <List.Content>Members: <strong>{members.length}</strong></List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='flag' />
                    <List.Content>Status: <strong>{team.status === 1 ? 'Active' : 'Inactive'}</strong></List.Content>
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
