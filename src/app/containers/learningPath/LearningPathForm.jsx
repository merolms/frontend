import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Sparkles,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchCourses } from "@/app/services/courseService";
import {
  createLearningPath,
  fetchLearningPathById,
  updateLearningPath,
} from "@/app/services/learningPathService";
import { getLearningPathCategories } from "@/app/services/learningPathService";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const colorOptions = [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#10B981", label: "Emerald" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EF4444", label: "Red" },
  { value: "#3B82F6", label: "Blue" },
];

const difficultyOptions = ["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"];

const LearningPathForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Beginner",
    estimatedDuration: "",
    color: "#6366F1",
    courses: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCourses();
    loadCategories();
    if (isEdit) loadPath();
  }, [id]);

  const loadCourses = async () => {
    try {
      const data = await fetchCourses({ limit: 100 });
      setAvailableCourses(data.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getLearningPathCategories();
      setCategories(cats.filter((c) => c !== "All Categories"));
    } catch (err) {
      console.error(err);
    }
  };

  const loadPath = async () => {
    try {
      setLoading(true);
      const data = await fetchLearningPathById(id);
      if (data) {
        const rawCourses = data.courses || [];
        // Normalize: ensure every course has `id` (API returns courseId on join records)
        const normalized = rawCourses.map((c) => ({
          ...c,
          id: c.id || c.courseId,
        }));
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty || "Beginner",
          estimatedDuration: data.estimatedDuration || "",
          color: data.color || "#6366F1",
          courses: normalized,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const addCourse = (course) => {
    if (form.courses.find((c) => c.id === course.id)) return;
    setForm((p) => ({
      ...p,
      courses: [...p.courses, { ...course, order: p.courses.length + 1 }],
    }));
    setShowCoursePicker(false);
    setCourseSearch("");
  };

  const removeCourse = (courseId) => {
    setForm((p) => ({
      ...p,
      courses: p.courses.filter((c) => c.id !== courseId).map((c, i) => ({ ...c, order: i + 1 })),
    }));
  };

  const moveCourse = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.courses.length) return;
    const updated = [...form.courses];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setForm((p) => ({ ...p, courses: updated.map((c, i) => ({ ...c, order: i + 1 })) }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Category is required";
    if (form.courses.length === 0) e.courses = "Add at least one course";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      if (isEdit) {
        await updateLearningPath(id, form);
      } else {
        await createLearningPath(form);
      }
      navigate("/learning-paths");
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = courseSearch.trim()
    ? availableCourses.filter((c) => {
        const q = courseSearch.toLowerCase();
        return c.title.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
      })
    : availableCourses;

  const selectedIds = new Set(form.courses.map((c) => c.id));

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait">
        <div className="animate-pulse space-y-4">
          <div className="bg-bg-surface-active h-8 w-1/3 rounded" />
          <div className="bg-bg-surface-active h-64 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isEdit ? "Edit Learning Path" : "Create Learning Path"}
      subtitle={
        isEdit
          ? "Update your learning path details"
          : "Arrange existing courses into a step-by-step learning journey"
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* API error banner */}
        {apiError && (
          <div className="border-error/30 bg-error/10 mb-4 flex items-center justify-between rounded-lg border p-3">
            <p className="text-error flex items-center gap-2 text-sm">
              <AlertCircle size={14} /> {apiError}
            </p>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-error/60 hover:text-error"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {/* Basic Info */}
        <Paper className="mb-4 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} style={{ color: form.color }} />
            <h3 className="text-text-primary text-sm font-semibold">Basic Information</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-text-primary text-xs font-semibold">Title *</label>
              <Input
                name="title"
                placeholder="e.g., Full-Stack Web Development"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={errors.title ? "border-error" : ""}
              />
              {errors.title && <p className="text-error mt-0.5 text-[11px]">{errors.title}</p>}
            </div>

            <div>
              <label className="text-text-primary text-xs font-semibold">Description *</label>
              <textarea
                name="description"
                placeholder="Describe what learners will achieve in this path..."
                className={`border-border bg-bg-surface text-text-primary mt-1 min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm outline-none ${errors.description ? "border-error" : ""}`}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
              {errors.description && (
                <p className="text-error mt-0.5 text-[11px]">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-text-primary text-xs font-semibold">Category *</label>
                <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-error mt-0.5 text-[11px]">{errors.category}</p>
                )}
              </div>
              <div>
                <label className="text-text-primary text-xs font-semibold">Difficulty</label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => handleChange("difficulty", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-text-primary text-xs font-semibold">Est. Duration</label>
                <Input
                  placeholder="e.g., 6 months"
                  value={form.estimatedDuration}
                  onChange={(e) => handleChange("estimatedDuration", e.target.value)}
                />
              </div>
              <div>
                <label className="text-text-primary text-xs font-semibold">Theme Color</label>
                <div className="mt-1 flex items-center gap-2">
                  <Select value={form.color} onValueChange={(v) => handleChange("color", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ background: c.value }}
                            />
                            {c.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div
                    className="border-border h-8 w-8 flex-shrink-0 rounded-lg border"
                    style={{ background: form.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Paper>

        {/* Course Sequence */}
        <Paper className="mb-4 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: form.color }} />
              <h3 className="text-text-primary text-sm font-semibold">
                Course Steps ({form.courses.length})
              </h3>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setShowCoursePicker(!showCoursePicker)}
            >
              <Plus size={14} /> Add Course
            </Button>
          </div>
          {errors.courses && <p className="text-error mb-2 text-[11px]">{errors.courses}</p>}

          {/* Course picker dropdown */}
          {showCoursePicker && (
            <div className="border-border bg-bg-surface-hover mb-4 rounded-lg border p-3">
              <div className="relative mb-2">
                <Input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-3"
                />
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {filteredCourses
                  .filter((c) => !selectedIds.has(c.id))
                  .slice(0, 10)
                  .map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => addCourse(course)}
                      className="hover:bg-bg-surface-active flex w-full items-center gap-3 rounded-md p-2 text-left"
                    >
                      <div className="bg-bg-surface border-border flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border">
                        <BookOpen size={14} className="text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-text-primary line-clamp-1 text-xs font-semibold">
                          {course.title}
                        </p>
                        <p className="text-text-muted text-[10px]">
                          {course.totalLessons} lessons · {course.duration}
                        </p>
                      </div>
                      <Plus size={14} className="text-text-muted flex-shrink-0" />
                    </button>
                  ))}
                {filteredCourses.filter((c) => !selectedIds.has(c.id)).length === 0 && (
                  <p className="text-text-muted py-4 text-center text-xs">No courses available</p>
                )}
              </div>
            </div>
          )}

          {/* Selected courses list */}
          {form.courses.length === 0 ? (
            <div className="text-text-muted py-8 text-center text-sm">
              No courses added yet. Click "Add Course" to start building your learning path.
            </div>
          ) : (
            <div className="space-y-2">
              {form.courses.map((course, idx) => (
                <div
                  key={course.id}
                  className="border-border bg-bg-surface-hover flex items-center gap-3 rounded-lg border p-3"
                  style={{ borderLeft: `3px solid ${form.color}` }}
                >
                  {/* Step number */}
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: form.color }}
                  >
                    {idx + 1}
                  </div>

                  {/* Course info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary line-clamp-1 text-xs font-semibold">
                      {course.title}
                    </p>
                    <div className="text-text-muted mt-0.5 flex items-center gap-2 text-[10px]">
                      <span className="flex items-center gap-0.5">
                        <BookOpen size={9} /> {course.lessons || course.totalLessons || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={9} /> {course.duration || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveCourse(idx, "up")}
                      disabled={idx === 0}
                      className="hover:bg-bg-surface flex h-7 w-7 cursor-pointer items-center justify-center rounded disabled:opacity-30"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCourse(idx, "down")}
                      disabled={idx === form.courses.length - 1}
                      className="hover:bg-bg-surface flex h-7 w-7 cursor-pointer items-center justify-center rounded disabled:opacity-30"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCourse(course.id)}
                      className="text-error hover:bg-error/10 flex h-7 w-7 cursor-pointer items-center justify-center rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Path preview */}
          {form.courses.length > 0 && (
            <div className="bg-bg-surface-active/50 mt-4 rounded-lg p-3">
              <p className="text-text-secondary mb-2 text-[11px] font-semibold">Path Preview</p>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {form.courses.map((course, idx) => (
                  <React.Fragment key={course.id}>
                    <div className="bg-bg-surface border-border flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2 py-1">
                      <div
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                        style={{ background: form.color }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-text-primary text-[10px] font-medium whitespace-nowrap">
                        {course.title}
                      </span>
                    </div>
                    {idx < form.courses.length - 1 && (
                      <div className="h-0.5 w-4 flex-shrink-0" style={{ background: form.color }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </Paper>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="default" onClick={() => navigate("/learning-paths")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Learning Path" : "Create Learning Path"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default LearningPathForm;
