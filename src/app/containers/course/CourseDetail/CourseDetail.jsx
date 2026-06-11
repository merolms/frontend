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
import { useCallback, useEffect, useState } from "react";
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
  archiveCourse,
  deleteCourse,
  fetchCourseById,
  fetchLessons,
  publishCourse,
  restoreCourse,
} from "@/app/services/courseService";
import {
  dropCourseAPI,
  enrollInCourseAPI,
  getCourseEnrollments,
  getEnrollmentStatus,
  getLessonCompletionCounts,
} from "@/app/services/enrollmentService";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import LoadingState from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [course, setCourse] = useState(null);
  usePageTitle(course?.title ? `${course.title} — Course` : "Course Details");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [lessonCompletionCounts, setLessonCompletionCounts] = useState({});
  const [error, setError] = useState(null);

  const canManageEnrollments = hasPermission(user, "courses.edit");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, lessonsData, enrollmentData] = await Promise.all([
        fetchCourseById(id),
        fetchLessons(id),
        user ? getEnrollmentStatus(parseInt(id)) : Promise.resolve(null),
      ]);
      setCourse(courseData);
      setLessons(lessonsData || []);
      setEnrollment(enrollmentData);

      // Admin-only analytics — calling these without permission would 403
      if (canManageEnrollments) {
        const [enrollmentsData, counts] = await Promise.all([
          getCourseEnrollments(parseInt(id)).catch(() => []),
          getLessonCompletionCounts(parseInt(id)),
        ]);
        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
        setLessonCompletionCounts(counts);
      }
    } catch (err) {
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id, user, canManageEnrollments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setActionLoading(true);
      const result = await enrollInCourseAPI(parseInt(id));
      setEnrollment(result);
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
      const result = await dropCourseAPI(parseInt(id));
      setEnrollment(result);
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
      const updated = await publishCourse(id);
      setCourse(updated);
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
      const updated = await archiveCourse(id);
      setCourse(updated);
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
      const updated = await restoreCourse(id);
      setCourse(updated);
      addToast("Course restored to Draft", "success");
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
      await deleteCourse(id);
      addToast("Course deleted", "success");
      navigate("/courses");
    } catch (err) {
      addToast(err.message || "Failed to delete course", "error");
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const statusConfig = {
    Published: { color: "green", text: "Published" },
    DRAFT: { color: "gray", text: "Draft" },
    Archived: { color: "orange", text: "Archived" },
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState variant="spinner" centered className="py-20" />
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <FormErrorBanner message={error || "Course not found"} />
        <Button size="sm" onClick={() => navigate("/courses")}>
          Back to Courses
        </Button>
      </DashboardLayout>
    );
  }

  const status = statusConfig[course.status] || statusConfig.DRAFT;

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
            background: course.coverImage
              ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${course.coverImage}) center/cover`
              : "linear-gradient(135deg, #1a2332 0%, #232f3e 100%)",
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
                  {canManageEnrollments ? enrollments.length : "—"}
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
              <Button size="sm" variant="green" onClick={handleEnroll} disabled={actionLoading}>
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
            {!enrollment && user && course.status === "Published" && (
              <Button size="sm" variant="green" onClick={handleEnroll} disabled={actionLoading}>
                <Plus size={14} /> Enroll Now
              </Button>
            )}
            {course.status === "DRAFT" && (
              <PermissionGuard permissions={["courses.publish"]}>
                <Button size="sm" variant="ghost" onClick={() => setActiveModal("publish")}>
                  <Check size={14} /> Publish
                </Button>
              </PermissionGuard>
            )}
            {course.status === "Published" && (
              <PermissionGuard permissions={["courses.publish"]}>
                <Button size="sm" variant="ghost" onClick={() => setActiveModal("archive")}>
                  <Archive size={14} /> Archive
                </Button>
              </PermissionGuard>
            )}
            {course.status === "Archived" && (
              <PermissionGuard permissions={["courses.publish"]}>
                <Button size="sm" variant="ghost" onClick={() => setActiveModal("restore")}>
                  <ArchiveRestore size={14} /> Restore
                </Button>
              </PermissionGuard>
            )}
            <PermissionGuard permissions={["courses.delete"]}>
              <Button size="sm" variant="ghost" onClick={() => setActiveModal("delete")}>
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
                    <TabsTrigger value="enrollment">Enrollment ({enrollments.length})</TabsTrigger>
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
                  {canManageEnrollments && enrollments.length > 0 && (
                    <div>
                      <h3 className="text-text-primary mb-2 flex items-center gap-1.5 text-sm font-semibold">
                        <Users size={14} style={{ color: t("primary") }} /> Enrollment
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="border-border bg-bg-surface rounded-lg border px-3 py-2 text-center">
                          <div className="text-text-primary text-lg font-bold">
                            {enrollments.length}
                          </div>
                          <div className="text-text-muted text-[10px]">Total Enrolled</div>
                        </div>
                        <div className="border-border bg-bg-surface rounded-lg border px-3 py-2 text-center">
                          <div className="text-success text-lg font-bold">
                            {enrollments.filter((e) => e.status === "active").length}
                          </div>
                          <div className="text-text-muted text-[10px]">Active</div>
                        </div>
                        <div className="border-border bg-bg-surface rounded-lg border px-3 py-2 text-center">
                          <div className="text-accent text-lg font-bold">
                            {enrollments.filter((e) => e.status === "completed").length}
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
                              enrollments.reduce((sum, e) => sum + (e.progressPercent ?? 0), 0) /
                                enrollments.length
                            )}
                            %
                          </span>
                        </div>
                        <div className="bg-bg-surface-active h-1.5 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercent ?? 0), 0) / enrollments.length)}%`,
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
                          <List size={14} className="mt-0.5" style={{ color: t("primary") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">Lessons</div>
                            <div className="text-text-muted text-xs">
                              {course?.totalLessons || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <BookOpen size={14} className="mt-0.5" style={{ color: t("accent") }} />
                          <div>
                            <div className="text-text-primary text-xs font-semibold">Created</div>
                            <div className="text-text-muted text-xs">
                              {course?.createdAt || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="lessons">
                  {lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen size={48} className="text-text-muted mb-3" />
                      <p className="text-text-primary text-sm font-medium">No lessons yet</p>
                      <p className="text-text-muted mt-1 text-xs">
                        Start building your course by adding the first lesson.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => {
                        const completionCount = lessonCompletionCounts[lesson.id] || 0;
                        const enrollCount = enrollments.length;
                        const completionPct =
                          enrollCount > 0 ? Math.round((completionCount / enrollCount) * 100) : 0;
                        return (
                          <div
                            key={lesson.id}
                            className="hover:bg-bg-surface-hover flex items-center gap-3 rounded-lg p-2 transition-colors"
                          >
                            <div className="bg-primary-light text-primary flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-text-primary text-xs font-semibold">
                                {lesson.title}
                              </div>
                              {canManageEnrollments && enrollCount > 0 && (
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="bg-bg-surface-active h-1 w-16 overflow-hidden rounded-full">
                                    <div
                                      className="bg-success h-full rounded-full transition-all"
                                      style={{ width: `${completionPct}%` }}
                                    />
                                  </div>
                                  <span className="text-text-muted text-[10px]">
                                    {completionCount}/{enrollCount} completed
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.duration && <Badge variant="teal">{lesson.duration}</Badge>}
                              {canManageEnrollments && completionCount > 0 && (
                                <Badge variant="green" className="text-[10px]">
                                  {completionPct}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="enrollment">
                  <PermissionGuard permissions={["courses.enrollment.manage"]}>
                    <EnrollmentManagement courseId={id} enrollments={enrollments} />
                  </PermissionGuard>
                </TabsContent>
              </Tabs>
            </Paper>
          </div>

          <div className="col-span-5 space-y-4">
            <Paper className="p-4">
              <h3 className="text-text-primary mb-3 flex items-center gap-1 text-sm font-semibold">
                <List size={14} style={{ color: t("primary") }} /> Course Content
              </h3>
              {lessons.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <BookOpen size={28} className="text-text-muted" />
                  <p className="text-text-muted mt-2 text-xs">No lessons added yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="hover:bg-bg-surface-hover flex items-center gap-2 rounded-md p-1.5 transition-colors"
                    >
                      <div className="text-text-muted w-4 text-[11px] font-medium">{index + 1}</div>
                      <div className="flex-1">
                        <div className="text-text-primary text-xs font-medium">{lesson.title}</div>
                        {lesson.duration && (
                          <div className="text-text-muted flex items-center gap-1 text-[11px]">
                            <Clock size={9} /> {lesson.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Paper>

            <Paper className="p-4">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">Quick Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star size={12} />
                  <div>
                    <div className="text-text-primary text-xs font-semibold">Created</div>
                    <div className="text-text-muted text-xs">{course.createdAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={12} />
                  <div>
                    <div className="text-text-primary text-xs font-semibold">Last Updated</div>
                    <div className="text-text-muted text-xs">{course.updatedAt}</div>
                  </div>
                </div>
              </div>
            </Paper>
          </div>
        </div>

        <PublishModal
          open={activeModal === "publish"}
          onConfirm={handlePublish}
          onCancel={() => setActiveModal(null)}
          courseTitle={course.title}
          loading={actionLoading}
        />
        <ArchiveModal
          open={activeModal === "archive"}
          onConfirm={handleArchive}
          onCancel={() => setActiveModal(null)}
          courseTitle={course.title}
          loading={actionLoading}
        />
        <RestoreModal
          open={activeModal === "restore"}
          onConfirm={handleRestore}
          onCancel={() => setActiveModal(null)}
          courseTitle={course.title}
          loading={actionLoading}
        />
        <DeleteModal
          open={activeModal === "delete"}
          onConfirm={handleDelete}
          onCancel={() => setActiveModal(null)}
          itemName={course.title}
          loading={actionLoading}
        />
        <DropModal
          open={activeModal === "drop"}
          onConfirm={handleDrop}
          onCancel={() => setActiveModal(null)}
          courseTitle={course.title}
          loading={actionLoading}
        />
      </DashboardLayout>
    </>
  );
};

export default CourseDetail;
