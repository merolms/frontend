import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamForm from '@/app/containers/team/TeamForm/TeamForm';
import { mockCreateTeam } from '@/app/services/teamService';

const TeamCreate = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const team = await mockCreateTeam(formData);
      navigate(`/teams/${team.id}`);
    } catch (err) {
      setError('Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/teams');
  };

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onNavigate={(path) => navigate(path)} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Teams</h1>
            <p className='page-subtitle'>Create new team</p>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/teams')}>Teams</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Create Team</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Segment className='team-form-segment'>
            <h2 className='team-form-heading'>
              <Icon name='users' color='green' />
              Create New Team
            </h2>
            <p className='team-form-subtitle'>Set up a new team and start assigning members.</p>

            {error && (
              <div className='team-form-error'>
                <Icon name='warning circle' /> {error}
              </div>
            )}

            <TeamForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              submitLabel='Create Team'
            />
          </Segment>
        </div>
      </div>
    </div>
  );
};

export default TeamCreate;
