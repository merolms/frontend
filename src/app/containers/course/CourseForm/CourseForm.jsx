import { ImageIcon, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import UnsplashPicker from "@/app/containers/course/components/UnsplashPicker";
import { fetchCategories } from "@/app/services/categoryService";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const tagOptions = [
  "javascript",
  "react",
  "python",
  "css",
  "html",
  "nodejs",
  "typescript",
  "machine-learning",
  "data-science",
  "design",
  "ui",
  "ux",
  "devops",
  "cloud",
  "aws",
  "docker",
  "api",
  "database",
  "security",
].map((tag) => ({ value: tag, label: tag }));

const CourseForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Save Course",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    coverImage: "",
    ...initialData,
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  useEffect(() => {
    if (initialData) setFormData({ ...initialData });
    fetchCategories({ status: "active" })
      .then((cats) => {
        setCategoryOptions(cats.map((c) => ({ value: c.name, label: c.name })));
      })
      .catch(() => {});
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Course title is required";
    if (!formData.description.trim()) e.description = "Description is required";
    if (!formData.category) e.category = "Category is required";
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
  };

  return (
    <form onSubmit={handleSubmit} className="course-form space-y-3">
      {Object.keys(errors).length > 0 && (
        <Paper className="p-3">
          <p className="text-error text-sm">Please fix the errors below.</p>
        </Paper>
      )}

      <div>
        <label className="text-text-primary text-sm font-medium">Course Title</label>
        <Input
          placeholder="e.g., Advanced React Patterns"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className={errors.title ? "border-error" : ""}
        />
        {errors.title && <p className="text-error mt-1 text-xs">{errors.title}</p>}
      </div>

      <div>
        <label className="text-text-primary text-sm font-medium">Description</label>
        <Textarea
          placeholder="What will students learn?"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={errors.description ? "border-error" : ""}
          rows={4}
        />
        {errors.description && <p className="text-error mt-1 text-xs">{errors.description}</p>}
      </div>

      <div>
        <label className="text-text-primary text-sm font-medium">Category</label>
        <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-error mt-1 text-xs">{errors.category}</p>}
      </div>

      <div>
        <label className="text-text-primary text-sm font-medium">Tags</label>
        <Select value={formData.tags} onValueChange={(v) => handleChange("tags", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Add tags to help discovery" />
          </SelectTrigger>
          <SelectContent>
            {tagOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-text-primary text-sm font-medium">Cover Image</label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://example.com/cover.jpg"
            value={formData.coverImage}
            onChange={(e) => handleChange("coverImage", e.target.value)}
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setUnsplashOpen(true)}
            disabled={loading}
          >
            <ImageIcon size={14} /> Unsplash
          </Button>
        </div>
        {formData.coverImage && (
          <div className="relative mt-2 inline-block">
            <img src={formData.coverImage} alt="Cover" className="h-36 rounded-md object-cover" />
            <Button
              type="button"
              size="xs"
              variant="danger"
              onClick={() => handleChange("coverImage", "")}
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
        onSelect={(url) => {
          handleChange("coverImage", url);
          setUnsplashOpen(false);
        }}
        initialQuery={formData.title || "education"}
      />

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="default" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          <Save size={14} /> {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
