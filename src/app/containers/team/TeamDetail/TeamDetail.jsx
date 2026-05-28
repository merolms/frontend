import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, Avatar, Group, Text, Stack, List, Card, Badge, Grid, Loader, Alert } from '@mantine/core';
import { IconUsers, IconPencil, IconTrash, IconPlus, IconArrowRight, IconAlertCircle, IconUser } from '@tabler/icons-react';
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
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try { setLoading(true); const [t, m] = await Promise.all([fetchTeamById(id), fetchTeamMembers(id)]); setTeam(t); setMembers(m || []); }
    catch (err) { setError(err.message || 'Failed to load team'); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDelete = async () => { try { setActionLoading(true); await deleteTeam(id); addToast(`Team "${team?.name}" deleted`, 'error'); navigate('/teams'); } catch (err) { console.error(err); } finally { setActionLoading(false); } };

  if (loading) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" mt={40}><Loader /><Text>Loading...</Text></Paper></div></div>);
  if (error || !team) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" mt={40}><Alert icon={<IconAlertCircle size={16} />} color="red">{error || 'Team not found'}</Alert><Button mt="md" onClick={() => navigate('/teams')}>Back to Teams</Button></Paper></div></div>);

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md" className="breadcrumb"><Anchor onClick={() => navigate('/teams')}>Teams</Anchor><span>{team.name}</span></Breadcrumbs>

        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Teams</h1>
            <p className='page-subtitle'>{team.name}</p>
          </div>
          <div className='header-right'>
            <Button leftSection={<IconPlus size={14} />} onClick={() => setShowMemberModal(true)}>Add Member</Button>
            <Button variant="default" component={Link} to={`/teams/${id}/edit`} leftSection={<IconPencil size={14} />}>Edit</Button>
            <Button color="red" variant="default" onClick={() => setDeleteTarget(team)} leftSection={<IconTrash size={14} />}>Delete</Button>
          </div>
        </div>

        <div className='dashboard-content'>
          <h2>{team.name}</h2>
          <Text c="dimmed" mb="md">{team.description}</Text>

          <div className='team-quick-stat'>
            <Badge color={team.status === 1 ? 'green' : 'gray'}>{team.status === 1 ? 'Active' : 'Inactive'}</Badge>
            <Text size="sm">{members.length} member{members.length !== 1 ? 's' : ''}</Text>
          </div>
        </div>

        <Grid mt="md">
          <Grid.Col span={8}>
            <Paper p="lg" radius="md" withBorder>
              <Text fw={600} mb="md">Team Members ({members.length})</Text>
              {members.length === 0 ? <Text c="dimmed">No members yet.</Text> : (
                <Stack gap={8}>
                  {members.map((m) => {
                    const userId = m.userID || m.userId;
                    return (
                      <Group key={userId} justify="space-between" style={{ padding: '8px 12px', background: '#f8f9fa', borderRadius: 8 }}>
                        <Group gap={10}><Avatar src={m.avatar} size={32} radius="xl" /><div><Text size="sm" fw={600}>{m.userName || 'Unknown'}</Text><Text size="xs" c="dimmed">{m.userEmail}</Text></div></Group>
                        <Badge>{m.role || '—'}</Badge>
                      </Group>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper p="lg" radius="md" withBorder>
              <Text fw={600} mb="md">Quick Info</Text>
              <List spacing="xs">
                <List.Item><Text size="sm" fw={600}>Status</Text><Badge color={team.status === 1 ? 'green' : 'gray'}>{team.status === 1 ? 'Active' : 'Inactive'}</Badge></List.Item>
                <List.Item><Text size="sm" fw={600}>Members</Text><Text>{members.length}</Text></List.Item>
              </List>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>

      {showMemberModal && <TeamMemberAssignModal open={showMemberModal} onClose={() => setShowMemberModal(false)} team={team} onUpdated={loadData} />}
      <DeleteModal open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} itemName={deleteTarget?.name} itemType='team' loading={actionLoading} />
    </div>
  );
};

export default TeamDetail;
