import React, { useState, useEffect } from 'react';
import { t } from '@/styles/theme';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Paper } from '@/components/ui/card';
import { createUser } from '@/app/services/userService';
import { fetchRoles } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const UserCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Student', phone: '', bio: '' });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions(roles.map((r) => ({ value: r.name, label: r.name })));
      } catch (err) {
        setRoleOptions([
          { value: 'Student', label: 'Student' },
          { value: 'Instructor', label: 'Instructor' },
          { value: 'Team Lead', label: 'Team Lead' },
          { value: 'Administrator', label: 'Administrator' },
        ]);
      }
    };
    loadRoles();
  }, []);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.'); return;
    }
    try {
      setLoading(true); setError(null);
      const user = await createUser(formData);
      addToast(`${formData.firstName} ${formData.lastName} created successfully`, 'success');
      navigate(`/users/${user.id}`);
    } catch (err) { setError(err.message || 'Failed to create user.'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Create User" subtitle="Fill in the details below to create a new user account">
      <div className="flex items-center gap-1 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/users')} className="text-primary hover:underline">Users</button>
        <ChevronRight size={12} />
        <span>Create User</span>
      </div>

      <Paper className="p-6 max-w-2xl">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          <UserPlus size={16} className="inline mr-1" style={{ color: t('primary') }} />
          Create New User
        </h2>
        <p className="text-xs text-text-muted mb-4">Fill in the details below to create a new user account.</p>

        {error && <p className="text-xs text-error mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-primary">First Name *</label>
              <Input placeholder="John" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-text-primary">Last Name *</label>
              <Input placeholder="Doe" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Email *</label>
            <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Password *</label>
            <Input type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Role</label>
            <Select value={formData.role} onValueChange={(v) => handleChange('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{roleOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Phone</label>
            <Input placeholder="+1 555-0100" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="default" onClick={() => navigate('/users')} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </Paper>
    </DashboardLayout>
  );
};

export default UserCreate;
