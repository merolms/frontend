import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Paper, TextInput, Button, Select, SimpleGrid, Avatar, Group, Text, Stack, Card, Badge, ActionIcon, Pagination, Skeleton } from '@mantine/core';
import { IconSearch, IconPlus, IconUsers, IconAlertCircle } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamMemberAssignModal from '@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchTeams, fetchTeamMembers, deleteTeam } from '@/app/services/teamService';
import './Team.scss';

const statusOptions = [{ value: '', label: 'All' }, { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }];
const sortOptions = [{ value: 'newest', label: 'Newest First' }, { value: 'name', label: 'Name A-Z' }];
const AVATAR_COUNT = 4;

const TeamContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [assignTeam, setAssignTeam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '';
  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = { start: (page - 1) * 8, limit: 8 };
      if (sort) params.sort = sort;
      const data = await fetchTeams(params);
      const teamList = Array.isArray(data) ? data : [];
      let filtered = teamList;
      if (statusFilter) filtered = filtered.filter((t) => String(t.status) === statusFilter);
      if (search) { const q = search.toLowerCase(); filtered = filtered.filter((t) => (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)); }
      const teamsWithMembers = await Promise.all(filtered.map(async (team) => {
        try { const members = await fetchTeamMembers(team.id); return { ...team, memberCount: members.length, memberAvatars: members.slice(0, AVATAR_COUNT).map((m) => ({ avatar: m.avatar || 'https://i.pravatar.cc/150?img=1', userName: m.userName || 'Unknown' })) }; }
        catch { return { ...team, memberCount: 0, memberAvatars: [] }; }
      }));
      setTeams(teamsWithMembers); setTotal(teamsWithMembers.length);
    } catch (err) { setError(err.message || 'Failed to load teams'); } finally { setLoading(false); }
  }, [search, statusFilter, sort, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => { if (!value) newParams.delete(key); else newParams.set(key, value); });
    if (!updates.page) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => { e.preventDefault(); updateParams({ search: searchInput, page: 1 }); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { setActionLoading(true); await deleteTeam(deleteTarget.id); setDeleteTarget(null); fetchData(); }
    catch (err) { console.error(err); } finally { setActionLoading(false); }
  };

  const handleClear = () => { setSearchInput(''); setSearchParams(new URLSearchParams()); };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'><h1 className='page-title'>Teams</h1><p className='page-subtitle'>{total} team{total !== 1 ? 's' : ''} total</p></div>
          <div className='header-right'><Button leftSection={<IconPlus size={14} />} onClick={() => navigate('/teams/create')}>New Team</Button></div>
        </div>

        <div className='dashboard-content'>
          {error && <Paper p="sm" radius="md" withBorder mb="md"><Text c="red"><IconAlertCircle size={14} /> {error}</Text></Paper>}

          <Paper className='team-filters' p="sm" radius="md" withBorder mb="md">
            <Group gap={8} style={{ flexWrap: 'wrap' }}>
              <form className='team-search-form' onSubmit={handleSearch}><TextInput placeholder="Search teams..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} leftSection={<IconSearch size={16} />} /></form>
              <Select placeholder="Status" data={statusOptions} value={statusFilter} onChange={(v) => updateParams({ status: v || '', page: 1 })} className='team-filter-dropdown' allowDeselect={false} />
              <Select placeholder="Sort" data={sortOptions} value={sort} onChange={(v) => updateParams({ sort: v, page: 1 })} className='team-filter-dropdown' allowDeselect={false} />
              <Button variant="default" onClick={handleClear}>Clear</Button>
            </Group>
          </Paper>

          {loading ? (
            <Paper p="lg" radius="md" withBorder className='team-grid-segment'>
              <SimpleGrid cols={4}>{[...Array(4)].map((_, i) => <Skeleton key={i} height={200} radius="md" />)}</SimpleGrid>
            </Paper>
          ) : teams.length === 0 ? (
            <Paper p="xl" radius="md" className='team-empty' ta="center">
              <IconUsers size={48} color="#999" /><Title order={4}>No teams found</Title><Text c="dimmed">Try adjusting your filters or create a new team.</Text>
              <Button mt="md" leftSection={<IconPlus size={14} />} onClick={() => navigate('/teams/create')}>Create Team</Button>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" className='teams-grid'>
              {teams.map((team) => (
                <Card key={team.id} className='team-card' padding="md" radius="md" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate(`/teams/${team.id}`)}>
                  <div className='team-card-header' style={{ background: team.color || '#2185d0', padding: 12, margin: '-16px -16px 12px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <IconUsers size={20} color="rgba(255,255,255,0.8)" />
                    <Badge size="xs" color={team.status === 1 ? 'green' : 'gray'} variant="filled">{team.status === 1 ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <Text fw={600} size="sm" className="team-card-title">{team.name}</Text>
                  <Text size="xs" c="dimmed" lineClamp={2}>{team.description || 'No description'}</Text>
                  <Group gap={4} mt={8}>
                    {team.memberAvatars?.map((m, idx) => <Avatar key={idx} src={m.avatar} size={24} radius="xl" title={m.userName} />)}
                    {team.memberCount > AVATAR_COUNT && <Text size="xs" c="dimmed">+{team.memberCount - AVATAR_COUNT}</Text>}
                    {team.memberCount === 0 && <Text size="xs" c="dimmed">No members</Text>}
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </div>
      </div>

      {assignTeam && <TeamMemberAssignModal open={!!assignTeam} onClose={() => setAssignTeam(null)} team={assignTeam} onUpdated={fetchData} />}
      <DeleteModal open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} itemName={deleteTarget?.name} itemType='team' loading={actionLoading} />
    </div>
  );
};

export default TeamContainer;
