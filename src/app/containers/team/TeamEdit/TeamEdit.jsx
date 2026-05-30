import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Loader, ChevronRight, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Paper } from '@/components/ui/card';
import TeamForm from '@/app/containers/team/TeamForm/TeamForm';
import { fetchTeamById, updateTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';
import { t } from '@/styles/theme';

const TeamEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeam = async () => {
      try { setFetching(true); const data = await fetchTeamById(id); setTeam(data); }
      catch (err) { setError('Failed to load team data.'); }
      finally { setFetching(false); }
    };
    loadTeam();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true); setError(null);
      const updated = await updateTeam(id, formData);
      addToast(`Team "${formData.name}" updated successfully`, 'success');
      navigate(`/teams/${updated.id}`);
    } catch (err) { setError('Failed to update team. Please try again.'); }
    finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-text-muted" size={20} />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !team) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 text-error py-4"><AlertCircle size={14} /> {error}</div>
        <Button size="sm" onClick={() => navigate('/teams')}>Back to Teams</Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Team" subtitle="Update the team details below">
      <div className="flex items-center gap-1 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/teams')} className="text-primary hover:underline">Teams</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/teams/${id}`)} className="text-primary hover:underline">{team?.name}</button>
        <ChevronRight size={12} />
        <span>Edit</span>
      </div>

      <Paper className="p-6 max-w-2xl">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          <Pencil size={16} className="inline mr-1" style={{ color: t('accent') }} />
          Edit Team
        </h2>
        <p className="text-xs text-text-muted mb-4">Update the team details below.</p>
        {error && <p className="text-xs text-error mb-3">{error}</p>}
        <TeamForm initialData={team} onSubmit={handleSubmit} onCancel={() => navigate(`/teams/${id}`)} loading={loading} submitLabel="Save Changes" />
      </Paper>
    </DashboardLayout>
  );
};

export default TeamEdit;
