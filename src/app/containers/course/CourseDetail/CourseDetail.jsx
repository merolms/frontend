import {
  Archive,
  ArchiveRestore,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Eye,
  Folder,
  List,
  LogOut,
  Network,
  Pencil,
  Plus,
  Star,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import {
  ArchiveModal,
  DeleteModal,
  DropModal,
  PublishModal,
  RestoreModal,
} from "@/app/containers/course/CourseActions/CourseActions";
import { useToast } from "@/app/context/ToastContext";
import { hasPermission } from "@/app/services/authService";
import {
  useCourse,
  useCourseLessons,
  usePublishCourse,
  useArchiveCourse,
  useRestoreCourse,
  useDeleteCourse,
} from "@/hooks/queries/useCourses";
import {
  useEnrollmentStatus,
  useEnrollInCourse,
  useDropCourse,
  useCourseEnrollments,
  useLessonCompletionCounts,
} from "@/hooks/queries/useEnrollments";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import LoadingState from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageTitle } from "@/hooks";
import { t } from "@/styles/theme";

import EnrollmentManagement from "./components/EnrollmentManagement";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);
  const { addToast } = useToast();
  const [activeModal, setActiveModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canManageEnrollments = hasPermission(user, "courses.edit");

  // ─── TanStack Query: replaces manual useState + useEffect + Promise.all ───
  const { data: course, isLoading, error } = useCourse(id);
  const { data: lessons = [] } = useCourseLessons(id);
  const { data: enrollment } = useEnrollmentStatus(id, { enabled: !!user });
  const { data: enrollments = [] } = useCourseEnrollments(id, { enabled: canManageEnrollments });
  const enrollmentsSafe = enrollments || [];
  const { data: lessonCompletionCounts = {} } = useLessonCompletionCounts(id, {
    enabled: canManageEnrollments,
  });

  usePageTitle(course?.title ? `${course.title} — Course` : "Course Details");

  // ─── Mutations ──────────────────────────────────────────
  const publishMutation = usePublishCourse();
  const archiveMutation = useArchiveCourse();
  const restoreMutation = useRestoreCourse();
  const deleteMutation = useDeleteCourse();
  const enrollMutation = useEnrollInCourse();
  const dropMutation = useDropCourse();

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setActionLoading(true);
      const result = await enrollMutation.mutateAsync(parseInt(id));
      addToast("Successfully enrolled! Redirecting to course...", "success");
      setTimeout(() => navigate(`/courses/${id}/learn`), 1500);
    } catch (err) {
      addToast(err.message || "Failed to enroll", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDrop = async () => {
    try {
      setActionLoading(true);
      await dropMutation.mutateAsync(parseInt(id));
      addToast("Course dropped", "success");
    } catch (err) {
      addToast(err.message || "Failed to drop course", "error");
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      await publishMutation.mutateAsync(id);
      addToast("Course published successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to publish course", "error");
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading(true);
      await archiveMutation.mutateAsync(id);
      addToast("Course archived", "success");
    } catch (err) {
      addToast(err.message || "Failed to archive course", "error");
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleRestore = async () => {
    try {
      setActionLoading(true);
      await restoreMutation.mutateAsync(id);
      addToast("Course restored to draft", "success");
    } catch (err) {
      addToast(err.message || "Failed to restore course", "error");
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteMutation.mutateAsync(id);
      addToast("Course deleted", "success");
      navigate("/courses");
    } catch (err) {
      addToast(err.message || "Failed to delete course", "error");
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const statusConfig = {
    published: { color: "green", text: "published" },
    draft: { color: "gray", text: "draft" },
    archived: { color: "orange", text: "archived" },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState variant="spinner" centered className="py-20" />
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <FormErrorBanner message={error?.message || "Course not found"} />
        <Button size="sm" onClick={() => navigate("/courses")}>
          Back to Courses
        </Button>
      </DashboardLayout>
    );
  }

  const status = statusConfig[course.status] || statusConfig.draft;

  return (
    <>
      <DashboardLayout>
        {/* Breadcrumb */}
        <div className="text-text-muted mb-3 flex items-center gap-1 text-xs">
          <button onClick={() => navigate("/courses")} className="text-primary hover:underline">
            Courses
          </button>
          <ChevronRight size={12} />
          <span>{course.title}</span>
        </div>

        {/* Hero */}
        <div
          className="mb-4 overflow-hidden rounded-xl"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${course.coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop"}) center/cover`,
          }}
        >
          <div className="flex items-start justify-between gap-6 p-6">
            <div className="flex-1 space-y-2">
              <Badge
                variant={
                  status.color === "green" ? "green" : status.color === "orange" ? "orange" : "gray"
                }
              >
                <Check size={10} /> {status.text}
              </Badge>
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
              <p className="max-w-xl text-sm text-white/80">{course.description}</p>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <User size={12} /> {course.author}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Folder size={12} /> {course.category}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {course.duration}
                </span>
              </div>
              {course.tags?.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-8">
              <div className="text-center text-white">
                <List size={20} className="mx-auto mb-1" style={{ color: t("accent") }} />
                <div className="text-lg font-bold">{course.totalLessons}</div>
                <div className="text-[11px] text-white/60">Lessons</div>
              </div>
              <div className="text-center text-white">
                <User size={20} className="mx-auto mb-1" style={{ color: t("primary") }} />
                <div className="text-lg font-bold">
                  {canManageEnrollments ? enrollmentsSafe.length : "—"}
                </div>
                <div className="text-[11px] text-white/60">Enrolled</div>
              </div>
              <div className="text-center text-white">
                <Star size={20} className="mx-auto mb-1" style={{ color: t("warning") }} />
                <div className="text-lg font-bold">—</div>
                <div className="text-[11px] text-white/60">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PermissionGuard permissions={["courses.lessons.manage"]}>
              <Button size="sm" onClick={() => navigate(`/courses/${id}/builder`)}>
                <Network size={14} /> Open Builder
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={["courses.edit"]}>
              <Button size="sm" variant="default" onClick={() => navigate(`/courses/${id}/edit`)}>
                <Pencil size={14} /> Edit Details
              </Button>
            </PermissionGuard>
          </div>
          <div className="flex items-center gap-2">
            {enrollment?.status === "active" && (
              <Button size="sm" variant="default" onClick={() => navigate(`/courses/${id}/learn`)}>
                <Plus size={14} /> Continue Learning
              </Button>
            )}
            {enrollment?.status === "completed" && (
              <Button size="sm" variant="default" onClick={() => navigate(`/courses/${id}/learn`)}>
                <Eye size={14} /> Review Course
              </Button>
            )}
            {enrollment?.status === "dropped" && (
              <Button size="sm" variant="ghost" onClick={handleEnroll} disabled={actionLoading}>
                <Plus size={14} /> Re-enroll
              </Button>
            )}
            {enrollment?.status === "active" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveModal("drop")}
                disabled={actionLoading}
              >
                <LogOut size={14} /> Drop
              </Button>
            )}
            {!enrollment && user && course.status === "published" && (
              <Button size="sm" variant="primary" onClick={handleEnroll} disabled={actionLoading}>
                <Plus size={14} /> Enroll Now
              </Button>
            )}
            {course.status === "draft" && (
              <PermissionGuard permissions={["courses.publish"]}>
                <Button size="sm" variant="ghost" onClick={() => setActiveModal("publish")}>
                  <Check size={14} /> Publish
                </Button>
              </PermissionGuard>
            )}
            {course.status === "published" && (
              <PermissionGuard permissions={["courses.publish"]}>
                <Button size="sm" variant="ghost" onClick={() => setActiveModal("archive")}>
                  <Archive size={14} /> Archive
                </Button>
              </PermissionGuard>
            )}
            {course.status === "archived" && (
              <PermissionGuard permissions={["courses.publish"]}>
                <Button size="sm" variant="ghost" onClick={() => setActiveModal("restore")}>
                  <ArchiveRestore size={14} /> Restore
                </Button>
              </PermissionGuard>
            )}
            <PermissionGuard permissions={["courses.delete"]}>
              <Button size="sm" variant="danger" onClick={() => setActiveModal("delete")}>
                <Trash2 size={14} /> Delete
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Tabs + Sidebar */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <Paper className="p-4">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
                  <PermissionGuard permissions={["courses.enrollment.manage"]}>
                    <TabsTrigger value="enrollment">
                      Enrollment ({enrollmentsSafe.length})
                    </TabsTrigger>
                  </PermissionGuard>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  {course?.description && (
                    <div>
                      <h3 className="text-text-primary mb-2 text-sm font-semibold">
                        About This Course
                      </h3>
                      <p className="text-text-secondary text-xs">{course.description}</p>
                    </div>
                  )}
                  {course?.tags?.length > 0 && (
                    <div>
                      <h3 className="text-text-primary mb-2 text-sm font-semibold">
                        Topics Covered
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {course.tags.map((tag) => (
                          <Badge key={tag} variant="teal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enrollment Summary */}
                  {canManageEnrollments && enrollmentsSafe.length > 0 && (
                    <div>
                      <h3 className="text-text-primary mb-2 flex items-center gap-1.5 text-sm font-semibold">
                        <Users size={14} style={{ color: t("primary") }} /> Enrollment
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="border-border bg-bg-surface rounded-lg border px-3 py-2 text-center">
                          <div className="text-text-primary text-lg font-bold">
                            {enrollmentsSafe.length}
                          </div>
                          <div className="text-text-muted text-[10px]">Total Enrolled</div>
                        </div>
                        <div className="border-border bg-bg-surface rounded-lg border px-3 py-2 text-center">
                          <div className="text-success text-lg font-bold">
                            {enrollmentsSafe.filter((e) => e.status === "active").length}
                          </div>
                          <div className="text-text-muted text-[10px]">Active</div>
                        </div>
                        <div className="border-border bg-bg-surface rounded-lg border px-3 py-2 text-center">
                          <div className="text-accent text-lg font-bold">
                            {enrollmentsSafe.filter((e) => e.status === "completed").length}
                          </div>
                          <div className="text-text-muted text-[10px]">Completed</div>
                        </div>
                      </div>
                      {/* Average progress */}
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-text-muted text-[11px]">Average Progress</span>
                          <span className="text-text-primary text-[11px] font-semibold">
                            {Math.round(
                              enrollmentsSafe.reduce(
                                (sum, e) => sum + (e.progressPercent ?? 0),
                                0
                              ) / enrollmentsSafe.length
                            )}
                            %
                          </span>
                        </div>
                        <div className="bg-bg-surface-active h-1.5 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(enrollmentsSafe.reduce((sum, e) => sum + (e.progressPercent ?? 0), 0) / enrollmentsSafe.length)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-text-primary mb-2 text-sm font-semibold">Course Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User size={14} className="mt-0.5" style={{ color: t("accent") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">
                              Instructor
                            </div>
                            <div className="text-text-muted text-xs">
                              {course?.author || "N/A"}
                              {course?.authorEmail && (
                                <span className="ml-2 text-[10px]">· {course.authorEmail}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Folder size={14} className="mt-0.5" style={{ color: t("secondary") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">Category</div>
                            <div className="text-text-muted text-xs">
                              {course?.category || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock size={14} className="mt-0.5" style={{ color: t("warning") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">Duration</div>
                            <div className="text-text-muted text-xs">
                              {course?.duration || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <List size={14} className="mt-0.5" style={{ color: t("accent") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">Lessons</div>
                            <div className="text-text-muted text-xs">
                              {course?.totalLessons || 0} lessons
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Star size={14} className="mt-0.5" style={{ color: t("warning") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">Rating</div>
                            <div className="text-text-muted text-xs">—</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={14} className="mt-0.5" style={{ color: t("success") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">Status</div>
                            <div className="text-text-muted text-xs">{status.text}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="lessons" className="space-y-3">
                  {lessons.length === 0 ? (
                    <div className="text-text-muted py-8 text-center text-sm">
                      No lessons yet. Open the builder to add lessons.
                    </div>
                  ) : (
                    lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="border-border bg-bg-surface flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-text-primary text-sm font-semibold">
                            {lesson.title}
                          </div>
                          <div className="text-text-muted text-xs">
                            {lesson.type} {lesson.duration ? `· ${lesson.duration}` : ""}
                          </div>
                        </div>
                        <Badge variant="gray">{lesson.status}</Badge>
                      </div>
                    ))
                  )}
                </TabsContent>
                <TabsContent value="enrollment">
                  <EnrollmentManagement
                    courseId={parseInt(id)}
                    enrollments={enrollmentsSafe}
                    completionCounts={lessonCompletionCounts}
                  />
                </TabsContent>
              </Tabs>
            </Paper>
          </div>

          {/* Sidebar */}
          <div className="col-span-5 space-y-4">
            {/* Quick Stats */}
            <Paper className="p-4">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">Total Lessons</span>
                  <span className="text-text-primary text-sm font-semibold">
                    {course.totalLessons}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">Enrolled</span>
                  <span className="text-text-primary text-sm font-semibold">
                    {canManageEnrollments ? enrollmentsSafe.length : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">Status</span>
                  <Badge
                    variant={
                      status.color === "green"
                        ? "green"
                        : status.color === "orange"
                          ? "orange"
                          : "gray"
                    }
                  >
                    {status.text}
                  </Badge>
                </div>
              </div>
            </Paper>

            {/* Recent Activity */}
            <Paper className="p-4">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">Recent Activity</h3>
              <div className="text-text-muted py-4 text-center text-xs">No recent activity</div>
            </Paper>
          </div>
        </div>
      </DashboardLayout>

      {/* Modals */}
      <PublishModal
        open={activeModal === "publish"}
        onCancel={() => setActiveModal(null)}
        onConfirm={handlePublish}
        loading={publishMutation.isLoading}
      />
      <ArchiveModal
        open={activeModal === "archive"}
        onCancel={() => setActiveModal(null)}
        onConfirm={handleArchive}
        loading={archiveMutation.isLoading}
      />
      <RestoreModal
        open={activeModal === "restore"}
        onCancel={() => setActiveModal(null)}
        onConfirm={handleRestore}
        loading={restoreMutation.isLoading}
      />
      <DeleteModal
        open={activeModal === "delete"}
        onCancel={() => setActiveModal(null)}
        onConfirm={handleDelete}
        itemName={course?.title || "this course"}
        loading={deleteMutation.isLoading}
        warnings={{
          lessons: lessons?.length || 0,
          enrolled: course?.enrolledUsers || enrollmentsSafe?.length || 0,
        }}
      />
      <DropModal
        open={activeModal === "drop"}
        onCancel={() => setActiveModal(null)}
        onConfirm={handleDrop}
        loading={dropMutation.isLoading}
      />
    </>
  );
};

export default CourseDetail;
