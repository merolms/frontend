import React, { useState, useEffect } from 'react';
import { Modal, Button, Avatar, Group, Text, Stack, Badge, Loader } from '@mantine/core';
import { Check, Plus, Users } from 'lucide-react';
import { fetchTeams } from '@/app/services/teamService';

const TeamAssignmentModal = ({ open, onClose, user, onUpdated }) => {
  const [teams, setTeams] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && user) { setAssignedTeams(user.teams ? [...user.teams] : []); loadTeams(); }
  }, [open, user]);

  const loadTeams = async () => { try { setLoading(true); const data = await fetchTeams(); setTeams(Array.isArray(data) ? data : []); } catch (err) { setError('Failed to load teams.'); } finally { setLoading(false); } };
  const isAssigned = (teamName) => assignedTeams.includes(teamName);

  if (!user) return null;

  return (
    <Modal opened={open} onClose={onClose} title={`Assign Teams — ${user.firstName} ${user.lastName}`} size="sm">
      {error && <Text c="red" size="sm" mb="sm">{error}</Text>}
      {loading ? <Loader size="sm" /> : teams.length === 0 ? <Text c="dimmed">No teams available.</Text> : (
        <Stack gap={8}>
          {teams.map((team) => (
            <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid #e8e8e8', borderRadius: 8, cursor: 'pointer' }} onClick={() => setError('Team assignment is not yet supported by the backend.')}>
              <Group gap={8}>
                <Users size={16} color={isAssigned(team.name) ? 'green' : 'gray'} />
                <Text size="sm" fw={500}>{team.name}</Text>
              </Group>
              {isAssigned(team.name) ? <Badge color="green" size="xs" leftSection={<Check size={10} />}>Assigned</Badge> : <Badge color="gray" size="xs" leftSection={<Plus size={10} />}>Assign</Badge>}
            </div>
          ))}
        </Stack>
      )}
      <Group justify="flex-end" mt="md"><Button variant="default" onClick={onClose} disabled={saving}>Done</Button></Group>
    </Modal>
  );
};

export default TeamAssignmentModal;
