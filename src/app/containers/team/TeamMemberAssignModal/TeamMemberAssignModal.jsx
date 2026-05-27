import React, { useState, useEffect } from 'react';
import { Modal, Button, Header, Icon, Label, Image, Divider, Message } from 'semantic-ui-react';
import { fetchTeamMembers, fetchUsers, addMemberToTeam, removeMemberFromTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';

const TeamMemberAssignModal = ({ open, onClose, team, onUpdated }) => {
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyIds, setBusyIds] = useState(new Set());
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (open && team) {
      loadAll();
    } else if (!open) {
      setMembers([]);
      setAvailableUsers([]);
      setBusyIds(new Set());
      setError(null);
    }
  }, [open, team]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const membersData = await fetchTeamMembers(team.id);
      setMembers(membersData);
      await loadAvailableUsers(membersData);
    } catch (err) {
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async (membersData) => {
    try {
      const allUsers = await fetchUsers({ limit: 100 });
      const memberIds = new Set((membersData || []).map((m) => m.userID || m.userId));
      const available = allUsers.filter((u) => !memberIds.has(u.id));
      setAvailableUsers(available);
    } catch (err) {
      console.error('Error loading available users:', err);
    }
  };

  const markBusy = (id, busy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAddMember = async (user) => {
    const key = `add-${user.id}`;
    if (busyIds.has(key)) return;
    try {
      markBusy(key, true);
      setError(null);
      await addMemberToTeam(team.id, user.id);
      // Optimistically move user from available to members
      setAvailableUsers((prev) => prev.filter((u) => u.id !== user.id));
      setMembers((prev) => [
        ...prev,
        {
          userID: user.id,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`.trim(),
          avatar: user.avatar || '',
          role: user.role || '',
          userEmail: user.email || '',
        },
      ]);
      addToast(`${user.firstName} ${user.lastName} added to team`, 'success');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add member.');
      // Revert: reload to be safe
      await loadAll();
    } finally {
      markBusy(key, false);
    }
  };

  const handleRemoveMember = async (member) => {
    const userId = member.userID || member.userId;
    const key = `remove-${userId}`;
    if (busyIds.has(key)) return;
    try {
      markBusy(key, true);
      setError(null);
      await removeMemberFromTeam(team.id, userId);
      // Optimistically remove from members and add back to available
      setMembers((prev) => prev.filter((m) => (m.userID || m.userId) !== userId));
      setAvailableUsers((prev) => [
        ...prev,
        {
          id: userId,
          firstName: member.userName ? member.userName.split(' ')[0] : '',
          lastName: member.userName ? member.userName.split(' ').slice(1).join(' ') : '',
          email: member.userEmail || '',
          avatar: member.avatar || '',
          role: member.role || '',
        },
      ]);
      addToast(`${member.userName || 'Member'} removed from team`, 'error');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to remove member.');
      await loadAll();
    } finally {
      markBusy(key, false);
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
    <Modal open={open} onClose={onClose} size='large' closeOnDimmerClick={busyIds.size === 0}>
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
        {loading ? (
          <p style={{ color: '#888', padding: '8px 0 20px' }}>Loading members...</p>
        ) : members.length === 0 ? (
          <p style={{ color: '#aaa', padding: '8px 0 20px' }}>No members assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
            {members.map((member) => {
              const userId = member.userID || member.userId;
              const userName = member.userName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown';
              const isBusy = busyIds.has(`remove-${userId}`);
              return (
                <div key={userId} className='team-assign-member' style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Image src={member.avatar || 'https://i.pravatar.cc/150?img=1'} circular size='mini' />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{userName}</div>
                      <Label color={getRoleColor(member.role)} size='tiny'>{member.role || 'N/A'}</Label>
                    </div>
                  </div>
                  <Button size='small' icon='minus circle' color='red' onClick={() => handleRemoveMember(member)} disabled={isBusy} loading={isBusy} />
                </div>
              );
            })}
          </div>
        )}

        <Divider />

        {/* Available Users */}
        <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name='user plus' color='blue' />
          Available Users ({availableUsers.length})
        </h4>
        {availableUsers.length === 0 ? (
          <p style={{ color: '#aaa', padding: '8px 0' }}>All users are already assigned or no users found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {availableUsers.map((user) => {
              const isBusy = busyIds.has(`add-${user.id}`);
              return (
                <div key={user.id} className='team-assign-user' style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Image src={user.avatar || 'https://i.pravatar.cc/150?img=1'} circular size='mini' />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Label color={getRoleColor(user.role)} size='tiny'>{user.role}</Label>
                    <Button size='small' icon='plus circle' color='green' onClick={() => handleAddMember(user)} disabled={isBusy} loading={isBusy} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} disabled={busyIds.size > 0}>Done</Button>
      </Modal.Actions>
    </Modal>
  );
};

export default TeamMemberAssignModal;
