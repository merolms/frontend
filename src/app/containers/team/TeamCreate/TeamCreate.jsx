import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, TextInput, Textarea, Group, Title, Text, Stack, ColorInput, Center } from '@mantine/core';
import { IconUsers, IconPlus } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { createTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';

const PRESET_COLORS = ['#1976d2', '#7b1fa2', '#e65100', '#33a163', '#c62828', '#00838f', '#f57f17', '#4a148c', '#2185d0', '#d32f2f', '#388e3c', '#f57c00'];

const TeamCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#2185d0', status: 1 });

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Team name is required.'); return; }
    try { setLoading(true); setError(null); const team = await createTeam(formData); addToast(`Team "${team.name}" created successfully`, 'success'); navigate(`/teams/${team.id}`); }
    catch (err) { setError(err.message || 'Failed to create team.'); } finally { setLoading(false); }
  };
  const handleCancel = () => navigate('/teams');

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md" className="breadcrumb"><Anchor onClick={() => navigate('/teams')}>Teams</Anchor><span>Create Team</span></Breadcrumbs>

        <Paper className='team-form-segment' p="lg" radius="md" withBorder>
          <Title order={3} mb={4}><IconUsers size={20} color="#33a163" /> Create New Team</Title>
          <Text c="dimmed" size="sm" mb="md">Set up a new team and start assigning members.</Text>

          {error && <Text c="red" size="sm" mb="sm" className="team-form-error">Team name is required.</Text>}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput label="Team Name *" name="name" placeholder="e.g. Engineering Team" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
              <Textarea label="Description" name="description" placeholder="What is this team about?" minRows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />

              <div>
                <Text size="sm" fw={500} mb={4}>Color</Text>
                <Group gap={8}>
                  <ColorInput name="color" value={formData.color} onChange={(v) => handleChange('color', v)} format="hex" size="md" swatches={PRESET_COLORS} />
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: formData.color, border: '1px solid #e8e8e8', flexShrink: 0 }} />
                  <Text size="sm" c="dimmed" ff="monospace">{formData.color}</Text>
                </Group>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {PRESET_COLORS.map((c) => (
                    <button key={c} type='button' onClick={() => handleChange('color', c)} style={{ width: 28, height: 28, borderRadius: 4, background: c, border: formData.color === c ? '2px solid #333' : '1px solid #e8e8e8', cursor: 'pointer', padding: 0 }} title={c} />
                  ))}
                </div>
              </div>

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={handleCancel} disabled={loading}>Cancel</Button>
                <Button type="submit" loading={loading}>{loading ? 'Creating...' : 'Create Team'}</Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default TeamCreate;
