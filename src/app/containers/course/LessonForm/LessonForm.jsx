import { Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const LessonForm = ({ open, onClose, onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({ title: "", duration: "", content: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({ title: "", duration: "", content: "" });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Lesson title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(formData);
  };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const isEditing = !!initialData;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      {open && (
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-text-primary text-sm font-medium">Lesson Title</label>
              <Input
                placeholder="Enter a lesson title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={errors.title ? "border-error" : ""}
              />
              {errors.title && <p className="text-error mt-1 text-xs">{errors.title}</p>}
            </div>
            <div>
              <label className="text-text-primary text-sm font-medium">Duration</label>
              <Input
                placeholder="e.g., 30 mins, 1 hour"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
              />
            </div>
            <div>
              <label className="text-text-primary text-sm font-medium">Content</label>
              <Textarea
                placeholder="Lesson content or notes"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="default" onClick={onClose} disabled={loading}>
              <X size={14} /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save size={14} /> {isEditing ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default LessonForm;
