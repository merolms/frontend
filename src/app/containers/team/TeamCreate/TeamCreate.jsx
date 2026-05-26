import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { createTeam } from '@/app/services/teamService';

const TeamCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2185d0',
    status: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Team name is required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const team = await createTeam(formData);
      navigate(`/teams/${team.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/teams');
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
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

            <form onSubmit={handleSubmit}>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Team Name *</label>
                <input name='name' value={formData.name} onChange={handleChange} placeholder='e.g. Engineering Team' style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }} />
              </div>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Description</label>
                <textarea name='description' value={formData.description} onChange={handleChange} placeholder='What is this team about?' style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4, minHeight: 80 }} />
              </div>
              <Divider hidden />
              <div>
                <label style={{ fontWeight: 600, fontSize: 13 }}>Color</label>
                <input name='color' type='color' value={formData.color} onChange={handleChange} style={{ width: 60, height: 36, marginTop: 4, border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }} />
              </div>
              <Divider hidden />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 8 }}>
                <button type='button' onClick={handleCancel} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }} disabled={loading}>Cancel</button>
                <button type='submit' style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: '#2185d0', color: '#fff', cursor: 'pointer' }} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </Segment>
        </div>
      </div>
    </div>
  );
};

export default TeamCreate;
