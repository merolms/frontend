// @ts-nocheck
import { ChevronRight, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import TeamForm from "@/containers/team/TeamForm/TeamForm";
import { useToast } from "@/context/ToastContext";
import { useUnsavedChanges } from "@/hooks";
import { useCreateTeam } from "@/hooks/queries/useEntities";
import { t } from "@/styles/theme";

const draft_KEY = "team_create_draft";

const TeamCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const createMutation = useCreateTeam();

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(draft_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return { name: "", description: "", color: "#6366F1" };
  });

  const { clearDirty } = useUnsavedChanges(
    form,
    { name: "", description: "", color: "#6366F1" },
    setForm,
    draft_KEY
  );

  // Save draft to localStorage
  useEffect(() => {
    localStorage.setItem(draft_KEY, JSON.stringify(form));
  }, [form]);

  const handleSubmit = async (formData) => {
    try {
      const team = await createMutation.mutateAsync(formData);
      addToast(`Team "${team.name}" created successfully`, "success");
      clearDirty();
      localStorage.removeItem(draft_KEY);
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
        <TeamForm
          initialData={form}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/teams")}
          loading={createMutation.isPending}
          submitLabel="Create Team"
          setForm={setForm}
          autoSave={true}
          autoSaveKey={draft_KEY}
        />
      </Paper>
    </DashboardLayout>
  );
};

export default TeamCreate;
