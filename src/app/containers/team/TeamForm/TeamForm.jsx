import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

export const TEAM_COLORS = [
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#EF4444', label: 'Red' },
  { value: '#3B82F6', label: 'Blue' },
];

const TeamForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Team' }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: TEAM_COLORS[0].value });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setFormData({
      name: initialData.name || '', description: initialData.description || '',
      color: initialData.color || TEAM_COLORS[0].value,
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

  const selectedColor = TEAM_COLORS.find(c => c.value === formData.color);

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
        <Select value={formData.color} onValueChange={(v) => handleChange('color', v)}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: formData.color }} />
              <span>{selectedColor?.label || formData.color}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {TEAM_COLORS.map(c => (
              <SelectItem key={c.value} value={c.value}>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: c.value }} />
                  {c.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="h-5 w-5 rounded" style={{ background: formData.color, border: '1px solid var(--border-primary)' }} />
          <span className="text-[11px] text-text-muted font-mono">{formData.color}</span>
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
