import { AlertCircle, ChevronRight, Loader, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RoleForm from "@/app/containers/role/RoleForm/RoleForm";
import { useToast } from "@/app/context/ToastContext";
import { fetchRoleById, updateRole } from "@/app/services/authService";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { t } from "@/styles/theme";

const RoleEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setFetching(true);
        const data = await fetchRoleById(id);
        if (!data) setError("Role not found.");
        else setRole(data);
      } catch {
        setError("Failed to load role data.");
      } finally {
        setFetching(false);
      }
    };
    loadRole();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await updateRole(id, formData);
      addToast(`Role "${formData.name}" updated successfully`, "success");
      navigate("/roles");
    } catch (err) {
      setError(err.message || "Failed to update role.");
    } finally {
      setLoading(false);
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

  if (error && !role) {
    return (
      <DashboardLayout>
        <div className="text-error flex items-center gap-2 py-4">
          <AlertCircle size={14} /> {error}
        </div>
        <Button size="sm" onClick={() => navigate("/roles")}>
          Back to Roles
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Role" subtitle="Update the role details and permissions">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/roles")} className="text-primary hover:underline">
          Roles
        </button>
        <ChevronRight size={12} />
        <span>Edit: {role?.name}</span>
      </div>

      <Paper className="max-w-2xl p-6">
        <h2 className="text-text-primary mb-1 text-base font-semibold">
          <Pencil size={16} className="mr-1 inline" style={{ color: t("accent") }} />
          Edit Role
        </h2>
        <p className="text-text-muted mb-4 text-xs">Update the role details and permissions.</p>
        {error && <p className="text-error mb-3 text-xs">{error}</p>}
        <RoleForm
          initialData={role}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/roles")}
          loading={loading}
          submitLabel="Save Changes"
        />
      </Paper>
    </DashboardLayout>
  );
};

export default RoleEdit;
