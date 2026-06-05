import React, { useState } from "react";

import { getCategoryColorOptions, getCategoryIconOptions } from "@/app/services/categoryService";
import FormActions from "@/components/forms/FormActions";
import FormField from "@/components/forms/FormField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CategoryForm = ({ category = null, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    color: getCategoryColorOptions()[0].value,
    icon: "folder",
  });
  const [errors, setErrors] = useState({});
  const isEditing = !!category;

  React.useEffect(() => {
    if (category)
      setForm({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        color: category.color || getCategoryColorOptions()[0].value,
        icon: category.icon || "folder",
      });
  }, [category]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|$/g, "");
    setForm((prev) => ({ ...prev, name: val, slug }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Category name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await onSubmit(form);
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  const colorOptions = getCategoryColorOptions().map((c) => ({ value: c, label: c }));
  const iconOptions = getCategoryIconOptions.map((ic) => ({ value: ic, label: ic }));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <FormField label="Name" error={errors.name} required>
            <Input
              placeholder="e.g., Web Development"
              value={form.name}
              onChange={handleNameChange}
            />
          </FormField>
          <FormField label="Slug" error={errors.slug} required>
            <Input
              placeholder="e.g., web-development"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              placeholder="What kind of courses belong in this category?"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </FormField>
          <FormField label="Color">
            <Select value={form.color} onValueChange={(v) => handleChange("color", v)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ background: form.color }}
                  />
                  <span>
                    {getCategoryColorOptions().find((c) => c.value === form.color)?.label ||
                      form.color}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {getCategoryColorOptions().map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ background: c.value }}
                      />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Icon">
            <Select value={form.icon} onValueChange={(v) => handleChange("icon", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormActions
          onCancel={onClose}
          loading={loading}
          submitLabel={isEditing ? "Save Changes" : "Create Category"}
          showCancel
        />
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
