import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamForm from '@/app/containers/team/TeamForm/TeamForm';
import { fetchTeamById, updateTeam } from '@/app/services/teamService';

const TeamEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setFetching(true);
        const data = await fetchTeamById(id);
        setTeam(data);
      } catch (err) {
        setError('Failed to load team data.');
      } finally {
        setFetching(false);
      }
    };
    loadTeam();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateTeam(id, formData);
      navigate(`/teams/${updated.id}`);
    } catch (err) {
      setError('Failed to update team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/teams/${id}`);
  };

  if (fetching) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment loading className='team-form-segment'><h2>Loading...</h2></Segment>
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
            <h1 className='page-title'>Teams</h1>
            <p className='page-subtitle'>Edit team</p>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/teams')}>Teams</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section link onClick={() => navigate(`/teams/${id}`)}>{team?.name}</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Edit</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Segment className='team-form-segment'>
            <h2 className='team-form-heading'>
              <Icon name='pencil' color='blue' />
              Edit Team
            </h2>
            <p className='team-form-subtitle'>Update the team details below.</p>

            {error && (
              <div className='team-form-error'>
                <Icon name='warning circle' /> {error}
              </div>
            )}

            <TeamForm
              initialData={team}
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

export default TeamEdit;
