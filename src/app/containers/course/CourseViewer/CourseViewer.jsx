import { ArrowLeft, ArrowRight, BookOpen, Loader } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { useToast } from "@/app/context/ToastContext";
import CourseCompletionCelebration from "@/components/CourseCompletionCelebration";
import { Badge } from "@/components/ui/badge";
import { useCourse, useCourseLessons } from "@/hooks/queries/useCourses";
import {
  useEnrollmentStatus,
  useCourseProgress,
  useMyLessonCompletions,
  useEnrollInCourse,
  useMarkLessonComplete,
} from "@/hooks/queries/useEnrollments";
import { hasPermission } from "@/app/services/authService";
import { ReaderLayout } from "@/components/layouts/ReaderLayout";
import MeroEduEditor from "@/editor/Editor";
import { loadLessonDoc } from "@/editor/utils/lessonContent";
import { usePageTitle } from "@/hooks";
import { t } from "@/styles/theme";

const CourseViewer = () => {
  usePageTitle("Course Viewer");
  const { id } = useParams();
  const { addToast } = useToast();
  const user = useSelector((s) => s.auth.user);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lessonContents, setLessonContents] = useState({});
  const lessonContentsRef = useRef({});
  const [lessonCompletionStatus, setLessonCompletionStatus] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const hasCelebratedRef = useRef(false);

  // TanStack Query hooks
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(id);
  const { data: lessons = [], isLoading: lessonsLoading } = useCourseLessons(id);
  const { data: enrollment } = useEnrollmentStatus(id, { enabled: !!user?.id });
  const { data: progress } = useCourseProgress(id, { enabled: !!user?.id });
  const { data: completions = [] } = useMyLessonCompletions(id, { enabled: !!user?.id });

  const enrollMutation = useEnrollInCourse();
  const markCompleteMutation = useMarkLessonComplete(id);

  const loading = courseLoading || lessonsLoading;
  const error = courseError?.message;

  // Sort lessons by order
  const sortedLessons = [...lessons].sort(
    (a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0)
  );

  // Build completion status from completions data
  useEffect(() => {
    if (completions.length > 0) {
      const newStatus = {};
      completions.forEach((c) => {
        newStatus[c.lessonId] = true;
      });
      setLessonCompletionStatus(newStatus);
    }
  }, [completions]);

  // Set initial active lesson to first incomplete
  useEffect(() => {
    if (sortedLessons.length > 0) {
      const firstIncomplete = sortedLessons.findIndex((ls) => !lessonCompletionStatus[ls.id]);
      setActiveIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    }
  }, [sortedLessons, lessonCompletionStatus]);

  // Lazy-load lesson content on demand, cached in a ref to avoid refetching.
  const ensureLessonContent = useCallback(async (lesson) => {
    const lid = lesson?.id;
    if (!lid || lessonContentsRef.current[lid] !== undefined) return;
    const doc = await loadLessonDoc(lid);
    let value = "";
    const hasContent = Array.isArray(doc) ? doc.length > 0 : (doc?.content?.length || 0) > 0;
    if (hasContent) {
      value = typeof doc === "string" ? doc : JSON.stringify(doc);
    } else if (lesson.content) {
      value = typeof lesson.content === "string" ? lesson.content : JSON.stringify(lesson.content);
    }
    lessonContentsRef.current[lid] = value;
    setLessonContents((prev) => ({ ...prev, [lid]: value }));
  }, []);

  const handleEnroll = async () => {
    if (!user?.id) {
      addToast("Please log in to enroll.", "error");
      return;
    }
    try {
      await enrollMutation.mutateAsync(id);
      addToast("Successfully enrolled!", "success");
    } catch (err) {
      addToast(err.message || "Failed to enroll.", "error");
    }
  };

  const handleMarkLessonComplete = async (lessonId) => {
    if (!user?.id) {
      addToast("Please log in.", "error");
      return;
    }
    if (!enrollment) {
      try {
        await enrollMutation.mutateAsync(id);
      } catch (err) {
        addToast(err.message || "Failed to enroll.", "error");
        return;
      }
    }
    try {
      await markCompleteMutation.mutateAsync({ lessonId, timeSpentSeconds: 0 });
      setLessonCompletionStatus((prev) => ({ ...prev, [lessonId]: true }));
      addToast("Lesson marked complete!", "success");
    } catch (err) {
      addToast(err.message || "Failed.", "error");
    }
  };

  const handleMarkCourseComplete = async () => {
    if (!user?.id) return;
    const remaining = sortedLessons.filter((lesson) => !lessonCompletionStatus[lesson.id]);
    if (remaining.length === 0) return;
    try {
      await Promise.all(
        remaining.map((lesson) =>
          markCompleteMutation.mutateAsync({ lessonId: lesson.id, timeSpentSeconds: 0 })
        )
      );
      setLessonCompletionStatus((prev) => {
        const next = { ...prev };
        remaining.forEach((lesson) => {
          next[lesson.id] = true;
        });
        return next;
      });
      addToast("Congratulations! Course completed!", "success");
    } catch (err) {
      addToast(err.message || "Failed.", "error");
    }
  };

  const goToLesson = useCallback(
    (idx) => {
      if (idx >= 0 && idx < sortedLessons.length) setActiveIndex(idx);
    },
    [sortedLessons.length]
  );

  const activeLesson = sortedLessons[activeIndex];
  const activeContent = activeLesson ? lessonContents[activeLesson.id] : null;

  // Keyboard navigation: left/right arrows to move between lessons
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture when typing in inputs/textareas
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.target.isContentEditable) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (activeIndex < sortedLessons.length - 1) goToLesson(activeIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeIndex > 0) goToLesson(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, sortedLessons.length, goToLesson]);

  // Load content for the active lesson and prefetch the next one
  useEffect(() => {
    const current = sortedLessons[activeIndex];
    if (current) ensureLessonContent(current);
    const next = sortedLessons[activeIndex + 1];
    if (next) ensureLessonContent(next);
  }, [activeIndex, sortedLessons, ensureLessonContent]);

  // Auto-mark current lesson complete when user navigates to it
  useEffect(() => {
    if (!user?.id || !enrollment) return;
    const lesson = sortedLessons[activeIndex];
    if (!lesson || lessonCompletionStatus[lesson.id]) return;
    // Mark lesson complete (best-effort; ignore errors silently)
    markCompleteMutation
      .mutate({ lessonId: lesson.id, timeSpentSeconds: 0 })
      .then(() => {
        setLessonCompletionStatus((prev) => ({ ...prev, [lesson.id]: true }));
      })
      .catch(() => {});
  }, [
    activeIndex,
    sortedLessons,
    enrollment,
    user?.id,
    markCompleteMutation,
    lessonCompletionStatus,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-mark course complete when all lessons are done
  useEffect(() => {
    if (!user?.id || !enrollment || sortedLessons.length === 0) return;
    const allDone = sortedLessons.every((l) => lessonCompletionStatus[l.id]);
    if (!allDone) return;
    // Mark any remaining lessons complete, then reload enrollment
    const remaining = sortedLessons.filter((l) => !lessonCompletionStatus[l.id]);
    if (remaining.length > 0) {
      Promise.all(
        remaining.map((l) =>
          markCompleteMutation.mutateAsync({ lessonId: l.id, timeSpentSeconds: 0 })
        )
      )
        .then(() => {
          setLessonCompletionStatus((prev) => {
            const next = { ...prev };
            remaining.forEach((l) => {
              next[l.id] = true;
            });
            return next;
          });
          addToast("Congratulations! Course completed!", "success");
        })
        .catch(() => {});
    }
    // Show celebration once
    if (!hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      setShowCelebration(true);
    }
  }, [lessonCompletionStatus, sortedLessons, enrollment, user?.id, markCompleteMutation]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}
      >
        <Loader className="text-text-muted animate-spin" size={24} />
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}
      >
        <p style={{ color: "var(--error)" }}>{error}</p>
      </div>
    );
  }
  if (!course) {
    return (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}
      >
        <p>Course not found.</p>
      </div>
    );
  }

  // Determine if course is enrollable
  const isPublished = course.status === "published";
  const isAdmin = hasPermission(user, "courses.publish"); // admin/instructor can see all

  // Not enrolled — show enroll prompt (only for published courses, or admins)
  if (!enrollment) {
    // Draft/archived: show info message instead of enroll button (unless admin)
    if (!isPublished && !isAdmin) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: t("bg-secondary"),
          }}
        >
          <div
            style={{
              background: t("bg-surface"),
              borderRadius: 12,
              padding: 40,
              textAlign: "center",
              maxWidth: 420,
              boxShadow: t("shadow-md"),
            }}
          >
            <BookOpen size={48} style={{ color: t("text-muted"), marginBottom: 16 }} />
            <h2 style={{ color: t("text-primary"), margin: "0 0 8px" }}>{course.title}</h2>
            <p style={{ color: t("text-muted"), fontSize: 14, marginBottom: 8 }}>
              {course.status === "draft"
                ? "This course is not yet available. It is currently being prepared."
                : "This course is no longer available for enrollment."}
            </p>
            <Badge variant={course.status === "draft" ? "gray" : "orange"}>
              {course.status === "draft" ? "Draft" : "Archived"}
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: t("bg-secondary"),
        }}
      >
        <div
          style={{
            background: t("bg-surface"),
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            maxWidth: 420,
            boxShadow: t("shadow-md"),
          }}
        >
          <BookOpen size={48} style={{ color: t("text-muted"), marginBottom: 16 }} />
          <h2 style={{ color: t("text-primary"), margin: "0 0 8px" }}>{course.title}</h2>
          <p style={{ color: t("text-muted"), fontSize: 14, marginBottom: 24 }}>
            Enroll to track your progress and mark lessons complete.
          </p>
          <button
            onClick={handleEnroll}
            disabled={enrollMutation.isPending || !isPublished}
            className="bg-primary hover:bg-primary-hover text-secondary rounded-md px-6 py-2 text-sm font-medium disabled:opacity-50"
          >
            {enrollMutation.isPending
              ? "Enrolling…"
              : !isPublished
                ? "Enrollment Closed"
                : "Enroll Now"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReaderLayout
        course={course}
        lessons={sortedLessons}
        activeIndex={activeIndex}
        onGoToLesson={goToLesson}
        enrollment={enrollment}
        onMarkLessonComplete={handleMarkLessonComplete}
        onMarkCourseComplete={handleMarkCourseComplete}
        lessonCompletionStatus={lessonCompletionStatus}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            margin: "0 auto",
            padding: "32px 40px",
          }}
        >
          <div
            style={{
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: `1px solid ${t("border-secondary")}`,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Lesson {activeIndex + 1}
            </p>
            <h2
              style={{
                color: "var(--text-primary)",
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {activeLesson?.title || "Untitled Lesson"}
            </h2>
          </div>

          {activeContent ? (
            <div style={{ flex: 1 }}>
              <MeroEduEditor
                initialContent={activeContent}
                editable={false}
                showToolbar={false}
                lessonId={activeLesson?.id}
              />
            </div>
          ) : (
            <div
              className="text-text-muted flex flex-1 items-center justify-center"
              style={{ minHeight: 300 }}
            >
              <BookOpen size={32} style={{ opacity: 0.3, marginRight: 12 }} />
              <span>This lesson has no content yet.</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 32,
              paddingTop: 16,
              borderTop: `1px solid ${t("border-secondary")}`,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => goToLesson(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="text-text-secondary hover:bg-bg-surface-hover flex items-center gap-1 rounded-md px-3 py-1.5 text-xs disabled:opacity-50"
            >
              <ArrowLeft size={14} /> Previous
            </button>
            <span className="text-text-muted text-xs">
              {activeIndex + 1} / {lessons.length}
            </span>
            <button
              onClick={() => goToLesson(activeIndex + 1)}
              disabled={activeIndex >= lessons.length - 1}
              className="text-text-secondary hover:bg-bg-surface-hover flex items-center gap-1 rounded-md px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </ReaderLayout>
      {showCelebration && (
        <CourseCompletionCelebration
          courseTitle={course?.title}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </>
  );
};

export default CourseViewer;
