import { Lightbulb, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCreateAssignment } from "@/hooks/queries/useAssignments";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import FormActions from "@/components/forms/FormActions";
import FormField from "@/components/forms/FormField";
import DashboardLayout from "@/components/ui/dashboard-layout";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { usePageTitle } from "@/hooks";
import { useUnsavedChanges } from "@/hooks";
import { useToast } from "@/app/context/ToastContext";
import { t } from "@/styles/theme";

const draft_KEY = "assignment_create_draft";

const AssignmentCreate = () => {
  usePageTitle("Create Assignment");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const { addToast } = useToast();

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(draft_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return {
      title: "",
      description: "",
      instructions: "",
      maxPoints: 100,
      passingPoints: 0,
      dueDate: "",
      allowLate: false,
      latePenalty: 0,
      maxSubmissions: 1,
      audienceType: "COURSE",
    };
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // TanStack Query mutation hook
  const createMutation = useCreateAssignment();

  const { updateForm, clearDirty } = useUnsavedChanges(
    formData,
    {
      title: "",
      description: "",
      instructions: "",
      maxPoints: 100,
      passingPoints: 0,
      dueDate: "",
      allowLate: false,
      latePenalty: 0,
      maxSubmissions: 1,
      audienceType: "COURSE",
    },
    setFormData,
    { draftKey: draft_KEY }
  );

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Assignment title is required";
    if (formData.title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (formData.maxPoints <= 0) e.maxPoints = "Max points must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);
    try {
      const assignment = await createMutation.mutateAsync({ lessonId, data: formData });
      clearDirty();
      addToast("Assignment created successfully!", "success");
      navigate(`/assignments/${assignment.id}`);
    } catch (err) {
      setApiError(err.message || "Failed to create assignment. Please try again.");
    }
  };

  const inputCls =
    "w-full h-8 px-3 rounded-md border border-border bg-bg-surface text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-1";

  return (
    <DashboardLayout title="Create Assignment" subtitle="Fill in the assignment details below">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/assignments")} className="text-primary hover:underline">
          Assignments
        </button>
        <span>/</span>
        <span>Create Assignment</span>
      </div>

      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7">
          <div className="border-border bg-bg-surface space-y-3 rounded-lg border p-6 shadow-sm">
            <h2 className="text-text-primary text-base font-semibold">
              <Plus size={16} className="mr-1 inline" style={{ color: t("primary") }} />
              Create New Assignment
            </h2>
            <p className="text-text-muted text-xs">
              Fill in the assignment details below. Assignments can be created independently or
              linked to a specific lesson.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {apiError && <FormErrorBanner message={apiError} />}
              {Object.keys(errors).length > 0 && !apiError && (
                <FormErrorBanner message="Please fix the errors below." />
              )}

              <FormField label="Assignment Title" error={errors.title} required>
                <input
                  name="title"
                  placeholder="e.g., React Fundamentals Quiz"
                  value={formData.title}
                  onChange={(e) => {
                    updateForm((p) => ({ ...p, title: e.target.value }));
                    if (errors.title) setErrors((p) => ({ ...p, title: null }));
                  }}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Description" error={errors.description}>
                <textarea
                  name="description"
                  placeholder="Brief description of the assignment"
                  className={`${inputCls} min-h-[80px] py-1.5`}
                  value={formData.description}
                  onChange={(e) => {
                    updateForm((p) => ({ ...p, description: e.target.value }));
                    if (errors.description) setErrors((p) => ({ ...p, description: null }));
                  }}
                />
              </FormField>

              <FormField label="Instructions" error={errors.instructions}>
                <RichTextEditor
                  value={formData.instructions}
                  onChange={(value) => {
                    updateForm((p) => ({ ...p, instructions: value }));
                    if (errors.instructions) setErrors((p) => ({ ...p, instructions: null }));
                  }}
                  placeholder="Enter submission instructions"
                  rows={4}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Max Points" error={errors.maxPoints} required>
                  <input
                    name="maxPoints"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={formData.maxPoints}
                    onChange={(e) => {
                      updateForm((p) => ({ ...p, maxPoints: parseInt(e.target.value) || 100 }));
                      if (errors.maxPoints) setErrors((p) => ({ ...p, maxPoints: null }));
                    }}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Passing Points" error={errors.passingPoints}>
                  <input
                    name="passingPoints"
                    type="number"
                    min="0"
                    placeholder="60"
                    value={formData.passingPoints}
                    onChange={(e) =>
                      updateForm((p) => ({ ...p, passingPoints: parseInt(e.target.value) || 0 }))
                    }
                    className={inputCls}
                  />
                </FormField>
              </div>

              <FormField label="Due Date" error={errors.dueDate}>
                <input
                  name="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => updateForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className={inputCls}
                />
              </FormField>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowLate}
                    onChange={(e) => updateForm((p) => ({ ...p, allowLate: e.target.checked }))}
                    className="border-border h-4 w-4 rounded"
                  />
                  <span className="text-text-primary text-xs">Allow Late Submissions</span>
                </label>
                {formData.allowLate && (
                  <div className="flex items-center gap-2">
                    <label className="text-text-primary text-xs">Late Penalty (% per day):</label>
                    <input
                      name="latePenalty"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.latePenalty}
                      onChange={(e) =>
                        updateForm((p) => ({ ...p, latePenalty: parseInt(e.target.value) || 0 }))
                      }
                      className="border-border bg-bg-surface text-text-primary focus-visible:ring-primary h-8 w-20 rounded-md border px-3 text-xs focus-visible:ring-2 focus-visible:outline-none"
                    />
                  </div>
                )}
              </div>

              <FormField label="Max Submissions (0 = unlimited)" error={errors.maxSubmissions}>
                <input
                  name="maxSubmissions"
                  type="number"
                  min="0"
                  placeholder="1"
                  value={formData.maxSubmissions}
                  onChange={(e) =>
                    updateForm((p) => ({ ...p, maxSubmissions: parseInt(e.target.value) || 1 }))
                  }
                  className={inputCls}
                />
              </FormField>

              <FormField label="Audience Type" error={errors.audienceType}>
                <select
                  name="audienceType"
                  value={formData.audienceType}
                  onChange={(e) => updateForm((p) => ({ ...p, audienceType: e.target.value }))}
                  className={inputCls}
                >
                  <option value="COURSE">Course-wide (all enrolled learners)</option>
                  <option value="SELECTED_USERS">Selected Users</option>
                  <option value="SELECTED_TEAMS">Selected Teams</option>
                </select>
              </FormField>

              <FormActions
                onCancel={() => navigate("/assignments")}
                loading={createMutation.isPending}
                submitLabel={createMutation.isPending ? "Creating..." : "Create Assignment"}
              />
            </form>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="border-border bg-bg-surface space-y-2 rounded-lg border p-6 shadow-sm">
            <h3 className="text-text-primary flex items-center gap-1 text-sm font-semibold">
              <Lightbulb size={14} /> Tips
            </h3>
            <ul className="text-text-muted list-inside list-disc space-y-1 text-xs">
              <li>Choose a descriptive, specific title</li>
              <li>Provide clear instructions for students</li>
              <li>Set appropriate due dates and grading criteria</li>
              <li>Use the rich text editor for formatted instructions</li>
              <li>Consider allowing late submissions with penalties</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentCreate;
