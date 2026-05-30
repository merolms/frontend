import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Eye, Pencil, Plus, Search, Shield, Star, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Paper } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { fetchRoles, deleteRole } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';
import { t } from '@/styles/theme';

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

  const filteredRoles = roles.filter((r) =>
    (r.name || '').toLowerCase().includes(searchInput.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchInput.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRoles = filteredRoles.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.id);
      setDeleteTarget(null);
      addToast(`Role "${deleteTarget.name}" deleted`, 'error');
      await loadRoles();
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <DashboardLayout
        title="Roles & Permissions"
        subtitle={`${filteredRoles.length} of ${roles.length} roles`}
      >
        {/* Action bar */}
        <div className="mb-4 flex items-center justify-end">
          <PermissionGuard permissions={['roles.create']}>
            <Button size="sm" onClick={() => navigate('/roles/create')}>
              <Plus size={14} /> New Role
            </Button>
          </PermissionGuard>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-error text-sm mb-4">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Search */}
        <Paper className="p-3 mb-4">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input placeholder="Search roles..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-8" />
          </div>
        </Paper>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield size={48} className="text-text-muted mb-3" />
            <p className="text-sm font-medium text-text-primary">No roles found</p>
            <p className="text-xs text-text-muted mt-1">Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <Paper className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Role</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Description</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Permissions</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Color</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-bg-surface-hover transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-primary">{role.name}</span>
                          {role.permissions && role.permissions.includes('*') && (
                            <Badge variant="red"><Star size={10} /></Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted">{role.description}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setShowPermissionModal(role)}
                          className="text-xs text-primary hover:underline cursor-pointer"
                        >
                          {role.permissions && role.permissions.includes('*') ? 'All' : `${(role.permissions || []).length} permissions`}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 rounded" style={{ background: role.color || '#9CA3AF' }} />
                          <span className="text-[11px] text-text-muted">{role.color || 'default'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <PermissionGuard permissions={['roles.edit']}>
                            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-bg-surface-active text-text-secondary" onClick={() => navigate(`/roles/${role.id}/edit`)} title="Edit">
                              <Pencil size={12} />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permissions={['roles.delete']}>
                            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-error/10 text-error" onClick={() => setDeleteTarget(role)} title="Delete">
                              <Trash2 size={12} />
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination total={totalPages} value={safePage} onChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </DashboardLayout>

      {/* Permission Detail Modal */}
      <Dialog open={!!showPermissionModal} onOpenChange={() => setShowPermissionModal(null)}>
        {showPermissionModal && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{showPermissionModal.name} — Permissions</DialogTitle>
            </DialogHeader>
            {showPermissionModal.permissions && showPermissionModal.permissions.includes('*') ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Star size={48} className="text-error mb-3" />
                <p className="text-xs text-text-muted">This role has <strong>full administrative access</strong> to all features.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {(showPermissionModal.permissions || []).map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check size={12} className="text-success" /> {perm}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="default" onClick={() => setShowPermissionModal(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Role</DialogTitle></DialogHeader>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default RoleManagement;
