import React, { useState, useEffect } from 'react';
import { t } from '@/styles/theme';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { permissionCatalog } from '@/app/services/authService';
import { cn } from '@/lib/utils';

const ROLE_COLORS = ['#EF4444', '#3B82F6', '#8B5CF6', '#14B8A6', '#22C55E', '#F59E0B', '#EC4899', '#EAB308', '#92400E', '#9CA3AF', '#000000', '#7C3AED', '#65A30D', '#06B6D4'];

const RoleForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Role' }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: ROLE_COLORS[0], permissions: [], ...initialData });
  const [errors, setErrors] = useState({});
  const [expandedDomains, setExpandedDomains] = useState(Object.keys(permissionCatalog));

  useEffect(() => { if (initialData) setFormData({ ...initialData }); }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Role name is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (formData.permissions.length === 0) e.permissions = 'Select at least one permission';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const togglePermission = (permKey) => {
    setFormData((prev) => {
      const perms = prev.permissions.includes(permKey)
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: perms };
    });
    if (errors.permissions) setErrors((prev) => ({ ...prev, permissions: null }));
  };

  const toggleDomain = (domainKey) => {
    const domainPerms = permissionCatalog[domainKey].permissions.map((p) => p.key);
    setFormData((prev) => {
      const allSelected = domainPerms.every((p) => prev.permissions.includes(p));
      const perms = allSelected
        ? prev.permissions.filter((p) => !domainPerms.includes(p))
        : [...new Set([...prev.permissions, ...domainPerms])];
      return { ...prev, permissions: perms };
    });
    if (errors.permissions) setErrors((prev) => ({ ...prev, permissions: null }));
  };

  const getDomainSelectionState = (domainKey) => {
    const domainPerms = permissionCatalog[domainKey].permissions.map((p) => p.key);
    const selectedCount = domainPerms.filter((p) => formData.permissions.includes(p)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === domainPerms.length) return 'all';
    return 'partial';
  };

  const totalSelected = formData.permissions.length;
  const totalAvailable = Object.values(permissionCatalog).reduce((sum, d) => sum + d.permissions.length, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {Object.keys(errors).length > 0 && (
        <div className="flex items-center gap-2 text-error text-sm">
          <AlertCircle size={14} /> Please fix the errors below.
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-text-primary">Role Name</label>
        <Input placeholder="e.g., Content Manager" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className={errors.name ? 'border-error' : ''} />
        {errors.name && <p className="text-[11px] text-error mt-0.5">{errors.name}</p>}
      </div>

      <div>
        <label className="text-xs font-medium text-text-primary">Description</label>
        <Textarea placeholder="What can this role do?" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className={errors.description ? 'border-error' : ''} rows={3} />
        {errors.description && <p className="text-[11px] text-error mt-0.5">{errors.description}</p>}
      </div>

      <div>
        <label className="text-xs font-medium text-text-primary mb-1 block">Color</label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleChange('color', color)}
              className="h-7 w-7 rounded"
              style={{
                background: color,
                border: formData.color === color ? '3px solid var(--text-primary)' : '1px solid var(--border-primary)',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-text-primary">
            Permissions {errors.permissions && <span className="text-error font-normal text-[11px] ml-2">{errors.permissions}</span>}
          </label>
          <span className="text-[11px] text-text-muted">{totalSelected} of {totalAvailable} selected</span>
        </div>

        <Accordion type="multiple" value={expandedDomains} onValueChange={setExpandedDomains}>
          {Object.entries(permissionCatalog).map(([domainKey, domain]) => {
            const state = getDomainSelectionState(domainKey);
            return (
              <AccordionItem key={domainKey} value={domainKey}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full mr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{domain.label}</span>
                      <span className="text-[11px] text-text-muted">
                        ({domain.permissions.filter((p) => formData.permissions.includes(p.key)).length}/{domain.permissions.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleDomain(domainKey); }}
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded cursor-pointer',
                        state === 'all' ? 'bg-success/12 text-success' :
                        state === 'partial' ? 'bg-warning/12 text-warning' :
                        'bg-bg-surface-active text-text-muted'
                      )}
                    >
                      {state === 'all' ? 'All' : state === 'partial' ? 'Partial' : 'None'}
                    </button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 py-1">
                    {domain.permissions.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                        <Checkbox checked={formData.permissions.includes(perm.key)} onCheckedChange={() => togglePermission(perm.key)} />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type="submit" disabled={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default RoleForm;
