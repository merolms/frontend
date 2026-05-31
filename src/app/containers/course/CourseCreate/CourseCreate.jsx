import React, { useState, useEffect } from "react";
import { t } from "@/styles/theme";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Lightbulb, X } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { fetchCategories } from "@/app/services/categoryService";
import UnsplashPicker from "@/app/containers/course/components/UnsplashPicker";

const CourseCreate = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({ title: "", description: "", category: null, coverImage: "" });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        setCategories(cats.map((c) => ({ value: c.id, label: c.name })));
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Course title is required";
    if (form.title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const { createCourse } = await import("@/app/services/courseService");
      const course = await createCourse({
        ...form,
        authorID: currentUser?.id ?? null,
      });
      navigate(`/courses/${course.id}`);
    } catch (err) {
      setApiError(err.message || "Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full h-8 px-3 rounded-md border border-border bg-bg-surface text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-1";

  return (
    <DashboardLayout title="Create Course" subtitle="Fill in the course details below">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/courses")} className="text-primary hover:underline">
          Courses
        </button>
        <span>/</span>
        <span>Create Course</span>
      </div>

      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7">
          <div className="border-border bg-bg-surface space-y-3 rounded-lg border p-6 shadow-sm">
            <h2 className="text-text-primary text-base font-semibold">
              <Plus size={16} className="mr-1 inline" style={{ color: t("primary") }} />
              Create New Course
            </h2>
            <p className="text-text-muted text-xs">
              Fill in the course details below. You can add lessons later from the Course Builder.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {apiError && <p className="text-error text-xs">{apiError}</p>}
              {Object.keys(errors).length > 0 && !apiError && (
                <p className="text-error text-xs">Please fix the errors below.</p>
              )}

              <div>
                <label className="text-text-primary text-xs font-semibold">Course Title *</label>
                <input
                  name="title"
                  placeholder="e.g., Advanced React Patterns"
                  value={form.title}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, title: e.target.value }));
                    if (errors.title) setErrors((p) => ({ ...p, title: null }));
                  }}
                  className={inputCls}
                />
                {errors.title && <p className="text-error mt-0.5 text-[11px]">{errors.title}</p>}
              </div>

              <div>
                <label className="text-text-primary text-xs font-semibold">Description *</label>
                <textarea
                  name="description"
                  placeholder="What will students learn? What are the prerequisites?"
                  className={`${inputCls} min-h-[110px] py-1.5`}
                  value={form.description}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, description: e.target.value }));
                    if (errors.description) setErrors((p) => ({ ...p, description: null }));
                  }}
                />
                {errors.description && (
                  <p className="text-error mt-0.5 text-[11px]">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="text-text-primary text-xs font-semibold">Category *</label>
                <select
                  name="category"
                  value={form.category || ""}
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      category: e.target.value ? parseInt(e.target.value) : null,
                    }));
                    if (errors.category) setErrors((p) => ({ ...p, category: null }));
                  }}
                  className={inputCls}
                >
                  <option value="">Select a category</option>
                  {categories.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-error mt-0.5 text-[11px]">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="text-text-primary text-xs font-semibold">Cover Image</label>
                <div className="mt-1 flex gap-2">
                  <input
                    name="coverImage"
                    placeholder="https://example.com/cover.jpg"
                    value={form.coverImage}
                    onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => setUnsplashOpen(true)}
                    disabled={loading}
                    className="border-border text-text-secondary hover:bg-bg-surface-active h-8 cursor-pointer rounded-md border px-3 text-xs"
                  >
                    Unsplash
                  </button>
                </div>
                {form.coverImage && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={form.coverImage}
                      alt="Cover"
                      className="max-h-40 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, coverImage: "" }))}
                      className="bg-error absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded text-white hover:opacity-80"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/courses")}
                  disabled={loading}
                  className="border-border text-text-secondary hover:bg-bg-surface-active h-8 cursor-pointer rounded-md border px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-hover h-8 cursor-pointer rounded-md px-4 text-xs font-medium text-white disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          {form.coverImage && (
            <div className="border-border bg-bg-surface rounded-lg border p-6 shadow-sm">
              <h3 className="text-text-primary mb-2 text-sm font-semibold">Current Cover</h3>
              <img src={form.coverImage} alt="Cover" className="w-full rounded-md" />
            </div>
          )}
          <div className="border-border bg-bg-surface space-y-2 rounded-lg border p-6 shadow-sm">
            <h3 className="text-text-primary flex items-center gap-1 text-sm font-semibold">
              <Lightbulb size={14} /> Tips
            </h3>
            <ul className="text-text-muted list-inside list-disc space-y-1 text-xs">
              <li>Choose a descriptive, specific title</li>
              <li>Write a compelling description (100-200 words)</li>
              <li>Select the most relevant category</li>
              <li>Use a high-quality cover image (16:9 ratio)</li>
            </ul>
          </div>
        </div>
      </div>

      <UnsplashPicker
        open={unsplashOpen}
        onClose={() => setUnsplashOpen(false)}
        onSelect={(url) => {
          setForm((p) => ({ ...p, coverImage: url }));
          setUnsplashOpen(false);
        }}
        initialQuery={form.title || "education"}
      />
    </DashboardLayout>
  );
};

export default CourseCreate;
