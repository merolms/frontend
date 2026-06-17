import { Lightbulb, Network, Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UnsplashPicker from "@/app/containers/course/components/UnsplashPicker";
import { fetchCategories } from "@/app/services/categoryService";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import LoadingState from "@/components/common/LoadingState";
import FormActions from "@/components/forms/FormActions";
import FormField from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { usePageTitle } from "@/hooks";
import { useUnsavedChanges } from "@/hooks";
import { t } from "@/styles/theme";

const CourseEdit = () => {
  usePageTitle("Edit Course");
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: null, coverImage: "" });
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [unsplashOpen, setUnsplashOpen] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const initialForm = course
    ? {
        title: course.title || "",
        description: course.description || "",
        category: course.categoryID || null,
        coverImage: course.coverImage || course.imageURL || "",
        duration: course.duration || "",
      }
    : form;
  const { updateForm, clearDirty } = useUnsavedChanges(form, initialForm, setForm);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    try {
      const { uploadCourseImage } = await import("@/app/services/courseService");
      const presignUrl = await uploadCourseImage(file);
      updateForm((p) => ({ ...p, coverImage: presignUrl }));
    } catch (err) {
      setApiError(err.message || "Failed to upload image");
    } finally {
      setCoverUploading(false);
    }
  };

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        setCategories(cats.map((c) => ({ value: c.id, label: c.name })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { fetchCourseById } = await import("@/app/services/courseService");
        const data = await fetchCourseById(id);
        setCourse(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.categoryID || null,
          coverImage: data.coverImage || data.imageURL || "",
          duration: data.duration || "",
          status: data.status || "draft",
        });
      } catch (err) {
        setApiError(err.message || "Failed to load course data.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

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
      const { updateCourse } = await import("@/app/services/courseService");
      await updateCourse(id, form);
      clearDirty();
      navigate(`/courses/${id}`);
    } catch (err) {
      setApiError(err.message || "Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full h-8 px-3 rounded-md border border-border bg-bg-surface text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-1";

  if (fetching) {
    return (
      <DashboardLayout>
        <LoadingState variant="spinner" text="Loading course data..." centered className="py-20" />
      </DashboardLayout>
    );
  }

  if (apiError && !course) {
    return (
      <DashboardLayout>
        <FormErrorBanner message={apiError} />
        <button
          onClick={() => navigate("/courses")}
          className="text-primary text-sm hover:underline"
        >
          Back to Courses
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Course" subtitle="Update the course metadata and settings">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/courses")} className="text-primary hover:underline">
          Courses
        </button>
        <span>/</span>
        <button onClick={() => navigate(`/courses/${id}`)} className="text-primary hover:underline">
          {course?.title}
        </button>
        <span>/</span>
        <span>Edit</span>
      </div>

      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7">
          <div className="border-border bg-bg-surface space-y-3 rounded-lg border p-6 shadow-sm">
            <h2 className="text-text-primary text-base font-semibold">
              <Pencil size={16} className="mr-1 inline" style={{ color: t("accent") }} />
              Edit Course
            </h2>
            <p className="text-text-muted text-xs">Update the course metadata and settings.</p>

            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs">Status</span>
              <Badge
                variant={
                  form.status === "published"
                    ? "green"
                    : form.status === "archived"
                      ? "orange"
                      : "gray"
                }
              >
                {form.status === "draft" ? "Draft" : form.status || "Draft"}
              </Badge>
              <span className="text-text-muted text-[11px]">
                Use the course detail page to publish, archive, or restore.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {apiError && <FormErrorBanner message={apiError} />}
              {Object.keys(errors).length > 0 && !apiError && (
                <FormErrorBanner message="Please fix the errors below." />
              )}

              <FormField label="Course Title" error={errors.title} required>
                <input
                  name="title"
                  value={form.title}
                  onChange={(e) => {
                    updateForm((p) => ({ ...p, title: e.target.value }));
                    if (errors.title) setErrors((p) => ({ ...p, title: null }));
                  }}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Description" error={errors.description} required>
                <textarea
                  name="description"
                  className={`${inputCls} min-h-[110px] py-1.5`}
                  value={form.description}
                  onChange={(e) => {
                    updateForm((p) => ({ ...p, description: e.target.value }));
                    if (errors.description) setErrors((p) => ({ ...p, description: null }));
                  }}
                />
              </FormField>

              <FormField label="Category" error={errors.category} required>
                <select
                  name="category"
                  value={form.category || ""}
                  onChange={(e) => {
                    updateForm((p) => ({
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
              </FormField>

              <FormField label="Duration (hours)" error={errors.duration}>
                <input
                  name="duration"
                  type="number"
                  min="0"
                  placeholder="e.g. 8"
                  value={form.duration ?? ""}
                  onChange={(e) => updateForm((p) => ({ ...p, duration: e.target.value }))}
                  className={inputCls}
                />
              </FormField>

              <div>
                <label className="text-text-primary text-xs font-semibold">Cover Image</label>
                <div className="mt-1 flex gap-2">
                  <input
                    name="coverImage"
                    placeholder="https://example.com/cover.jpg"
                    value={form.coverImage}
                    onChange={(e) => updateForm((p) => ({ ...p, coverImage: e.target.value }))}
                    className={`${inputCls} flex-1`}
                  />
                  <label
                    className={`border-border text-text-secondary hover:bg-bg-surface-active flex h-8 items-center rounded-md border px-3 text-xs ${
                      coverUploading || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    }`}
                  >
                    {coverUploading ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={coverUploading || loading}
                      className="hidden"
                    />
                  </label>
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
                      onClick={() => updateForm((p) => ({ ...p, coverImage: "" }))}
                      className="bg-error text-secondary absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded hover:opacity-80"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <FormActions
                onCancel={() => navigate(`/courses/${id}`)}
                loading={loading}
                submitLabel={loading ? "Saving..." : "Save Changes"}
              />
            </form>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="border-border bg-bg-surface space-y-2 rounded-lg border p-6 shadow-sm">
            <h3 className="text-text-primary text-sm font-semibold">
              <Plus size={14} className="mr-1 inline" style={{ color: t("warning") }} />
              Quick Actions
            </h3>
            <button
              onClick={() => navigate(`/courses/${id}/builder`)}
              className="text-primary flex items-center gap-1.5 text-xs hover:underline"
            >
              <Network size={12} /> Open Course Builder
            </button>
          </div>
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
          updateForm((p) => ({ ...p, coverImage: url }));
          setUnsplashOpen(false);
        }}
        initialQuery={form.title || "education"}
      />
    </DashboardLayout>
  );
};

export default CourseEdit;
