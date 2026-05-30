import React, { useState, useEffect } from 'react';
import { t } from '@/styles/theme';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const TEAM_COLORS = [...new Set([t('accent'), t('secondary'), t('warning'), t('primary'), t('error'), t('success')])];

const TeamForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Team' }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: TEAM_COLORS[0] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setFormData({
      name: initialData.name || '', description: initialData.description || '',
      color: initialData.color || TEAM_COLORS[0],
      status: initialData.status !== undefined ? initialData.status : 1,
    });
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Team name is required';
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
        <div className="flex items-center gap-2 text-error text-xs">
          <AlertCircle size={12} /> Please fix the errors below.
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-text-primary">Team Name</label>
        <Input placeholder="Engineering Team" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
        {errors.name && <p className="text-[11px] text-error mt-0.5">{errors.name}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Description</label>
        <Textarea placeholder="What is this team about?" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
      </div>

      <div>
        <label className="text-xs font-medium text-text-primary">Color</label>
        <select
          className="input-field"
          value={formData.color}
          onChange={(e) => handleChange('color', e.target.value)}
        >
          {TEAM_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-6 w-6 rounded" style={{ background: formData.color, border: `1px solid var(--border-primary)` }} />
          <span className="text-xs text-text-muted font-mono">{formData.color}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type="submit" disabled={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default TeamForm;
