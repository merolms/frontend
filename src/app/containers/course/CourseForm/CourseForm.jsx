import { useState } from "react";
import { ImageIcon, Trash2, Pencil, Plus } from "lucide-react";

import UnsplashPicker from "@/app/containers/course/components/UnsplashPicker";
import { uploadCourseImage } from "@/app/services/courseService";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import FormActions from "@/components/forms/FormActions";
import FormField from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/styles/theme";

const inputCls =
  "border-border bg-bg-input text-text-primary text-sm placeholder:text-text-muted w-full rounded-md border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const CourseForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Save Course",
  mode = "create", // "create" or "edit"
  status = null, // For edit mode - show status badge
  categories = [],
  apiError = null,
  errors = {},
  onFieldChange,
  form,
  setForm,
  setCoverUploading,
  setCoverError,
}) => {
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  const handleUnsplashSelect = (url) => {
    setCoverError?.(false);
    setForm?.((prev) => ({ ...prev, coverImage: url }));
    setUnsplashOpen(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setCoverUploading?.(true);
      setCoverError?.(false);
      const response = await uploadCourseImage(file);
      setForm?.((prev) => ({ ...prev, coverImage: response?.url || response?.imageURL || "" }));
    } catch (err) {
      setCoverError?.(true);
      console.error("Upload failed:", err);
    } finally {
      setCoverUploading?.(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {apiError && <FormErrorBanner message={apiError} />}
      {Object.keys(errors).length > 0 && !apiError && (
        <FormErrorBanner message="Please fix the errors below." />
      )}

      <FormField label="Course Title" error={errors.title} required>
        <input
          name="title"
          placeholder="e.g., Advanced React Patterns"
          value={form?.title || ""}
          onChange={(e) => {
            onFieldChange?.("title", e.target.value);
            if (errors.title) setForm?.((prev) => ({ ...prev, title: e.target.value }));
          }}
          className={inputCls}
        />
      </FormField>

      <FormField label="Description" error={errors.description} required>
        <textarea
          name="description"
          placeholder="What will students learn? What are the prerequisites?"
          className={`${inputCls} min-h-[110px] py-1.5`}
          value={form?.description || ""}
          onChange={(e) => {
            onFieldChange?.("description", e.target.value);
            if (errors.description) setForm?.((prev) => ({ ...prev, description: e.target.value }));
          }}
        />
      </FormField>

      <FormField label="Category" error={errors.category} required>
        <select
          name="category"
          value={form?.category || ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : null;
            onFieldChange?.("category", value);
            setForm?.((prev) => ({ ...prev, category: value }));
            if (errors.category) setForm?.((prev) => ({ ...prev, category: null }));
          }}
          className={inputCls}
        >
          <option value="">Select a category</option>
          {categories.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Duration (hours)" error={errors.duration}>
        <input
          name="duration"
          type="number"
          min="0"
          placeholder="e.g. 8"
          value={form?.duration ?? ""}
          onChange={(e) => {
            onFieldChange?.("duration", e.target.value);
            setForm?.((prev) => ({ ...prev, duration: e.target.value }));
          }}
          className={inputCls}
        />
      </FormField>

      {mode === "edit" && status && (
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">Status</span>
          <Badge
            variant={
              status === "published"
                ? "green"
                : status === "archived"
                  ? "orange"
                  : "gray"
            }
          >
            {status === "draft" ? "draft" : status || "draft"}
          </Badge>
          <span className="text-text-muted text-[11px]">
            Use the course detail page to publish, archive, or restore.
          </span>
        </div>
      )}

      <div>
        <label className="text-text-primary text-xs font-semibold">Cover Image</label>
        <div className="mt-1 flex gap-2">
          <input
            name="coverImage"
            placeholder="https://example.com/cover.jpg"
            value={form?.coverImage || ""}
            onChange={(e) => {
              setCoverError?.(false);
              onFieldChange?.("coverImage", e.target.value);
              setForm?.((prev) => ({ ...prev, coverImage: e.target.value }));
            }}
            className={`${inputCls} flex-1`}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => setUnsplashOpen(true)}
            disabled={loading}
          >
            <ImageIcon size={14} /> Unsplash
          </Button>
          <label className="cursor-pointer">
            <Button type="button" size="sm" disabled={loading} asChild>
              <span>Upload</span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
        </div>
        {form?.coverImage && (
          <div className="relative mt-2 inline-block">
            <img
              src={form.coverImage}
              alt="Cover"
              className="h-36 w-36 rounded-md object-cover"
              onError={() => setCoverError?.(true)}
            />
            <Button
              type="button"
              size="xs"
              variant="danger"
              onClick={() => {
                setCoverError?.(false);
                onFieldChange?.("coverImage", "");
                setForm?.((prev) => ({ ...prev, coverImage: "" }));
              }}
              className="absolute top-1 right-1"
            >
              <Trash2 size={10} />
            </Button>
          </div>
        )}
      </div>

      <UnsplashPicker
        open={unsplashOpen}
        onClose={() => setUnsplashOpen(false)}
        onSelect={handleUnsplashSelect}
        initialQuery={form?.title || "education"}
      />

      <FormActions onCancel={onCancel} loading={loading} submitLabel={submitLabel} />
    </form>
  );
};

export default CourseForm;
