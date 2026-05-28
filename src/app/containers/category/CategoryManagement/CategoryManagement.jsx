import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, TextInput, Button, Select, Table, Badge, Group, Text, Stack, Pagination, Skeleton, ActionIcon } from '@mantine/core';
import { AlertCircle, Check, Folder, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchCategoriesWithPagination, deleteCategory, toggleCategoryStatus, createCategory, updateCategory } from '@/app/services/categoryService';
import CategoryForm from '../components/CategoryForm';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { useToast } from '@/app/context/ToastContext';
import './Category.scss';

export { fetchCategoriesWithPagination, deleteCategory, toggleCategoryStatus };

const statusOptions = [{ value: '', label: 'All Status' }, { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }];
const sortOptions = [{ value: '', label: 'Default' }, { value: 'name', label: 'Name A-Z' }, { value: 'recent', label: 'Recently Updated' }];

const CategoryManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const start = (page - 1) * limit;
      let { categories: data, total: totalCount } = await fetchCategoriesWithPagination({ start, limit });
      if (search) { const q = search.toLowerCase(); data = data.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)); }
      if (statusFilter) { data = data.filter((c) => String(c.status) === statusFilter); }
      if (sort === 'name') data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      else if (sort === 'recent') data.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setCategories(data); setTotal(totalCount); setTotalPages(Math.ceil(totalCount / limit) || 1);
    } catch (err) { setError(err.message || 'Failed to load categories'); } finally { setLoading(false); }
  }, [search, statusFilter, sort, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handleCreate = () => { setEditingCat(null); setFormOpen(true); };
  const handleEdit = (cat) => { setEditingCat(cat); setFormOpen(true); };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingCat) { await updateCategory(editingCat.id, formData); addToast(`Category "${formData.name}" updated`, 'success'); }
      else { await createCategory(formData); addToast(`Category "${formData.name}" created`, 'success'); }
      setFormOpen(false); setEditingCat(null); await fetchData();
    } catch (err) { throw err; } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { setActionLoading(true); await deleteCategory(deleteTarget.id); setDeleteTarget(null); addToast(`Category "${deleteTarget.name}" deleted`, 'error'); await fetchData(); }
    catch (err) { alert(err.message); } finally { setActionLoading(false); }
  };

  const handleToggleStatus = async (cat) => { try { await toggleCategoryStatus(cat.id); await fetchData(); } catch (err) { alert(err.message); } };

  const handleClear = () => { setSearchInput(''); setSearch(''); setStatusFilter(''); setSort(''); setPage(1); };

  const rows = categories.map((cat) => (
    <Table.Tr key={cat.id} className={cat.status === 0 ? 'status-inactive' : ''}>
      <Table.Td><Group gap={8}><span className='category-dot' style={{ width: 8, height: 8, borderRadius: 4, background: cat.color || '#1976d2' }} /><div><Text size="sm" fw={600}>{cat.name}</Text>{cat.slug && <Text size="xs" c="dimmed">{cat.slug}</Text>}</div></Group></Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{cat.description || '—'}</Text></Table.Td>
      <Table.Td ta="center"><Badge size="sm" variant="light" color={(cat.courseCount || 0) > 0 ? 'blue' : 'gray'}>{cat.courseCount || 0}</Badge></Table.Td>
      <Table.Td><Badge size="sm" variant="light" color={cat.status === 1 ? 'green' : 'gray'}>{cat.status === 1 ? 'Active' : 'Inactive'}</Badge></Table.Td>
      <Table.Td><Text size="xs" c="dimmed">{cat.updatedAt ? new Date(cat.updatedAt * 1000).toLocaleDateString() : '—'}</Text></Table.Td>
      <Table.Td ta="center">
        <Group gap={4} justify="center">
          <PermissionGuard permissions={['courses.edit']}><ActionIcon size="sm" variant="default" onClick={() => handleEdit(cat)} title="Edit"><Pencil size={14} /></ActionIcon></PermissionGuard>
          <ActionIcon size="sm" variant="default" onClick={() => handleToggleStatus(cat)} title={cat.status === 1 ? 'Deactivate' : 'Activate'}>{cat.status === 1 ? <Plus size={14} /> : <Check size={14} />}</ActionIcon>
          <PermissionGuard permissions={['courses.delete']}><ActionIcon size="sm" color="red" variant="default" onClick={() => setDeleteTarget(cat)} title="Delete"><Trash2 size={14} /></ActionIcon></PermissionGuard>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'><h1 className='page-title'>Categories</h1><p className='page-subtitle'>{total} categor{total === 1 ? 'y' : 'ies'} total</p></div>
          <div className='header-right'><PermissionGuard permissions={['courses.create']}><Button leftSection={<Plus size={14} />} onClick={handleCreate}>New Category</Button></PermissionGuard></div>
        </div>

        <div className='dashboard-content'>
          {error && <Paper p="sm" radius="md" withBorder mb="md"><Text c="red"><AlertCircle size={14} /> {error}</Text></Paper>}

          <Paper className='category-filters' p="sm" radius="md" withBorder mb="md">
            <Group gap={8} style={{ flexWrap: 'wrap' }}>
              <form className='category-search-form' onSubmit={handleSearch}><TextInput placeholder="Search categories..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} leftSection={<Search size={16} />} /></form>
              <Select placeholder="Status" data={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v || ''); setPage(1); }} className='category-filter-dropdown' allowDeselect={false} />
              <Select placeholder="Sort" data={sortOptions} value={sort} onChange={(v) => { setSort(v || ''); setPage(1); }} className='category-filter-dropdown' allowDeselect={false} />
              <Button variant="default" onClick={handleClear}>Clear</Button>
            </Group>
          </Paper>

          <Paper className='category-table-segment' p={0} radius="md" withBorder>
            {loading ? (
              <Table><Table.Thead><Table.Tr><Table.Th>Category</Table.Th><Table.Th>Description</Table.Th><Table.Th>Courses</Table.Th><Table.Th>Status</Table.Th><Table.Th>Updated</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{[...Array(5)].map((_, i) => (<Table.Tr key={i}><Table.Td colSpan={6}><Skeleton height={20} /></Table.Td></Table.Tr>))}</Table.Tbody></Table>
            ) : categories.length === 0 ? (
              <div className='category-empty' ta="center" p="xl"><Folder size={48} color="#999" /><Title order={4} c="dimmed">No categories found</Title><Text>Try adjusting your filters or create a new category.</Text><PermissionGuard permissions={['courses.create']}><Button mt="md" onClick={handleCreate} leftSection={<Plus size={14} />}>Create First Category</Button></PermissionGuard></div>
            ) : (
              <Table striped className='category-table'>
                <Table.Thead><Table.Tr><Table.Th>Category</Table.Th><Table.Th>Description</Table.Th><Table.Th ta="center">Courses</Table.Th><Table.Th>Status</Table.Th><Table.Th>Updated</Table.Th><Table.Th ta="center">Actions</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            )}
          </Paper>

          {totalPages > 1 && (<div className='category-pagination' style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}><Pagination total={totalPages} value={page} onChange={setPage} /></div>)}

          {formOpen && <CategoryForm category={editingCat} onSubmit={handleFormSubmit} onClose={() => { setFormOpen(false); setEditingCat(null); }} loading={actionLoading} />}
          <DeleteModal open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} itemName={deleteTarget?.name} itemType='category' loading={actionLoading} />
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
