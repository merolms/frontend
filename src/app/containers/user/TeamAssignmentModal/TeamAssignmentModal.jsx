import React, { useState, useEffect } from 'react';
import { Check, Plus, Users, Loader } from 'lucide-react';
import { fetchTeams } from '@/app/services/teamService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/styles/theme';

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Assign Teams — {user.firstName} {user.lastName}</DialogTitle></DialogHeader>
        {error && <p className="text-xs text-error mb-2">{error}</p>}
        {loading ? (
          <Loader size={14} className="animate-spin text-text-muted mt-2" />
        ) : teams.length === 0 ? (
          <p className="text-xs text-text-muted">No teams available.</p>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer" style={{ border: `1px solid ${t('border-primary')}` }}
                onClick={() => setError('Team assignment is not yet supported by the backend.')}>
                <div className="flex items-center gap-2">
                  <Users size={14} className={isAssigned(team.name) ? 'text-success' : 'text-text-muted'} />
                  <p className="text-xs font-medium text-text-primary">{team.name}</p>
                </div>
                {isAssigned(team.name) ? (
                  <Badge variant="green" className="text-[10px]"><Check size={8} /> Assigned</Badge>
                ) : (
                  <Badge variant="gray" className="text-[10px]"><Plus size={8} /> Assign</Badge>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="default" onClick={onClose} disabled={saving}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamAssignmentModal;
