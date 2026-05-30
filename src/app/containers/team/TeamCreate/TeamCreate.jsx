import React, { useState } from 'react';
import { t } from '@/styles/theme';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Paper } from '@/components/ui/card';
import TeamForm from '@/app/containers/team/TeamForm/TeamForm';
import { createTeam } from '@/app/services/teamService';
import { useToast } from '@/app/context/ToastContext';

const PRESET_COLORS = [t('accent'), t('secondary'), t('warning'), t('primary'), t('error'), t('success')];

const TeamCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const team = await createTeam(formData);
      addToast(`Team "${team.name}" created successfully`, 'success');
      navigate(`/teams/${team.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Team" subtitle="Set up a new team and start assigning members">
      <div className="flex items-center gap-1 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/teams')} className="text-primary hover:underline">Teams</button>
        <ChevronRight size={12} />
        <span>Create Team</span>
      </div>

      <Paper className="p-6 max-w-2xl">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          <Users size={16} className="inline mr-1" style={{ color: t('primary') }} />
          Create New Team
        </h2>
        <p className="text-xs text-text-muted mb-4">Set up a new team and start assigning members.</p>
        <TeamForm onSubmit={handleSubmit} onCancel={() => navigate('/teams')} loading={loading} />
      </Paper>
    </DashboardLayout>
  );
};

export default TeamCreate;
