import { AlertCircle, ChevronRight, Loader, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TeamForm from "@/app/containers/team/TeamForm/TeamForm";
import { useToast } from "@/app/context/ToastContext";
import { useTeam, useUpdateTeam } from "@/hooks/queries/useEntities";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { t } from "@/styles/theme";

const TeamEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const { data: team, isLoading: fetching } = useTeam(id);
  const updateMutation = useUpdateTeam();
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      const updated = await updateMutation.mutateAsync({ id, data: formData });
      addToast(`Team "${formData.name}" updated successfully`, "success");
      navigate(`/teams/${updated.id}`);
    } catch (err) {
      setError("Failed to update team. Please try again.");
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="text-text-muted animate-spin" size={20} />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !team) {
    return (
      <DashboardLayout>
        <div className="text-error flex items-center gap-2 py-4">
          <AlertCircle size={14} /> {error}
        </div>
        <Button size="sm" onClick={() => navigate("/teams")}>
          Back to Teams
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Team" subtitle="Update the team details below">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/teams")} className="text-primary hover:underline">
          Teams
        </button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/teams/${id}`)} className="text-primary hover:underline">
          {team?.name}
        </button>
        <ChevronRight size={12} />
        <span>Edit</span>
      </div>

      <Paper className="max-w-2xl p-6">
        <h2 className="text-text-primary mb-1 text-base font-semibold">
          <Pencil size={16} className="mr-1 inline" style={{ color: t("accent") }} />
          Edit Team
        </h2>
        <p className="text-text-muted mb-4 text-xs">Update the team details below.</p>
        {error && <p className="text-error mb-3 text-xs">{error}</p>}
        <TeamForm
          initialData={team}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/teams/${id}`)}
          loading={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </Paper>
    </DashboardLayout>
  );
};

export default TeamEdit;
