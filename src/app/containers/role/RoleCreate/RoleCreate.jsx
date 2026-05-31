import { ChevronRight, Shield } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import RoleForm from "@/app/containers/role/RoleForm/RoleForm";
import { useToast } from "@/app/context/ToastContext";
import { createRole } from "@/app/services/authService";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { t } from "@/styles/theme";

const RoleCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await createRole(formData);
      addToast(`Role "${formData.name}" created successfully`, "success");
      navigate("/roles");
    } catch (err) {
      setError(err.message || "Failed to create role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Role" subtitle="Define a new role and assign permissions">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/roles")} className="text-primary hover:underline">
          Roles
        </button>
        <ChevronRight size={12} />
        <span>Create Role</span>
      </div>

      <Paper className="max-w-2xl p-6">
        <h2 className="text-text-primary mb-1 text-base font-semibold">
          <Shield size={16} className="mr-1 inline" style={{ color: t("primary") }} />
          Create New Role
        </h2>
        <p className="text-text-muted mb-4 text-xs">
          Define a new role and assign permissions to it.
        </p>
        {error && <p className="text-error mb-3 text-xs">{error}</p>}
        <RoleForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/roles")}
          loading={loading}
          submitLabel="Create Role"
        />
      </Paper>
    </DashboardLayout>
  );
};

export default RoleCreate;
