import React, { useState } from 'react';
import { Pencil, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategoryColorOptions, getCategoryIconOptions } from '@/app/services/categoryService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CategoryForm = ({ category = null, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: getCategoryColorOptions()[0], icon: 'folder' });
  const [errors, setErrors] = useState({});
  const isEditing = !!category;

  React.useEffect(() => {
    if (category) setForm({
      name: category.name || '', slug: category.slug || '',
      description: category.description || '',
      color: category.color || getCategoryColorOptions()[0],
      icon: category.icon || 'folder',
    });
  }, [category]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|$/g, '');
    setForm((prev) => ({ ...prev, name: val, slug }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try { await onSubmit(form); } catch (err) { setErrors({ submit: err.message }); }
  };

  const colorOptions = getCategoryColorOptions().map((c) => ({ value: c, label: c }));
  const iconOptions = getCategoryIconOptions.map((ic) => ({ value: ic, label: ic }));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-primary">Name</label>
            <Input placeholder="e.g., Web Development" value={form.name} onChange={handleNameChange} />
            {errors.name && <p className="text-[11px] text-error mt-0.5">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Slug</label>
            <Input placeholder="e.g., web-development" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} />
            {errors.slug && <p className="text-[11px] text-error mt-0.5">{errors.slug}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Description</label>
            <Textarea placeholder="What kind of courses belong in this category?" value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Color</label>
            <Select value={form.color} onValueChange={(v) => handleChange('color', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{colorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-primary">Icon</label>
            <Select value={form.icon} onValueChange={(v) => handleChange('icon', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{iconOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="default" onClick={onClose} disabled={loading}><X size={14} /> Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {isEditing ? <Save size={14} /> : <Plus size={14} />} {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
