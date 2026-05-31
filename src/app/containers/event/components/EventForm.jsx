import React, { useState, useEffect } from "react";
import { X, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getEventTypes, getEventColors } from "@/app/services/eventService";

const EventForm = ({ event = null, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "workshop",
    color: "#6366F1",
    startDate: "",
    endDate: "",
    location: "",
    instructor: "",
    maxAttendees: 50,
    tags: "",
  });
  const [errors, setErrors] = useState({});
  const isEdit = !!event;

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      setForm({
        title: event.title || "",
        description: event.description || "",
        type: event.type || "workshop",
        color: event.color || "#6366F1",
        startDate: startDate.toISOString().slice(0, 16),
        endDate: endDate.toISOString().slice(0, 16),
        location: event.location || "",
        instructor: event.instructor || "",
        maxAttendees: event.maxAttendees || 50,
        tags: (event.tags || []).join(", "),
      });
    }
  }, [event]);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
      e.endDate = "End date must be after start date";
    }
    if (!form.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const data = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      maxAttendees: parseInt(form.maxAttendees, 10),
    };
    try {
      await onSubmit(data);
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  const eventTypes = getEventTypes().filter((t) => t.value !== "all");
  const colorOptions = getEventColors();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {errors.submit && <p className="text-error text-xs">{errors.submit}</p>}

          <div>
            <label className="text-text-primary text-xs font-medium">Title *</label>
            <Input
              placeholder="e.g., React Workshop"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={errors.title ? "border-error" : ""}
            />
            {errors.title && <p className="text-error mt-0.5 text-[11px]">{errors.title}</p>}
          </div>

          <div>
            <label className="text-text-primary text-xs font-medium">Description</label>
            <textarea
              placeholder="Describe the event..."
              className="border-border bg-bg-surface text-text-primary mt-1 min-h-[60px] w-full resize-y rounded-md border px-3 py-2 text-sm outline-none"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-primary text-xs font-medium">Type</label>
              <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-text-primary text-xs font-medium">Color</label>
              <Select value={form.color} onValueChange={(v) => handleChange("color", v)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ background: form.color }}
                    />
                    <span>{colorOptions.find((c) => c.value === form.color)?.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((c) => (
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-primary text-xs font-medium">Start *</label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={errors.startDate ? "border-error" : ""}
              />
              {errors.startDate && (
                <p className="text-error mt-0.5 text-[11px]">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="text-text-primary text-xs font-medium">End *</label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={errors.endDate ? "border-error" : ""}
              />
              {errors.endDate && <p className="text-error mt-0.5 text-[11px]">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="text-text-primary text-xs font-medium">Location *</label>
            <Input
              placeholder="e.g., Virtual — Zoom"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className={errors.location ? "border-error" : ""}
            />
            {errors.location && <p className="text-error mt-0.5 text-[11px]">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-primary text-xs font-medium">Instructor</label>
              <Input
                placeholder="e.g., Jane Smith"
                value={form.instructor}
                onChange={(e) => handleChange("instructor", e.target.value)}
              />
            </div>
            <div>
              <label className="text-text-primary text-xs font-medium">Max Attendees</label>
              <Input
                type="number"
                min={1}
                value={form.maxAttendees}
                onChange={(e) => handleChange("maxAttendees", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-text-primary text-xs font-medium">Tags</label>
            <Input
              placeholder="Comma-separated: react, javascript, workshop"
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
            />
          </div>
        </div>

        <div className="border-border mt-4 flex justify-end gap-2 border-t pt-3">
          <Button variant="default" onClick={onClose} disabled={loading}>
            <X size={14} /> Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {isEdit ? <Save size={14} /> : <Plus size={14} />}{" "}
            {isEdit ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
