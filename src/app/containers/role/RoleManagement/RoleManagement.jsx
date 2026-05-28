import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, TextInput, Button, Table, Badge, Group, Text, Stack, ActionIcon, Modal, Title, Divider, Pagination } from '@mantine/core';
import { IconSearch, IconShield, IconPlus, IconPencil, IconTrash, IconEye, IconStar, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { fetchRoles, deleteRole } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const RoleManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try { setLoading(true); setError(null); const data = await fetchRoles(); setRoles(Array.isArray(data) ? data : []); setCurrentPage(1); }
    catch (err) { setError('Failed to load roles.'); } finally { setLoading(false); }
  };

  const filteredRoles = roles.filter((r) => (r.name || '').toLowerCase().includes(searchInput.toLowerCase()) || (r.description || '').toLowerCase().includes(searchInput.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRoles = filteredRoles.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteRole(deleteTarget.id); setDeleteTarget(null); addToast(`Role "${deleteTarget.name}" deleted`, 'error'); await loadRoles(); }
    catch (err) { console.error(err); }
  };

  const rows = paginatedRoles.map((role) => (
    <Table.Tr key={role.id}>
      <Table.Td><Group gap={8}><Text size="sm" fw={600}>{role.name}</Text>{role.permissions && role.permissions.includes('*') && <Badge color="red" size="xs" variant="filled"><IconStar size={10} /></Badge>}</Group></Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{role.description}</Text></Table.Td>
      <Table.Td><Button size="xs" variant="subtle" onClick={() => setShowPermissionModal(role)} leftSection={<IconEye size={12} />}>{role.permissions && role.permissions.includes('*') ? 'All' : `${(role.permissions || []).length} permissions`}</Button></Table.Td>
      <Table.Td><Group gap={6}><span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: role.color || '#767676' }} /><Text size="xs" c="dimmed">{role.color || 'default'}</Text></Group></Table.Td>
      <Table.Td ta="center">
        <Group gap={4} justify="center">
          <PermissionGuard permissions={['roles.edit']}><ActionIcon size="sm" variant="default" onClick={() => navigate(`/roles/${role.id}/edit`)}><IconPencil size={14} /></ActionIcon></PermissionGuard>
          <PermissionGuard permissions={['roles.delete']}><ActionIcon size="sm" color="red" variant="default" onClick={() => setDeleteTarget(role)}><IconTrash size={14} /></ActionIcon></PermissionGuard>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'><h1 className='page-title'>Roles & Permissions</h1><p className='page-subtitle'>{filteredRoles.length} of {roles.length} roles</p></div>
          <div className='header-right'><PermissionGuard permissions={['roles.create']}><Button leftSection={<IconPlus size={14} />} onClick={() => navigate('/roles/create')}>New Role</Button></PermissionGuard></div>
        </div>

        <div className='dashboard-content'>
          {error && <Paper p="sm" radius="md" withBorder mb="md"><Text c="red"><IconAlertCircle size={14} /> {error}</Text></Paper>}

          <Paper className='role-filters' p="sm" radius="md" withBorder mb="md">
            <form onSubmit={(e) => e.preventDefault()}><TextInput placeholder="Search roles..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} leftSection={<IconSearch size={16} />} /></form>
          </Paper>

          {loading ? (
            <Paper p="lg"><Text>Loading roles...</Text></Paper>
          ) : filteredRoles.length === 0 ? (
            <Paper p="xl" radius="md" ta="center"><IconShield size={48} color="#999" /><Title order={4}>No roles found</Title><p>Try adjusting your search.</p></Paper>
          ) : (
            <>
              <Paper p={0} radius="md" withBorder style={{ overflow: 'hidden' }}>
                <Table striped className='role-table'>
                  <Table.Thead><Table.Tr><Table.Th>Role</Table.Th><Table.Th>Description</Table.Th><Table.Th>Permissions</Table.Th><Table.Th>Color</Table.Th><Table.Th ta="center">Actions</Table.Th></Table.Tr></Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Paper>
              {totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination total={totalPages} value={safePage} onChange={setCurrentPage} />
                </Group>
              )}
            </>
          )}
        </div>
      </div>

      {/* Permission Detail Modal */}
      <Modal opened={!!showPermissionModal} onClose={() => setShowPermissionModal(null)} title={`${showPermissionModal?.name} — Permissions`}>
        {showPermissionModal && (
          <>
            {showPermissionModal.permissions && showPermissionModal.permissions.includes('*') ? (
              <Stack ta="center" p="md"><IconStar size={48} color="red" /><Text c="dimmed">This role has <strong>full administrative access</strong> to all features.</Text></Stack>
            ) : (
              <Stack gap={4}>
                {(showPermissionModal.permissions || []).map((perm) => (
                  <Group key={perm} gap={8}><IconCheck size={14} color="green" /><Text size="sm">{perm}</Text></Group>
                ))}
              </Stack>
            )}
            <Group justify="flex-end" mt="md"><Button variant="default" onClick={() => setShowPermissionModal(null)}>Close</Button></Group>
          </>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Role" size="sm">
        <Text size="sm">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default RoleManagement;
