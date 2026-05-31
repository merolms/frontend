import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  Clock,
  Eye,
  List,
  Pencil,
  Plus,
  Network,
  Trash2,
  ChevronRight,
  Loader,
} from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paper } from "@/components/ui/card";
import LessonForm from "@/app/containers/course/LessonForm/LessonForm";
import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import {
  fetchCourseById,
  fetchLessons,
  createLesson,
  updateLesson,
  deleteLesson as apiDeleteLesson,
} from "@/app/services/courseService";
import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import { t } from "@/styles/theme";

const CourseLessons = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, lesson: null });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      setCourse(c);
      setLessons(l || []);
    } catch (err) {
      console.error("Error loading lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editingLesson) {
        await updateLesson(id, editingLesson.id, formData);
      } else {
        await createLesson(id, { ...formData, sort_order: lessons.length + 1 });
      }
      setLessonModalOpen(false);
      setEditingLesson(null);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteModal.lesson) return;
    setSaving(true);
    try {
      await apiDeleteLesson(id, deleteModal.lesson.id);
      setDeleteModal({ open: false, lesson: null });
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to delete lesson.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DashboardLayout
        title={course?.title ? `Lessons: ${course.title}` : "Lessons"}
        subtitle={`${lessons.length} lesson${lessons.length !== 1 ? "s" : ""}`}
      >
        <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
          <button onClick={() => navigate("/courses")} className="text-primary hover:underline">
            Courses
          </button>
          <ChevronRight size={12} />
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="text-primary hover:underline"
          >
            {course?.title}
          </button>
          <ChevronRight size={12} />
          <span>Lessons</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="text-text-muted animate-spin" size={20} />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-10">
              <Paper className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-text-primary flex items-center gap-1 text-base font-semibold">
                      <List size={16} style={{ color: t("accent") }} /> Lessons
                    </h2>
                    <p className="text-text-muted text-xs">
                      {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} in "{course?.title}"
                    </p>
                  </div>
                  <PermissionGuard permissions={["courses.lessons.manage"]}>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingLesson(null);
                        setLessonModalOpen(true);
                      }}
                    >
                      <Plus size={14} /> Add Lesson
                    </Button>
                  </PermissionGuard>
                </div>

                {lessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen size={48} className="text-text-muted mb-3" />
                    <p className="text-text-primary text-sm font-medium">No lessons yet</p>
                    <p className="text-text-muted mt-1 mb-4 text-xs">
                      Start building your course by adding the first lesson.
                    </p>
                    <PermissionGuard permissions={["courses.lessons.manage"]}>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingLesson(null);
                          setLessonModalOpen(true);
                        }}
                      >
                        <Plus size={14} /> Create First Lesson
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permissions={["courses.lessons.manage"]}>
                      <Button
                        variant="default"
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate(`/courses/${id}/builder`)}
                      >
                        <Network size={14} /> Or use the Course Builder
                      </Button>
                    </PermissionGuard>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="border-border flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-bg-surface-active text-text-secondary flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-text-primary text-sm font-semibold">
                              {lesson.title}
                            </h4>
                            {lesson.duration && (
                              <Badge variant="teal" className="mt-1 text-[10px]">
                                <Clock size={9} /> {lesson.duration}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <PermissionGuard permissions={["courses.lessons.manage"]}>
                          <div className="flex items-center gap-1">
                            <Button
                              size="xs"
                              variant="default"
                              onClick={() => {
                                setEditingLesson(lesson);
                                setLessonModalOpen(true);
                              }}
                            >
                              <Pencil size={10} /> Edit
                            </Button>
                            <Button
                              size="xs"
                              variant="default"
                              onClick={() => setDeleteModal({ open: true, lesson })}
                            >
                              <Trash2 size={10} /> Delete
                            </Button>
                          </div>
                        </PermissionGuard>
                      </div>
                    ))}
                  </div>
                )}
              </Paper>
            </div>

            <div className="col-span-2">
              <Paper className="p-6">
                <h3 className="text-text-primary mb-3 text-sm font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  <PermissionGuard permissions={["courses.lessons.manage"]}>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setEditingLesson(null);
                        setLessonModalOpen(true);
                      }}
                    >
                      <Plus size={14} /> Add New Lesson
                    </Button>
                  </PermissionGuard>
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full"
                    onClick={() => navigate(`/courses/${id}/builder`)}
                  >
                    <Network size={14} /> Open Builder
                  </Button>
                </div>
              </Paper>
            </div>
          </div>
        )}
      </DashboardLayout>

      <LessonForm
        open={lessonModalOpen}
        onClose={() => {
          setLessonModalOpen(false);
          setEditingLesson(null);
        }}
        onSubmit={handleLessonSubmit}
        initialData={editingLesson}
        loading={saving}
      />
      <DeleteModal
        open={deleteModal.open}
        onConfirm={handleDeleteLesson}
        onCancel={() => setDeleteModal({ open: false, lesson: null })}
        itemName={deleteModal.lesson?.title}
        itemType="lesson"
        loading={saving}
      />
    </>
  );
};

export default CourseLessons;
