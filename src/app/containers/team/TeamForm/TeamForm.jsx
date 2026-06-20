import { useEffect, useState } from "react";

import { Check, RotateCw } from "lucide-react";

import FormActions from "@/components/forms/FormActions";
import FormField from "@/components/forms/FormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const TEAM_COLORS = [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#10B981", label: "Emerald" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EF4444", label: "Red" },
  { value: "#3B82F6", label: "Blue" },
];

const TeamForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Save Team",
  setForm: externalSetForm = null,
  autoSave = false,
  autoSaveKey = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: TEAM_COLORS[0].value,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedTime, setSavedTime] = useState(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData)
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        color: initialData.color || TEAM_COLORS[0].value,
        status: initialData.status !== undefined ? initialData.status : 1,
      });
  }, [initialData]);

  // Auto-save notification
  useEffect(() => {
    if (!autoSave) return;
    const timeout = setTimeout(() => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setSavedTime(new Date());
      }, 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData, autoSave]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Team name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (externalSetForm) externalSetForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedColor = TEAM_COLORS.find((c) => c.value === formData.color);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {autoSave && (saving || savedTime) && (
        <div className="text-success flex items-center gap-1.5 text-[11px]">
          {saving ? (
            <>
              <RotateCw size={10} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check size={10} /> Draft auto-saved
            </>
          )}
        </div>
      )}
      {Object.keys(errors).length > 0 && (
        <div className="text-error flex items-center gap-2 text-xs">
          <span className="text-error">⚠</span> Please fix the errors below.
        </div>
      )}
      <FormField label="Team Name" error={errors.name} required>
        <Input
          placeholder="Engineering Team"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          maxLength={100}
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span>
            {formData.name && formData.name.trim().length > 0 ? (
              <span className="text-success flex items-center gap-1">
                <Check size={12} /> Team name is valid
              </span>
            ) : (
              <span className="text-text-muted">Team name is required</span>
            )}
          </span>
          <span>{(formData.name || "").length} / 100</span>
        </div>
      </FormField>
      <FormField label="Description">
        <Textarea
          placeholder="What is this team about?"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          maxLength={500}
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-text-muted">Optional</span>
          <span>{(formData.description || "").length} / 500</span>
        </div>
      </FormField>

      <FormField label="Color">
        <Select value={formData.color} onValueChange={(v) => handleChange("color", v)}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ background: formData.color }}
              />
              <span>{selectedColor?.label || formData.color}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {TEAM_COLORS.map((c) => (
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
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span>
            {formData.color ? (
              <span className="text-success flex items-center gap-1">
                <Check size={12} /> Color selected
              </span>
            ) : (
              <span className="text-text-muted">Color is required</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <div
              className="h-5 w-5 rounded"
              style={{ background: formData.color, border: "1px solid var(--border-primary)" }}
            />
            <span className="text-text-muted font-mono text-[11px]">{formData.color}</span>
          </div>
        </div>
      </FormField>

      <FormActions onCancel={onCancel} loading={loading} submitLabel={submitLabel} />
    </form>
  );
};

export default TeamForm;
