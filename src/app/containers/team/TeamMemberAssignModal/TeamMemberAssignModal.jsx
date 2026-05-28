import React, { useState, useEffect } from 'react';
import { Modal, Button, Avatar, Group, Text, Stack, Badge, ActionIcon, Loader, Alert } from '@mantine/core';
import { IconUsers, IconPlus, IconMinus, IconAlertCircle, IconCheck } from '@tabler/icons-react';
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
    if (open && team) { loadAll(); }
    else if (!open) { setMembers([]); setAvailableUsers([]); setBusyIds(new Set()); setError(null); }
  }, [open, team]);

  const loadAll = async () => {
    try { setLoading(true); const membersData = await fetchTeamMembers(team.id); setMembers(membersData); await loadAvailableUsers(membersData); }
    catch (err) { setError('Failed to load team members.'); } finally { setLoading(false); }
  };

  const loadAvailableUsers = async (membersData) => {
    try { const allUsers = await fetchUsers({ limit: 100 }); const memberIds = new Set((membersData || []).map((m) => m.userID || m.userId)); setAvailableUsers(allUsers.filter((u) => !memberIds.has(u.id))); } catch (err) { console.error(err); }
  };

  const markBusy = (id, busy) => { setBusyIds((prev) => { const next = new Set(prev); if (busy) next.add(id); else next.delete(id); return next; }); };

  const handleAddMember = async (user) => {
    const key = `add-${user.id}`; if (busyIds.has(key)) return;
    try {
      markBusy(key, true); setError(null); await addMemberToTeam(team.id, user.id);
      setAvailableUsers((prev) => prev.filter((u) => u.id !== user.id));
      setMembers((prev) => [...prev, { userID: user.id, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim(), avatar: user.avatar || '', role: user.role || '', userEmail: user.email || '' }]);
      addToast(`${user.firstName} ${user.lastName} added to team`, 'success'); if (onUpdated) onUpdated();
    } catch (err) { setError(err.message || 'Failed to add member.'); await loadAll(); } finally { markBusy(key, false); }
  };

  const handleRemoveMember = async (member) => {
    const userId = member.userID || member.userId; const key = `remove-${userId}`; if (busyIds.has(key)) return;
    try {
      markBusy(key, true); setError(null); await removeMemberFromTeam(team.id, userId);
      setMembers((prev) => prev.filter((m) => (m.userID || m.userId) !== userId));
      addToast(`${member.userName || 'Member'} removed from team`, 'error'); if (onUpdated) onUpdated();
    } catch (err) { setError(err.message || 'Failed to remove member.'); await loadAll(); } finally { markBusy(key, false); }
  };

  if (!team) return null;

  const getRoleColor = (role) => { switch (role) { case 'Administrator': return 'red'; case 'Instructor': return 'blue'; case 'Team Lead': return 'purple'; case 'Student': return 'teal'; default: return 'gray'; } };

  return (
    <Modal opened={open} onClose={busyIds.size === 0 ? onClose : undefined} title={`Manage Members — ${team.name}`} size="lg" className="ui modal">
      {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" size="sm">{error}</Alert>}

      <Text fw={600} mb={8}><IconCheck size={14} color="green" /> Current Members ({members.length})</Text>
      {loading ? <Loader size="sm" /> : members.length === 0 ? <Text c="dimmed" size="sm">No members assigned yet.</Text> : (
        <Stack gap={4} mb="md">
          {members.map((member) => {
            const userId = member.userID || member.userId;
            const userName = member.userName || 'Unknown';
            const isBusy = busyIds.has(`remove-${userId}`);
            return (
              <div key={userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                <Group gap={10}>
                  <Avatar src={member.avatar || 'https://i.pravatar.cc/150?img=1'} size={32} radius="xl" />
                  <div><Text size="sm" fw={600}>{userName}</Text><Badge color={getRoleColor(member.role)} size="xs">{member.role || 'N/A'}</Badge></div>
                </Group>
                <ActionIcon size="sm" color="red" onClick={() => handleRemoveMember(member)} disabled={isBusy} loading={isBusy}><IconMinus size={14} /></ActionIcon>
              </div>
            );
          })}
        </Stack>
      )}

      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e8e8e8' }} />

      <Text fw={600} mb={8}><IconPlus size={14} color="#2185d0" /> Available Users ({availableUsers.length})</Text>
      {availableUsers.length === 0 ? <Text c="dimmed" size="sm">All users are already assigned or no users found.</Text> : (
        <Stack gap={4}>
          {availableUsers.map((user) => {
            const isBusy = busyIds.has(`add-${user.id}`);
            return (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                <Group gap={10}>
                  <Avatar src={user.avatar || 'https://i.pravatar.cc/150?img=1'} size={32} radius="xl" />
                  <div><Text size="sm" fw={600}>{user.firstName} {user.lastName}</Text><Text size="xs" c="dimmed">{user.email}</Text></div>
                </Group>
                <Group gap={8}>
                  <Badge color={getRoleColor(user.role)} size="xs">{user.role}</Badge>
                  <ActionIcon size="sm" color="green" onClick={() => handleAddMember(user)} disabled={isBusy} loading={isBusy}><IconPlus size={14} /></ActionIcon>
                </Group>
              </div>
            );
          })}
        </Stack>
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} disabled={busyIds.size > 0}>Done</Button>
      </Group>
    </Modal>
  );
};

export default TeamMemberAssignModal;
