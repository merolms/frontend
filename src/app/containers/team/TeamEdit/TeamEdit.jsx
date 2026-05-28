import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, Title, Text, Loader } from '@mantine/core';
import { IconPencil, IconPlus, IconAlertCircle } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamForm from '@/app/containers/team/TeamForm/TeamForm';
import { fetchTeamById, updateTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';

const TeamEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeam = async () => { try { setFetching(true); const data = await fetchTeamById(id); setTeam(data); } catch (err) { setError('Failed to load team data.'); } finally { setFetching(false); } };
    loadTeam();
  }, [id]);

  const handleSubmit = async (formData) => {
    try { setLoading(true); setError(null); const updated = await updateTeam(id, formData); addToast(`Team "${formData.name}" updated successfully`, 'success'); navigate(`/teams/${updated.id}`); }
    catch (err) { setError('Failed to update team. Please try again.'); } finally { setLoading(false); }
  };
  const handleCancel = () => navigate(`/teams/${id}`);

  if (fetching) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" radius="md" mt={40}><Loader /><Title order={4}>Loading...</Title></Paper></div></div>);
  if (error && !team) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" radius="md" mt={40}><IconAlertCircle color="red" /> {error}<br /><Button onClick={() => navigate('/teams')}>Back to Teams</Button></Paper></div></div>);

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md" className="breadcrumb">
          <Anchor onClick={() => navigate('/teams')}>Teams</Anchor>
          <Anchor onClick={() => navigate(`/teams/${id}`)}>{team?.name}</Anchor>
          <span>Edit</span>
        </Breadcrumbs>

        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Teams</h1>
            <p className='page-subtitle'>Edit team</p>
          </div>
        </div>

        <Paper className='team-form-segment' p="lg" radius="md" withBorder>
          <Title order={3} mb={4}><IconPencil size={20} color="#2185d0" /> Edit Team</Title>
          <Text c="dimmed" size="sm" mb="md">Update the team details below.</Text>
          {error && <Text c="red" size="sm" mb="sm"><IconPlus size={14} /> {error}</Text>}
          <TeamForm initialData={team} onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} submitLabel='Save Changes' />
        </Paper>
      </div>
    </div>
  );
};

export default TeamEdit;
