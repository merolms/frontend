import { Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CourseForm from "@/app/containers/course/CourseForm/CourseForm";
import LoadingState from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { usePageTitle } from "@/hooks";
import { useUnsavedChanges } from "@/hooks";
import { useCourse, useUpdateCourse } from "@/hooks/queries/useCourses";
import { useCategories } from "@/hooks/queries/useEntities";
import { t } from "@/styles/theme";

const CourseEdit = () => {
  usePageTitle("Edit Course");
  const navigate = useNavigate();
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [formInitialized, setFormInitialized] = useState(false);

  // ─── TanStack Query: course data + categories + update mutation ───
  const { data: course, isLoading: fetching, error: courseError } = useCourse(id);
  const { data: categories } = useCategories({ start: 0, limit: 100 });
  const updateMutation = useUpdateCourse();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: null,
    imageUrl: "",
    duration: "",
    status: "draft",
  });


  // Sync form when course data loads
  if (course && !formInitialized) {
    console.log("course data is ", course)
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.categoryId || null,
      imageUrl: course.imageUrl || "",
      duration: course.duration || "",
      status: course.status || "draft",
    });
    setFormInitialized(true);
  }

  const { updateForm } = useUnsavedChanges(
    form,
    {
      title: course?.title || "",
      description: course?.description || "",
      category: course?.categoryId || null,
      imageUrl: course?.imageUrl || course?.imageURL || "",
      duration: course?.duration || "",
      status: course?.status || "draft",
    },
    setForm
  );

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
      await updateMutation.mutateAsync({
        id,
        data: {
          title: form.title,
          description: form.description,
          category: form.category,
          imageUrl: form.imageUrl,
          duration: form.duration ? parseInt(form.duration) : null,
        },
      });
      navigate(`/courses/${id}`);
    } catch (err) {
      setApiError(err.message || "Failed to update course. Please try again.");
    }
  };

  const handleFieldChange = (field, value) => {
    updateForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const displayError = courseError?.message || apiError;

  if (fetching) {
    return (
      <DashboardLayout>
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (courseError) {
    return (
      <DashboardLayout>
        <div className="text-error flex items-center gap-2 py-4">
          Failed to load course data. Please try again.
        </div>
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
                {form.status === "draft" ? "draft" : form.status || "draft"}
              </Badge>
              <span className="text-text-muted text-[11px]">
                Use the course detail page to publish, archive, or restore.
              </span>
            </div>
            
            <CourseForm
              mode="edit"
              status={form.status}
              form={form}
              setForm={setForm}
              categories={categories}
              apiError={displayError}
              errors={errors}
              onFieldChange={handleFieldChange}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/courses/${id}`)}
              loading={updateMutation.isPending}
              submitLabel="Save Changes"
              setCoverUploading={() => {}}
              setCoverError={() => {}}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseEdit;
