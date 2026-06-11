import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { useToast } from "@/app/context/ToastContext";
import { fetchCourses } from "@/app/services/courseService";
import {
  createLearningPath,
  fetchLearningPathById,
  fetchLearningPaths,
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

const learningPathTemplates = [
  {
    id: "fullstack-web",
    name: "Full-Stack Web Developer",
    description: "Complete web development journey from frontend to backend",
    category: "Web Development",
    difficulty: "Beginner to Advanced",
    estimatedDuration: "6 months",
    color: "#6366F1",
    courses: [], // Would be populated with actual course IDs
  },
  {
    id: "data-science",
    name: "Data Scientist",
    description: "Learn data analysis, machine learning, and AI fundamentals",
    category: "Data Science",
    difficulty: "Intermediate",
    estimatedDuration: "4 months",
    color: "#10B981",
    courses: [],
  },
  {
    id: "mobile-dev",
    name: "Mobile App Developer",
    description: "Build native and cross-platform mobile applications",
    category: "Mobile Development",
    difficulty: "Intermediate",
    estimatedDuration: "5 months",
    color: "#F59E0B",
    courses: [],
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    description: "Master cloud infrastructure, CI/CD, and deployment",
    category: "DevOps",
    difficulty: "Advanced",
    estimatedDuration: "3 months",
    color: "#EF4444",
    courses: [],
  },
];

const LearningPathForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToast } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Beginner",
    estimatedDuration: "",
    color: "#6366F1",
    courses: [],
    versionNotes: "",
    isPublic: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [coursePickerPage, setCoursePickerPage] = useState(1);
  const [coursePickerCategory, setCoursePickerCategory] = useState("all");
  const [coursePickerDifficulty, setCoursePickerDifficulty] = useState("all");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    loadCourses();
    loadCategories();
    if (isEdit) loadPath();
    // Handle imported data
    if (!isEdit && location.state?.importedData) {
      const imported = location.state.importedData;
      setForm({
        title: imported.title || "",
        description: imported.description || "",
        category: imported.category || "",
        difficulty: imported.difficulty || "Beginner",
        estimatedDuration: imported.estimatedDuration || "",
        color: imported.color || "#6366F1",
        courses: (imported.courses || []).map((c, i) => ({ ...c, order: i + 1 })),
        versionNotes: imported.versionNotes || "",
        isPublic: imported.isPublic || false,
      });
      addToast("Learning path imported successfully", "success");
      // Clear the state to prevent re-importing on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [id, location.state]);

  // Debounced course search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Course search is handled by the filteredCourses computed value
      // No API call needed for local filtering
    }, 300);
    return () => clearTimeout(timer);
  }, [courseSearch]);

  const loadCourses = async () => {
    try {
      const data = await fetchCourses({ limit: 100 });
      setAvailableCourses(data.courses || []);
    } catch (err) {
      addToast("Failed to load courses", "error");
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getLearningPathCategories();
      setCategories(cats.filter((c) => c !== "All Categories"));
    } catch (err) {
      addToast("Failed to load categories", "error");
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
          versionNotes: data.versionNotes || "",
          isPublic: data.isPublic || false,
        });
      }
    } catch (err) {
      addToast("Failed to load learning path", "error");
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

  const applyTemplate = (template) => {
    setForm((p) => ({
      ...p,
      title: template.name,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      estimatedDuration: template.estimatedDuration,
      color: template.color,
      courses: template.courses.map((c, i) => ({ ...c, order: i + 1 })),
      versionNotes: "",
      isPublic: false,
    }));
    setSelectedTemplate(template.id);
    setShowTemplatePicker(false);
    addToast(`Template "${template.name}" applied`, "success");
  };

  const checkDuplicateTitle = async () => {
    if (isEdit) return false; // Skip check for edits
    try {
      const data = await fetchLearningPaths({ search: form.title, limit: 1 });
      const existing = data.paths?.find((p) => p.title.toLowerCase() === form.title.toLowerCase());
      return !!existing;
    } catch (err) {
      return false;
    }
  };

  const removeCourse = (courseId) => {
    setForm((p) => ({
      ...p,
      courses: p.courses.filter((c) => c.id !== courseId).map((c, i) => ({ ...c, order: i + 1 })),
    }));
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      newSet.delete(courseId);
      return newSet;
    });
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const selectAllCourses = () => {
    if (selectedCourses.size === form.courses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(form.courses.map((c) => c.id)));
    }
  };

  const bulkRemoveCourses = () => {
    if (selectedCourses.size === 0) return;
    setForm((p) => ({
      ...p,
      courses: p.courses.filter((c) => !selectedCourses.has(c.id)).map((c, i) => ({ ...c, order: i + 1 })),
    }));
    setSelectedCourses(new Set());
    addToast(`${selectedCourses.size} course(s) removed`, "success");
  };

  const bulkMoveCourses = (direction) => {
    if (selectedCourses.size === 0) return;
    const indices = Array.from(selectedCourses)
      .map((id) => form.courses.findIndex((c) => c.id === id))
      .sort((a, b) => (direction === "up" ? a - b : b - a));

    const updated = [...form.courses];
    indices.forEach((idx) => {
      const newIndex = direction === "up" ? idx - 1 : idx + 1;
      if (newIndex >= 0 && newIndex < updated.length) {
        [updated[idx], updated[newIndex]] = [updated[newIndex], updated[idx]];
      }
    });

    setForm((p) => ({ ...p, courses: updated.map((c, i) => ({ ...c, order: i + 1 })) }));
    setSelectedCourses(new Set());
    addToast(`Course(s) moved ${direction}`, "success");
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
    if (form.title.length > 100) e.title = "Title must be 100 characters or less";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.description.length > 500) e.description = "Description must be 500 characters or less";
    if (!form.category) e.category = "Category is required";
    if (form.estimatedDuration && !/^\d+\s*(week|month|year|days|months|years|weeks)s?$/i.test(form.estimatedDuration)) {
      e.estimatedDuration = "Invalid format (e.g., '6 weeks', '3 months')";
    }
    if (form.courses.length === 0) e.courses = "Add at least one course";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Check for duplicate title on create
    if (!isEdit) {
      const isDuplicate = await checkDuplicateTitle();
      if (isDuplicate) {
        addToast("A learning path with this title already exists", "error");
        setErrors((p) => ({ ...p, title: "Title already exists" }));
        return;
      }
    }
    
    setSaving(true);
    setApiError(null);
    try {
      if (isEdit) {
        await updateLearningPath(id, form);
        addToast("Learning path updated successfully", "success");
      } else {
        await createLearningPath(form);
        addToast("Learning path created successfully", "success");
      }
      navigate("/learning-paths");
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred.");
      addToast(err.message || "Failed to save learning path", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedIds = new Set(form.courses.map((c) => c.id));

  const filteredCourses = availableCourses
    .filter((c) => {
      const matchesSearch = !courseSearch.trim() || 
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
        (c.description || "").toLowerCase().includes(courseSearch.toLowerCase());
      const matchesCategory = coursePickerCategory === "all" || c.category === coursePickerCategory;
      const matchesDifficulty = coursePickerDifficulty === "all" || c.difficulty === coursePickerDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .filter((c) => !selectedIds.has(c.id));

  const paginatedCourses = filteredCourses.slice(0, coursePickerPage * 20);
  const hasMoreCourses = paginatedCourses.length < filteredCourses.length;

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
        {!isEdit && (
          <Paper className="mb-4 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h3 className="text-text-primary text-sm font-semibold">Start with a Template</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
              >
                {showTemplatePicker ? "Hide Templates" : "Show Templates"}
              </Button>
            </div>
            
            {showTemplatePicker && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {learningPathTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="border-border bg-bg-surface-hover hover:bg-bg-surface-active border rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded"
                        style={{ background: template.color }}
                      />
                      <span className="text-text-primary text-xs font-semibold">{template.name}</span>
                    </div>
                    <p className="text-text-muted mb-2 line-clamp-2 text-[11px]">{template.description}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-text-secondary">{template.category}</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-muted">{template.difficulty}</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-muted">{template.estimatedDuration}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Paper>
        )}
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
              <div className="mt-1 flex items-center justify-between">
                {errors.title && <p className="text-error text-[11px]">{errors.title}</p>}
                <p className="text-text-muted text-[10px]">{form.title.length}/100 characters</p>
              </div>
            </div>

            <div>
              <label className="text-text-primary text-xs font-semibold">Description *</label>
              <textarea
                name="description"
                placeholder="Describe what learners will achieve in this path..."
                className={`border-border bg-bg-surface text-text-primary mt-1 min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm outline-none ${errors.description ? "border-error" : ""}`}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                maxLength={500}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.description && (
                  <p className="text-error text-[11px]">{errors.description}</p>
                )}
                <p className="text-text-muted text-[10px]">{form.description.length}/500 characters</p>
              </div>
            </div>

            {isEdit && (
              <div>
                <label className="text-text-primary text-xs font-semibold">Version Notes</label>
                <textarea
                  placeholder="Describe what changed in this version..."
                  className="border-border bg-bg-surface text-text-primary mt-1 min-h-[60px] w-full resize-y rounded-md border px-3 py-2 text-sm outline-none"
                  value={form.versionNotes}
                  onChange={(e) => handleChange("versionNotes", e.target.value)}
                  maxLength={200}
                />
                <p className="text-text-muted mt-0.5 text-[10px]">{form.versionNotes.length}/200 characters</p>
              </div>
            )}

            <div>
              <label className="text-text-primary text-xs font-semibold">Visibility</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={!form.isPublic}
                    onChange={(e) => handleChange("isPublic", false)}
                    className="h-4 w-4"
                  />
                  <span className="text-text-secondary text-sm">Private</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={form.isPublic}
                    onChange={(e) => handleChange("isPublic", true)}
                    className="h-4 w-4"
                  />
                  <span className="text-text-secondary text-sm">Public</span>
                </label>
              </div>
              <p className="text-text-muted mt-1 text-[10px]">
                {form.isPublic ? "Anyone can view this learning path" : "Only you can view this learning path"}
              </p>
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
                  className={errors.estimatedDuration ? "border-error" : ""}
                />
                {errors.estimatedDuration && (
                  <p className="text-error mt-0.5 text-[11px]">{errors.estimatedDuration}</p>
                )}
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
            <div className="flex items-center gap-2">
              {form.courses.length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllCourses}
                  >
                    {selectedCourses.size === form.courses.length ? (
                      <Check size={14} className="mr-1" />
                    ) : null}
                    {selectedCourses.size === form.courses.length ? "Deselect All" : "Select All"}
                  </Button>
                  {selectedCourses.size > 0 && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => bulkMoveCourses("up")}
                        disabled={selectedCourses.size === 0}
                      >
                        <ChevronUp size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => bulkMoveCourses("down")}
                        disabled={selectedCourses.size === 0}
                      >
                        <ChevronDown size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={bulkRemoveCourses}
                        disabled={selectedCourses.size === 0}
                        className="text-error hover:text-error hover:bg-error/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </>
              )}
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setShowCoursePicker(!showCoursePicker)}
              >
                <Plus size={14} /> Add Course
              </Button>
            </div>
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
              
              {/* Filters */}
              <div className="mb-3 flex gap-2">
                <Select
                  value={coursePickerCategory}
                  onValueChange={(v) => {
                    setCoursePickerCategory(v);
                    setCoursePickerPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-32 text-[11px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={coursePickerDifficulty}
                  onValueChange={(v) => {
                    setCoursePickerDifficulty(v);
                    setCoursePickerPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-32 text-[11px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-64 space-y-1 overflow-y-auto">
                {paginatedCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => addCourse(course)}
                    className="hover:bg-bg-surface-active flex w-full items-center gap-3 rounded-md p-2 text-left"
                  >
                    <div className="bg-bg-surface border-border flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border overflow-hidden">
                      {course.coverImage ? (
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full w-full"><BookOpen size={16} className="text-text-muted" /></div>`;
                          }}
                        />
                      ) : (
                        <BookOpen size={16} className="text-text-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary line-clamp-1 text-xs font-semibold">
                        {course.title}
                      </p>
                      <p className="text-text-muted text-[10px]">
                        {course.lessons || course.totalLessons || 0} lessons · {course.duration || "—"}
                      </p>
                    </div>
                    <Plus size={14} className="text-text-muted flex-shrink-0" />
                  </button>
                ))}
                {paginatedCourses.length === 0 && (
                  <p className="text-text-muted py-4 text-center text-xs">No courses available</p>
                )}
              </div>

              {/* Load more */}
              {hasMoreCourses && (
                <button
                  type="button"
                  onClick={() => setCoursePickerPage(p => p + 1)}
                  className="text-primary hover:text-primary-hover mt-2 w-full rounded-md py-2 text-xs font-medium transition-colors"
                >
                  Load More Courses ({filteredCourses.length - paginatedCourses.length} remaining)
                </button>
              )}
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
                  className={`border-border bg-bg-surface-hover flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 ${
                    selectedCourses.has(course.id) ? "ring-2 ring-primary/20 shadow-md" : "hover:shadow-sm"
                  }`}
                  style={{ borderLeft: `3px solid ${form.color}` }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedCourses.has(course.id)}
                    onChange={() => toggleCourseSelection(course.id)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary transition-transform hover:scale-110"
                  />

                  {/* Step number */}
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-secondary transition-transform hover:scale-110"
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
                      className="hover:bg-bg-surface flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCourse(idx, "down")}
                      disabled={idx === form.courses.length - 1}
                      className="hover:bg-bg-surface flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCourse(course.id)}
                      className="text-error hover:bg-error/10 flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-all hover:scale-110"
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
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-secondary"
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
