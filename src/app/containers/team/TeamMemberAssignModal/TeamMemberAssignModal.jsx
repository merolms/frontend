import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Check, ChevronLeft, ChevronRight, Loader, Minus, Plus, Search } from 'lucide-react';
import { fetchTeamMembers, fetchUsers, addMemberToTeam, removeMemberFromTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { t } from '@/styles/theme';

const PAGE_SIZE = 10;

const TeamMemberAssignModal = ({ open, onClose, team, onUpdated }) => {
  const [members, setMembers] = useState([]);
  const [allAvailable, setAllAvailable] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyIds, setBusyIds] = useState(new Set());
  const [error, setError] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [memberIds, setMemberIds] = useState(new Set());
  const { addToast } = useToast();

  useEffect(() => {
    if (open && team) {
      loadAll();
    } else if (!open) {
      setMembers([]);
      setAllAvailable([]);
      setDisplayedUsers([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalAvailable(0);
      setBusyIds(new Set());
      setError(null);
      setUserSearch('');
      setMemberIds(new Set());
    }
  }, [open, team]);

  const paginate = useCallback((users, page) => {
    const total = Math.ceil(users.length / PAGE_SIZE) || 1;
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setDisplayedUsers(users.slice(start, end));
    setCurrentPage(page);
    setTotalPages(total);
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const membersData = await fetchTeamMembers(team.id);
      setMembers(membersData);
      const mIds = new Set((membersData || []).map((m) => m.userID || m.userId));
      setMemberIds(mIds);
      await loadAvailableUsers(mIds);
    } catch (err) {
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async (mIds) => {
    try {
      // Load first page of users
      const result = await fetchUsers({ start: 0, limit: PAGE_SIZE });
      const firstBatch = Array.isArray(result.users) ? result.users : [];
      const available = firstBatch.filter((u) => !mIds.has(u.id));
      setAllAvailable(available);
      setTotalAvailable(available.length);
      paginate(available, 1);
    } catch (err) {
      console.error(err);
      setAllAvailable([]);
      setDisplayedUsers([]);
    }
  };

  const loadMoreUsers = async () => {
    setLoadingMore(true);
    try {
      const start = allAvailable.length;
      const result = await fetchUsers({ start, limit: PAGE_SIZE });
      const newBatch = Array.isArray(result.users) ? result.users : [];
      if (newBatch.length === 0) return;

      const filtered = newBatch.filter((u) => !memberIds.has(u.id));
      const updated = [...allAvailable, ...filtered];
      setAllAvailable(updated);
      setTotalAvailable(updated.length);
      // Show the newly loaded page
      const newPage = Math.ceil(updated.length / PAGE_SIZE);
      paginate(updated, newPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!userSearch.trim()) {
      paginate(allAvailable, 1);
      return;
    }
    const q = userSearch.toLowerCase();
    const filtered = allAvailable.filter((u) =>
      (u.firstName || '').toLowerCase().includes(q) ||
      (u.lastName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
    setTotalAvailable(filtered.length);
    paginate(filtered, 1);
  };

  const handleClearSearch = () => {
    setUserSearch('');
    paginate(allAvailable, 1);
  };

  const markBusy = (id, busy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleAddMember = async (user) => {
    const key = `add-${user.id}`;
    if (busyIds.has(key)) return;
    try {
      markBusy(key, true);
      setError(null);
      await addMemberToTeam(team.id, user);
      const newMember = {
        userID: user.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim(),
        avatar: user.avatar || '',
        role: user.role || '',
        userEmail: user.email || '',
      };
      setMembers((prev) => [...prev, newMember]);
      setMemberIds((prev) => new Set([...prev, user.id]));
      // Remove from available
      setAllAvailable((prev) => prev.filter((u) => u.id !== user.id));
      setDisplayedUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotalAvailable((prev) => prev - 1);
      addToast(`${user.firstName} ${user.lastName} added to team`, 'success');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add member.');
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
      setMembers((prev) => prev.filter((m) => (m.userID || m.userId) !== userId));
      addToast(`${member.userName || 'Member'} removed from team`, 'error');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to remove member.');
    } finally {
      markBusy(key, false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return 'red';
      case 'Instructor': return 'blue';
      case 'Team Lead': return 'orange';
      case 'Student': return 'green';
      default: return 'gray';
    }
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={busyIds.size === 0 ? onClose : undefined}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Manage Members — {team.name}</DialogTitle></DialogHeader>

        {error && (
          <div className="flex items-center gap-2 text-error text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Current Members */}
        <p className="text-xs font-semibold text-text-primary flex items-center gap-1">
          <Check size={12} className="text-success" /> Current Members ({members.length})
        </p>
        {loading ? (
          <Loader size={14} className="animate-spin text-text-muted mt-2" />
        ) : members.length === 0 ? (
          <p className="text-xs text-text-muted mt-1">No members assigned yet.</p>
        ) : (
          <div className="space-y-1 mt-2 mb-4 max-h-48 overflow-y-auto">
            {members.map((member) => {
              const userId = member.userID || member.userId;
              const userName = member.userName || 'Unknown';
              const isBusy = busyIds.has(`remove-${userId}`);
              return (
                <div key={userId} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: t('bg-secondary'), border: `1px solid ${t('border-primary')}` }}>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || 'https://i.pravatar.cc/150?img=1'} />
                      <AvatarFallback>{userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{userName}</p>
                      <Badge variant={getRoleColor(member.role)} className="text-[10px] mt-0.5">{member.role || 'N/A'}</Badge>
                    </div>
                  </div>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-error hover:bg-error/10 disabled:opacity-50 cursor-pointer" onClick={() => handleRemoveMember(member)} disabled={isBusy}>
                    <Minus size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <hr className="border-border" />

        {/* Available Users Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-text-primary flex items-center gap-1">
            <Plus size={12} style={{ color: t('accent') }} /> Available Users ({totalAvailable})
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-8" />
          </div>
          <Button type="submit" variant="default" size="sm">Search</Button>
          {userSearch && <Button type="button" variant="default" size="sm" onClick={handleClearSearch}>Clear</Button>}
        </form>

        {/* Available Users List */}
        {loading ? (
          <Loader size={14} className="animate-spin text-text-muted mt-2" />
        ) : displayedUsers.length === 0 ? (
          <p className="text-xs text-text-muted mt-1">No available users found.</p>
        ) : (
          <>
            <div className="space-y-1 mt-2 max-h-56 overflow-y-auto">
              {displayedUsers.map((user) => {
                const isBusy = busyIds.has(`add-${user.id}`);
                return (
                  <div key={user.id} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: t('bg-surface'), border: `1px solid ${t('border-primary')}` }}>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || 'https://i.pravatar.cc/150?img=1'} />
                        <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-text-muted">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleColor(user.role)} className="text-[10px]">{user.role}</Badge>
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-success hover:bg-success/10 disabled:opacity-50 cursor-pointer" onClick={() => handleAddMember(user)} disabled={isBusy}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => paginate(allAvailable, Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex h-7 items-center gap-1 rounded-md border border-border px-2 text-text-secondary hover:bg-bg-surface-active disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-xs"
                >
                  <ChevronLeft size={12} />
                  <span>Previous</span>
                </button>
                <span className="text-[11px] text-text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => paginate(allAvailable, Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-7 items-center gap-1 rounded-md border border-border px-2 text-text-secondary hover:bg-bg-surface-active disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-xs"
                >
                  <span>Next</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            )}

            {/* Load More */}
            {currentPage === totalPages && displayedUsers.length < totalAvailable && (
              <div className="flex justify-center mt-2">
                <Button variant="default" size="sm" onClick={loadMoreUsers} disabled={loadingMore}>
                  {loadingMore ? (
                    <><Loader size={12} className="animate-spin mr-1" /> Loading...</>
                  ) : (
                    <>Load More Users</>
                  )}
                </Button>
              </div>
            )}
            {currentPage === totalPages && displayedUsers.length >= totalAvailable && totalAvailable > 0 && (
              <p className="text-[11px] text-text-muted text-center mt-2">Showing all loaded users. Click "Load More" to fetch additional users from the server.</p>
            )}
          </>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="default" onClick={onClose} disabled={busyIds.size > 0}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberAssignModal;
