import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { createTeam } from '@/app/services/teamService';

const PRESET_COLORS = ['#1976d2', '#7b1fa2', '#e65100', '#33a163', '#c62828', '#00838f', '#f57f17', '#4a148c', '#2185d0', '#d32f2f', '#388e3c', '#f57c00'];

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <input name='color' type='color' value={formData.color} onChange={handleChange} style={{ width: 48, height: 36, border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: formData.color, border: '1px solid #e8e8e8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#888', fontFamily: 'monospace' }}>{formData.color}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type='button'
                      onClick={() => setFormData((prev) => ({ ...prev, color: c }))}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        background: c,
                        border: formData.color === c ? '2px solid #333' : '1px solid #e8e8e8',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={c}
                    />
                  ))}
                </div>
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
