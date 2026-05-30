import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Paper } from '@/components/ui/card';
import RoleForm from '@/app/containers/role/RoleForm/RoleForm';
import { createRole } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';
import { t } from '@/styles/theme';

const RoleCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true); setError(null);
      await createRole(formData);
      addToast(`Role "${formData.name}" created successfully`, 'success');
      navigate('/roles');
    } catch (err) { setError(err.message || 'Failed to create role.'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Create Role" subtitle="Define a new role and assign permissions">
      <div className="flex items-center gap-1 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/roles')} className="text-primary hover:underline">Roles</button>
        <ChevronRight size={12} />
        <span>Create Role</span>
      </div>

      <Paper className="p-6 max-w-2xl">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          <Shield size={16} className="inline mr-1" style={{ color: t('primary') }} />
          Create New Role
        </h2>
        <p className="text-xs text-text-muted mb-4">Define a new role and assign permissions to it.</p>
        {error && <p className="text-xs text-error mb-3">{error}</p>}
        <RoleForm onSubmit={handleSubmit} onCancel={() => navigate('/roles')} loading={loading} submitLabel="Create Role" />
      </Paper>
    </DashboardLayout>
  );
};

export default RoleCreate;
