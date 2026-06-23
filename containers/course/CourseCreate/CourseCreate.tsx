// @ts-nocheck
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/ui/dashboard-layout";
import CourseForm from "@/containers/course/CourseForm/CourseForm";
import { useToast } from "@/context/ToastContext";
import { usePageTitle } from "@/hooks";
import { useUnsavedChanges } from "@/hooks";
import { useCreateCourse } from "@/hooks/queries/useCourses";
import { useCategories } from "@/hooks/queries/useEntities";
import { t } from "@/styles/theme";

const draft_KEY = "course_create_draft";

const CourseCreate = () => {
  usePageTitle("Create Course");
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const { addToast } = useToast();

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(draft_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert category from string to integer if it exists
        if (parsed.category && typeof parsed.category === "string") {
          parsed.category = parseInt(parsed.category, 10);
        }
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return { title: "", description: "", category: null, imageUrl: "", duration: "" };
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // ─── TanStack Query: categories + create mutation ───
  const { data: categories = [] } = useCategories({ start: 0, limit: 100 });
  const createMutation = useCreateCourse();

  const { updateForm, clearDirty } = useUnsavedChanges(
    form,
    { title: "", description: "", category: null, imageUrl: "", duration: "" },
    setForm,
    draft_KEY
  );

  // Save draft to localStorage
  useEffect(() => {
    localStorage.setItem(draft_KEY, JSON.stringify(form));
  }, [form]);

  const validate = () => {
    const e = {};
    if (!form.title?.trim()) e.title = "Course title is required";
    if (!form.description?.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setApiError(null);
      const result = await createMutation.mutateAsync({
        title: form.title,
        description: form.description,
        category: form.category,
        imageUrl: form.imageUrl,
        duration: form.duration ? parseInt(form.duration) : null,
        instructorID: currentUser?.id,
      });

      addToast("Course created successfully!", "success");
      clearDirty();
      localStorage.removeItem(draft_KEY);
      navigate(`/courses/${result.id}/builder`);
    } catch (err) {
      setApiError(err.message || "Failed to create course. Please try again.");
    }
  };

  const handleFieldChange = (field, value) => {
    updateForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

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

            <CourseForm
              mode="create"
              form={form}
              setForm={setForm}
              categories={categories}
              apiError={apiError}
              errors={errors}
              onFieldChange={handleFieldChange}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/courses")}
              loading={createMutation.isPending}
              submitLabel="Create Course"
              setCoverUploading={() => {}}
              setCoverError={() => {}}
              autoSave={true}
              autoSaveKey={draft_KEY}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseCreate;
