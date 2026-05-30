import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Folder, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Paper } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { fetchCategoriesWithPagination, deleteCategory, toggleCategoryStatus, createCategory, updateCategory } from '@/app/services/categoryService';
import CategoryForm from '../components/CategoryForm';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { useToast } from '@/app/context/ToastContext';
import { t } from '@/styles/theme';

export { fetchCategoriesWithPagination, deleteCategory, toggleCategoryStatus };

const statusOptions = [{ value: 'all', label: 'All Status' }, { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }];
const sortOptions = [{ value: 'all', label: 'Default' }, { value: 'name', label: 'Name A-Z' }, { value: 'recent', label: 'Recently Updated' }];

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

  return (
    <>
      <DashboardLayout
        title="Categories"
        subtitle={`${total} categor${total === 1 ? 'y' : 'ies'} total`}
      >
        {/* Action bar */}
        <div className="mb-4 flex items-center justify-end">
          <PermissionGuard permissions={['courses.create']}>
            <Button size="sm" onClick={handleCreate}><Plus size={14} /> New Category</Button>
          </PermissionGuard>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-error text-sm mb-4">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Filters */}
        <Paper className="p-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <form className="flex items-center gap-2 flex-1" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input placeholder="Search categories..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-8" />
              </div>
            </form>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => { setSort(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>{sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="default" size="sm" onClick={handleClear}>Clear</Button>
          </div>
        </Paper>

        {/* Table */}
        <Paper className="overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Folder size={48} className="text-text-muted mb-3" />
              <p className="text-sm font-medium text-text-primary">No categories found</p>
              <p className="text-xs text-text-muted mt-1">Try adjusting your filters or create a new category.</p>
              <PermissionGuard permissions={['courses.create']}>
                <Button size="sm" className="mt-4" onClick={handleCreate}><Plus size={14} /> Create First Category</Button>
              </PermissionGuard>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Category</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Description</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-text-muted">Courses</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Updated</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat.id} className={`hover:bg-bg-surface-hover transition-colors ${cat.status === 0 ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded" style={{ background: cat.color || t('accent') }} />
                        <div>
                          <span className="text-xs font-semibold text-text-primary">{cat.name}</span>
                          {cat.slug && <p className="text-[11px] text-text-muted">{cat.slug}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{cat.description || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={(cat.courseCount || 0) > 0 ? 'blue' : 'gray'}>{(cat.courseCount || 0)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cat.status === 1 ? 'green' : 'gray'}>{cat.status === 1 ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">
                      {cat.updatedAt ? new Date(cat.updatedAt * 1000).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <PermissionGuard permissions={['courses.edit']}>
                          <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-bg-surface-active text-text-secondary" onClick={() => handleEdit(cat)} title="Edit">
                            <Pencil size={12} />
                          </button>
                        </PermissionGuard>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-bg-surface-active text-text-secondary" onClick={() => handleToggleStatus(cat)} title={cat.status === 1 ? 'Deactivate' : 'Activate'}>
                          <Trash2 size={12} />
                        </button>
                        <PermissionGuard permissions={['courses.delete']}>
                          <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-error/10 text-error" onClick={() => setDeleteTarget(cat)} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Paper>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </div>
        )}

        {formOpen && (
          <CategoryForm
            category={editingCat}
            onSubmit={handleFormSubmit}
            onClose={() => { setFormOpen(false); setEditingCat(null); }}
            loading={actionLoading}
          />
        )}
        <DeleteModal open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} itemName={deleteTarget?.name} itemType="category" loading={actionLoading} />
      </DashboardLayout>
    </>
  );
};

export default CategoryManagement;
