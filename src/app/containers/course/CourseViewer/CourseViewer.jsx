import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Loader, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { useTheme as useThemeContext } from "@/app/context/ThemeContext";
import { useToast } from "@/app/context/ToastContext";
import { fetchAutosave } from "@/app/services/blockService";
import { fetchCourseById, fetchLessons } from "@/app/services/courseService";
import {
  enrollInCourseAPI,
  getEnrollmentStatus,
  getCourseProgress,
  markLessonCompleteAPI,
} from "@/app/services/enrollmentService";
import { Button } from "@/components/ui/button";
import MeroEduEditor from "@/editor/Editor";
import { t } from "@/styles/theme";

/**
 * Shared reader layout for CourseViewer and CoursePreview.
 * Full-viewport reading experience with sidebar lesson list.
 */
export const ReaderLayout = ({
  course,
  lessons,
  activeIndex,
  onGoToLesson,
  onPrev,
  onNext,
  children,
  topBarRight,
  sidebar = true,
  enrollment,
  onMarkLessonComplete,
  onMarkCourseComplete,
  lessonCompletionStatus = {},
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const activeLesson = lessons[activeIndex];
  const isLessonCompleted = activeLesson ? lessonCompletionStatus[activeLesson.id] : false;
  const allLessonsCompleted = lessons.length > 0 && lessons.every((l) => lessonCompletionStatus[l.id]);
  const isCourseCompleted = enrollment?.status === "completed";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 48,
          minHeight: 48,
          background: t("bg-surface"),
          borderBottom: `1px solid ${t("border-primary")}`,
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        <div className="text-text-muted flex items-center gap-1 text-xs" style={{ flex: 1, minWidth: 0 }}>
          <button onClick={() => navigate("/courses")} className="text-primary cursor-pointer hover:underline">Courses</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(`/courses/${id}`)} className="text-primary cursor-pointer hover:underline truncate" style={{ maxWidth: 200 }}>
            {course?.title}
          </button>
          <ChevronRight size={12} />
          <span className="truncate">{activeLesson?.title || "Reading"}</span>
        </div>

        {/* Lesson completion button */}
        {enrollment && activeLesson && !isLessonCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkLessonComplete?.(activeLesson.id)}
            className="text-success hover:text-success hover:bg-success/10"
            title="Mark this lesson as complete"
          >
            <Check size={14} /> Mark Complete
          </Button>
        )}

        {/* Course completion button */}
        {enrollment && allLessonsCompleted && !isCourseCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkCourseComplete?.()}
            className="text-accent hover:text-accent hover:bg-accent/10"
            title="Complete the course"
          >
            <Trophy size={14} /> Complete Course
          </Button>
        )}

        {/* Completed badge */}
        {isCourseCompleted && (
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
            <Trophy size={10} /> Completed
          </span>
        )}

        <span className="text-text-muted text-xs flex-shrink-0">
          Lesson {activeIndex + 1} of {lessons.length}
        </span>
        {topBarRight}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        {sidebar && (
          <aside
            style={{
              width: 260,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: t("bg-surface"),
              borderRight: `1px solid ${t("border-primary")}`,
            }}
          >
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t("border-primary")}`, background: t("bg-secondary") }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: t("text-muted"), marginBottom: 6 }}>
                Lessons
              </p>
              <div className="bg-bg-surface-active h-1 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${lessons.length > 0 ? ((activeIndex + 1) / lessons.length) * 100 : 0}%` }}
                />
              </div>
              <p className="text-text-muted mt-1 text-[11px]">{activeIndex + 1} of {lessons.length}</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
              {lessons.map((lesson, idx) => {
                const isActive = idx === activeIndex;
                const isCompleted = lessonCompletionStatus[lesson.id];
                return (
                  <div
                    key={lesson.id}
                    onClick={() => onGoToLesson(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      marginBottom: 2,
                      background: isActive ? t("bg-surface-active") : "transparent",
                      borderLeft: isActive ? `2px solid ${t("text-primary")}` : "2px solid transparent",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                        background: isCompleted ? "#22C55E" : isActive ? t("text-primary") : t("bg-hover"),
                        color: isCompleted ? "#fff" : isActive ? t("bg-surface") : t("text-muted"),
                      }}
                    >
                      {isCompleted ? <Check size={12} /> : idx + 1}
                    </span>
                    <span className={`truncate text-xs ${isActive ? "text-text-primary font-semibold" : "text-text-secondary"}`}>
                      {lesson.title || `Lesson ${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Content area */}
        <main style={{ flex: 1, overflowY: "auto", background: t("bg-secondary"), display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * CourseViewer — full-viewport lesson reader with enrollment & completion tracking.
 */
const CourseViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { resolvedTheme: theme } = useThemeContext();
  const { addToast } = useToast();
  const user = useSelector((s) => s.auth.user);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonContents, setLessonContents] = useState({});

  // Enrollment state
  const [enrollment, setEnrollment] = useState(null);
  const [lessonCompletionStatus, setLessonCompletionStatus] = useState({});
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      setCourse(c);
      const sorted = (l || []).sort((a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0));
      setLessons(sorted);
      const contents = {};
      await Promise.all(
        (l || []).map(async (lesson) => {
          try {
            const autosave = await fetchAutosave(lesson.id);
            if (autosave?.snapshot) {
              const snap = JSON.parse(autosave.snapshot);
              const raw = Array.isArray(snap) ? snap : snap.content ? (typeof snap.content === "string" ? JSON.parse(snap.content) : snap.content) : snap;
              contents[lesson.id] = raw;
              return;
            }
          } catch { /* ignore */ }
          if (lesson.content) contents[lesson.id] = typeof lesson.content === "string" ? lesson.content : JSON.stringify(lesson.content);
        })
      );
      setLessonContents(contents);

      // Load enrollment status
      if (user?.id) {
        await loadEnrollmentStatus();
      }
    } catch (err) {
      // If 401, redirect to login
      if (err?.status === 401 || err?.status === 403) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
        return;
      }
      setError(err.message || "Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollmentStatus = async () => {
    try {
      const status = await getEnrollmentStatus(id);
      if (status) {
        setEnrollment(status);
        // Fetch progress to get completed lesson count
        try {
          const progress = await getCourseProgress(id);
          if (progress) {
            setEnrollment(progress);
            // Build lesson completion status from progress percentage
            const completedCount = progress.progressPercent
              ? Math.round((progress.progressPercent / 100) * lessons.length)
              : 0;
            const newStatus = {};
            lessons.forEach((lesson, idx) => {
              if (idx < completedCount) newStatus[lesson.id] = true;
            });
            setLessonCompletionStatus(newStatus);
          }
        } catch {
          /* progress fetch failed — ok */
        }
      }
    } catch (err) {
      // 401/403 will be handled by loadData's catch block
      // 404 = not enrolled (ok)
      if (err?.status === 401 || err?.status === 403) {
        throw err;
      }
      /* not enrolled or other error — that's ok */
    }
  };

  const handleEnroll = async () => {
    if (!user?.id) {
      addToast("Please log in to enroll in this course.", "error");
      return;
    }
    setEnrolling(true);
    try {
      const result = await enrollInCourseAPI(id);
      setEnrollment(result);
      addToast("Successfully enrolled in this course!", "success");
    } catch (err) {
      addToast(err.message || "Failed to enroll.", "error");
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkLessonComplete = async (lessonId) => {
    if (!user?.id) {
      addToast("Please log in to track progress.", "error");
      return;
    }
    // Auto-enroll if not enrolled
    if (!enrollment) {
      try {
        const result = await enrollInCourseAPI(id);
        setEnrollment(result);
      } catch (err) {
        addToast(err.message || "Failed to enroll.", "error");
        return;
      }
    }
    try {
      await markLessonCompleteAPI(lessonId);
      setLessonCompletionStatus((prev) => ({ ...prev, [lessonId]: true }));
      addToast("Lesson marked as complete!", "success");
      // Refresh progress
      await loadEnrollmentStatus();
    } catch (err) {
      addToast(err.message || "Failed to mark lesson complete.", "error");
    }
  };

  const handleMarkCourseComplete = async () => {
    if (!user?.id) return;
    // Mark all remaining lessons as complete
    try {
      for (const lesson of lessons) {
        if (!lessonCompletionStatus[lesson.id]) {
          await markLessonCompleteAPI(lesson.id);
          setLessonCompletionStatus((prev) => ({ ...prev, [lesson.id]: true }));
        }
      }
      addToast("Congratulations! You've completed this course!", "success");
      await loadEnrollmentStatus();
    } catch (err) {
      addToast(err.message || "Failed to complete course.", "error");
    }
  };

  const goToLesson = useCallback((idx) => { if (idx >= 0 && idx < lessons.length) setActiveIndex(idx); }, [lessons.length]);
  const goToPrev = useCallback(() => goToLesson(activeIndex - 1), [activeIndex, goToLesson]);
  const goToNext = useCallback(() => goToLesson(activeIndex + 1), [activeIndex, goToLesson]);

  const activeLesson = lessons[activeIndex];
  const activeContent = activeLesson ? lessonContents[activeLesson.id] : null;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <Loader className="text-text-muted animate-spin" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p style={{ color: "var(--error)" }}>{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p style={{ color: "var(--text-muted)" }}>Course not found.</p>
      </div>
    );
  }

  // Not enrolled — show enroll prompt
  if (!enrollment) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: t("bg-secondary") }}>
        <div style={{ background: t("bg-surface"), borderRadius: 12, padding: 40, textAlign: "center", maxWidth: 420, boxShadow: t("shadow-md") }}>
          <BookOpen size={48} style={{ color: t("text-muted"), marginBottom: 16 }} />
          <h2 style={{ color: t("text-primary"), margin: "0 0 8px" }}>{course.title}</h2>
          <p style={{ color: t("text-muted"), fontSize: 14, marginBottom: 24 }}>
            Enroll in this course to track your progress and mark lessons as complete.
          </p>
          <Button onClick={handleEnroll} disabled={enrolling} size="lg">
            {enrolling ? <Loader size={14} className="animate-spin mr-2" /> : null}
            {enrolling ? "Enrolling…" : "Enroll Now"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ReaderLayout
      course={course}
      lessons={lessons}
      activeIndex={activeIndex}
      onGoToLesson={goToLesson}
      onPrev={goToPrev}
      onNext={goToNext}
      enrollment={enrollment}
      onMarkLessonComplete={handleMarkLessonComplete}
      onMarkCourseComplete={handleMarkCourseComplete}
      lessonCompletionStatus={lessonCompletionStatus}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 900, width: "100%", margin: "0 auto", padding: "32px 40px" }}>
        {/* Lesson header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${t("border-secondary")}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>
            Lesson {activeIndex + 1}
          </p>
          <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 }}>
            {activeLesson?.title || "Untitled Lesson"}
          </h2>
        </div>

        {/* Content */}
        {activeContent ? (
          <div style={{ flex: 1 }}>
            <MeroEduEditor initialContent={activeContent} editable={false} showToolbar={false} />
          </div>
        ) : (
          <div className="text-text-muted flex flex-1 items-center justify-center" style={{ minHeight: 300 }}>
            <BookOpen size={32} style={{ opacity: 0.3, marginRight: 12 }} />
            <span>This lesson has no content yet.</span>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 16, borderTop: `1px solid ${t("border-secondary")}`, flexShrink: 0 }}>
          <Button variant="ghost" size="sm" onClick={goToPrev} disabled={activeIndex === 0}>
            <ArrowLeft size={14} /> Previous
          </Button>
          <span className="text-text-muted text-xs">{activeIndex + 1} / {lessons.length}</span>
          <Button variant="ghost" size="sm" onClick={goToNext} disabled={activeIndex >= lessons.length - 1}>
            Next <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </ReaderLayout>
  );
};

export default CourseViewer;
