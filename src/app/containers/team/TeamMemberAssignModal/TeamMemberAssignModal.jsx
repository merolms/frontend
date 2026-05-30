import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Loader, Minus, Plus } from 'lucide-react';
import { fetchTeamMembers, fetchUsers, addMemberToTeam, removeMemberFromTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { t } from '@/styles/theme';

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

  const getRoleColor = (role) => { switch (role) { case 'Administrator': return 'red'; case 'Instructor': return 'blue'; case 'Team Lead': return 'orange'; case 'Student': return 'green'; default: return 'gray'; } };

  return (
    <Dialog open={open} onOpenChange={busyIds.size === 0 ? onClose : undefined}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Manage Members — {team.name}</DialogTitle></DialogHeader>

        {error && (
          <div className="flex items-center gap-2 text-error text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <p className="text-xs font-semibold text-text-primary flex items-center gap-1">
          <Check size={12} className="text-success" /> Current Members ({members.length})
        </p>
        {loading ? (
          <Loader size={14} className="animate-spin text-text-muted mt-2" />
        ) : members.length === 0 ? (
          <p className="text-xs text-text-muted mt-1">No members assigned yet.</p>
        ) : (
          <div className="space-y-1 mt-2 mb-4">
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

        <p className="text-xs font-semibold text-text-primary flex items-center gap-1">
          <Plus size={12} style={{ color: t('accent') }} /> Available Users ({availableUsers.length})
        </p>
        {availableUsers.length === 0 ? (
          <p className="text-xs text-text-muted mt-1">All users are already assigned or no users found.</p>
        ) : (
          <div className="space-y-1 mt-2">
            {availableUsers.map((user) => {
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
        )}

        <div className="flex justify-end mt-4">
          <Button variant="default" onClick={onClose} disabled={busyIds.size > 0}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberAssignModal;
