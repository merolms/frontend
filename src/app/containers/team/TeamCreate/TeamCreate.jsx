import { ChevronRight, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TeamForm from "@/app/containers/team/TeamForm/TeamForm";
import { useToast } from "@/app/context/ToastContext";
import { useCreateTeam } from "@/hooks/queries/useEntities";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { t } from "@/styles/theme";

const TeamCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const createMutation = useCreateTeam();

  const handleSubmit = async (formData) => {
    try {
      const team = await createMutation.mutateAsync(formData);
      addToast(`Team "${team.name}" created successfully`, "success");
      navigate(`/teams/${team.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout title="Create Team" subtitle="Set up a new team and start assigning members">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/teams")} className="text-primary hover:underline">
          Teams
        </button>
        <ChevronRight size={12} />
        <span>Create Team</span>
      </div>

      <Paper className="max-w-2xl p-6">
        <h2 className="text-text-primary mb-1 text-base font-semibold">
          <Users size={16} className="mr-1 inline" style={{ color: t("primary") }} />
          Create New Team
        </h2>
        <p className="text-text-muted mb-4 text-xs">
          Set up a new team and start assigning members.
        </p>
        <TeamForm onSubmit={handleSubmit} onCancel={() => navigate("/teams")} loading={createMutation.isPending} />
      </Paper>
    </DashboardLayout>
  );
};

export default TeamCreate;
