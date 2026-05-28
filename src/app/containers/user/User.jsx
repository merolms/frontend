import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Paper, TextInput, Button, Select, Table, Badge, Avatar, Group, Text, ActionIcon, Pagination, Alert, Loader } from '@mantine/core';
import { IconSearch, IconPlus, IconPencil, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchUsers, deleteUser } from '@/app/services/userService';
import { fetchRoles } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';
import './User.scss';

const statusOptions = [{ value: '', label: 'All Status' }, { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }];
const sortOptions = [{ value: 'joined', label: 'Newest First' }, { value: 'name', label: 'Name A-Z' }, { value: 'email', label: 'Email A-Z' }];

const getRoleColor = (role) => { switch (role) { case 'Administrator': return 'red'; case 'Instructor': return 'blue'; case 'Team Lead': return 'purple'; case 'Student': return 'teal'; default: return 'gray'; } };

const UserContainer = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState([{ value: '', label: 'All Roles' }]);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || '';
  const statusFilter = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '';
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const loadRoles = async () => { try { const roles = await fetchRoles(); setRoleOptions([{ value: '', label: 'All Roles' }, ...roles.map((r) => ({ value: r.name, label: r.name }))]); } catch (err) { console.error(err); } };
    loadRoles();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = { start: (page - 1) * 10, limit: 10 }; if (sort) params.sort = sort;
      const data = await fetchUsers(params);
      let filtered = Array.isArray(data) ? data : [];
      if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter);
      if (statusFilter) filtered = filtered.filter((u) => String(u.status) === statusFilter);
      if (search) { const q = search.toLowerCase(); filtered = filtered.filter((u) => (u.firstName || '').toLowerCase().includes(q) || (u.lastName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)); }
      setUsers(filtered); setTotal(filtered.length);
    } catch (err) { setError(err.message || 'Failed to load users'); } finally { setLoading(false); }
  }, [search, roleFilter, statusFilter, sort, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => { if (!value) newParams.delete(key); else newParams.set(key, value); });
    if (!updates.page) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => { e.preventDefault(); updateParams({ search: searchInput, page: 1 }); };
  const handleClear = () => { setSearchInput(''); setSearchParams(new URLSearchParams()); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { setActionLoading(true); await deleteUser(deleteTarget.id); setDeleteTarget(null); addToast(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`, 'error'); fetchData(); }
    catch (err) { console.error(err); } finally { setActionLoading(false); }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'><h1 className='page-title'>Users</h1><p className='page-subtitle'>{total} user{total !== 1 ? 's' : ''} total</p></div>
          <div className='header-right'><Button leftSection={<IconPlus size={14} />} onClick={() => navigate('/users/create')}>Add User</Button></div>
        </div>

        <div className='dashboard-content'>
          {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md"><IconAlertCircle size={14} /> {error}</Alert>}

          <Paper className='user-filters' p="sm" radius="md" withBorder mb="md">
            <Group gap={8} style={{ flexWrap: 'wrap' }}>
              <form className='user-search-form' onSubmit={handleSearch}><TextInput placeholder="Search by name, email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} leftSection={<IconSearch size={16} />} /></form>
              <Select placeholder="Role" data={roleOptions} value={roleFilter} onChange={(v) => updateParams({ role: v || '', page: 1 })} className='user-filter-dropdown' allowDeselect={false} />
              <Select placeholder="Status" data={statusOptions} value={statusFilter} onChange={(v) => updateParams({ status: v || '', page: 1 })} className='user-filter-dropdown' allowDeselect={false} />
              <Select placeholder="Sort" data={sortOptions} value={sort} onChange={(v) => updateParams({ sort: v, page: 1 })} className='user-filter-dropdown' allowDeselect={false} />
              <Button variant="default" onClick={handleClear}>Clear</Button>
            </Group>
          </Paper>

          {loading ? (
            <Paper p="lg" radius="md"><Loader /><Text>Loading users...</Text></Paper>
          ) : users.length === 0 ? (
            <Paper p="xl" radius="md" ta="center"><Title order={4}>No users found</Title><Text c="dimmed">Try adjusting your filters or add a new user.</Text><Button mt="md" leftSection={<IconPlus size={14} />} onClick={() => navigate('/users/create')}>Add User</Button></Paper>
          ) : (
            <Paper p={0} radius="md" withBorder style={{ overflow: 'hidden' }}>
              <Table striped className='user-table'>
                <Table.Thead>
                  <Table.Tr><Table.Th>User</Table.Th><Table.Th>Role</Table.Th><Table.Th>Status</Table.Th><Table.Th>Joined</Table.Th><Table.Th ta="center">Actions</Table.Th></Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td><Group gap={8} onClick={() => navigate(`/users/${user.id}`)} style={{ cursor: 'pointer' }}><Avatar src={user.avatar || 'https://i.pravatar.cc/150?img=1'} size={32} radius="xl" /><div><Text size="sm" fw={600}>{user.firstName} {user.lastName}</Text><Text size="xs" c="dimmed">{user.email}</Text></div></Group></Table.Td>
                      <Table.Td><Badge color={getRoleColor(user.role)}>{user.role}</Badge></Table.Td>
                      <Table.Td><Badge color={user.status === 1 ? 'green' : 'gray'}>{user.status === 1 ? 'Active' : 'Inactive'}</Badge></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'}</Text></Table.Td>
                      <Table.Td ta="center"><Group gap={4} justify="center"><ActionIcon size="sm" variant="default" component={Link} to={`/users/${user.id}/edit`}><IconPencil size={14} /></ActionIcon><ActionIcon size="sm" color="red" variant="default" onClick={() => setDeleteTarget(user)}><IconTrash size={14} /></ActionIcon></Group></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </div>
      </div>

      <DeleteModal open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} itemName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''} itemType='user' loading={actionLoading} />
    </div>
  );
};

export default UserContainer;
