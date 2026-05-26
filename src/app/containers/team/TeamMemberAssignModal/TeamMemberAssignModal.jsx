import React, { useState, useEffect } from 'react';
import { Modal, Button, Header, Icon, Label, Image, Divider } from 'semantic-ui-react';
import { getAvailableUsers, addMemberToTeam, removeMemberFromTeam } from '@/app/services/teamService';

const TeamMemberAssignModal = ({ open, onClose, team, onUpdated }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && team) {
      setMembers(team.members ? [...team.members] : []);
      loadAvailableUsers();
    }
  }, [open, team]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      const users = await getAvailableUsers(team.id);
      setAvailableUsers(users);
    } catch (err) {
      setError('Failed to load available users.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (user) => {
    try {
      setSaving(true);
      setError(null);
      await addMemberToTeam(team.id, user.id);
      setMembers((prev) => [...prev, { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar: user.avatar }]);
      setAvailableUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (user) => {
    try {
      setSaving(true);
      setError(null);
      await removeMemberFromTeam(team.id, user.id);
      setMembers((prev) => prev.filter((m) => m.id !== user.id));
      setAvailableUsers((prev) => [...prev, { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar: user.avatar, email: user.email }]);
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to remove member.');
    } finally {
      setSaving(false);
    }
  };

  if (!team) return null;

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
    <Modal open={open} onClose={onClose} size='large' closeOnDimmerClick={!saving}>
      <Header icon='users' content={`Manage Members — ${team.name}`} />
      <Modal.Content>
        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#c53030', fontSize: '13px' }}>
            <Icon name='warning circle' /> {error}
          </div>
        )}

        {/* Current Members */}
        <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name='check circle' color='green' />
          Current Members ({members.length})
        </h4>
        {members.length === 0 ? (
          <p style={{ color: '#aaa', padding: '8px 0 20px' }}>No members assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
            {members.map((member) => (
              <div key={member.id} className='team-assign-member' style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Image src={member.avatar} circular size='mini' />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {member.firstName} {member.lastName}
                      {member.id === team.leaderId && <Label color='purple' size='tiny' style={{ marginLeft: 6 }}><Icon name='star' /> Leader</Label>}
                    </div>
                    <Label color={getRoleColor(member.role)} size='tiny'>{member.role}</Label>
                  </div>
                </div>
                <Button size='small' icon='minus circle' color='red' onClick={() => handleRemoveMember(member)} disabled={saving} />
              </div>
            ))}
          </div>
        )}

        <Divider />

        {/* Available Users */}
        <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name='user plus' color='blue' />
          Available Users ({availableUsers.length})
        </h4>
        {loading ? (
          <p style={{ color: '#888', padding: '8px 0' }}>Loading...</p>
        ) : availableUsers.length === 0 ? (
          <p style={{ color: '#aaa', padding: '8px 0' }}>All users are already assigned.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {availableUsers.map((user) => (
              <div key={user.id} className='team-assign-user' style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Image src={user.avatar} circular size='mini' />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Label color={getRoleColor(user.role)} size='tiny'>{user.role}</Label>
                  <Button size='small' icon='plus circle' color='green' onClick={() => handleAddMember(user)} disabled={saving} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} disabled={saving}>Done</Button>
      </Modal.Actions>
    </Modal>
  );
};

export default TeamMemberAssignModal;
