import React, { useState, useEffect } from 'react';
import { Modal, Button, Header, Icon, Label, Message } from 'semantic-ui-react';
import { mockGetTeams, mockAssignUserToTeam, mockRemoveUserFromTeam } from '@/app/services/userService';

const TeamAssignmentModal = ({ open, onClose, user, onUpdated }) => {
  const [teams, setTeams] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && user) {
      loadTeams();
      setAssignedTeams(user.teams ? [...user.teams] : []);
    }
  }, [open, user]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await mockGetTeams();
      setTeams(data);
    } catch (err) {
      setError('Failed to load teams.');
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (teamName) => assignedTeams.includes(teamName);

  const handleToggleTeam = async (team) => {
    try {
      setSaving(true);
      setError(null);
      if (isAssigned(team.name)) {
        await mockRemoveUserFromTeam(user.id, team.id);
        setAssignedTeams((prev) => prev.filter((t) => t !== team.name));
      } else {
        await mockAssignUserToTeam(user.id, team.id);
        setAssignedTeams((prev) => [...prev, team.name]);
      }
      if (onUpdated) onUpdated();
    } catch (err) {
      setError('Failed to update team assignment.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} size='small' closeOnDimmerClick={!saving}>
      <Header icon='users' content={`Assign Teams — ${user.firstName} ${user.lastName}`} />
      <Modal.Content>
        {error && (
          <Message error size='small' onDismiss={() => setError(null)}>
            {error}
          </Message>
        )}

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>Loading teams...</div>
        ) : teams.length === 0 ? (
          <p style={{ color: '#888' }}>No teams available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {teams.map((team) => (
              <div
                key={team.id}
                className='team-assign-item'
                onClick={() => !saving && handleToggleTeam(team)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  border: '1px solid #e8e8e8',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  background: isAssigned(team.name) ? '#e8f5e9' : '#fff',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name='users' color={isAssigned(team.name) ? 'green' : 'grey'} />
                  <span style={{ fontWeight: 500 }}>{team.name}</span>
                </div>
                {isAssigned(team.name) ? (
                  <Label color='green' size='tiny'>
                    <Icon name='check' /> Assigned
                  </Label>
                ) : (
                  <Label color='grey' size='tiny'>
                    <Icon name='plus' /> Assign
                  </Label>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} disabled={saving}>
          Done
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default TeamAssignmentModal;
