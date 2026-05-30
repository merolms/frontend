import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { fetchRoles } from '@/app/services/authService';

const UserForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save User' }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: 'Student', phone: '', bio: '', ...initialData });
  const [errors, setErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions(roles.map((role) => ({ value: role.name, label: role.name })));
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

  useEffect(() => { if (initialData) setFormData({ ...initialData }); }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email address';
    if (!formData.role) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {Object.keys(errors).length > 0 && (
        <div className="flex items-center gap-2 text-error text-sm">
          <AlertCircle size={14} /> Please fix the errors below.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-text-primary">First Name</label>
          <Input placeholder="John" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className={errors.firstName ? 'border-error' : ''} />
          {errors.firstName && <p className="text-[11px] text-error mt-0.5">{errors.firstName}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-text-primary">Last Name</label>
          <Input placeholder="Doe" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className={errors.lastName ? 'border-error' : ''} />
          {errors.lastName && <p className="text-[11px] text-error mt-0.5">{errors.lastName}</p>}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Email</label>
        <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={errors.email ? 'border-error' : ''} />
        {errors.email && <p className="text-[11px] text-error mt-0.5">{errors.email}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Role</label>
        <Select value={formData.role} onValueChange={(v) => handleChange('role', v)}>
          <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
          <SelectContent>{roleOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
        {errors.role && <p className="text-[11px] text-error mt-0.5">{errors.role}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Phone</label>
        <Input placeholder="+1 555-0100" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Bio</label>
        <Input placeholder="Short bio..." value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type="submit" disabled={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default UserForm;
