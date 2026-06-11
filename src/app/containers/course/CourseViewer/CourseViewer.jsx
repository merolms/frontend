import { ArrowLeft, ArrowRight, BookOpen, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { useToast } from "@/app/context/ToastContext";
import { fetchAutosave } from "@/app/services/blockService";
import { fetchCourseById, fetchLessons } from "@/app/services/courseService";
import {
  enrollInCourseAPI,
  getCourseProgress,
  getEnrollmentStatus,
  getMyLessonCompletions,
  markLessonCompleteAPI,
} from "@/app/services/enrollmentService";
import { ReaderLayout } from "@/components/layouts/ReaderLayout";
import MeroEduEditor from "@/editor/Editor";
import { usePageTitle } from "@/hooks";
import { t } from "@/styles/theme";

const CourseViewer = () => {
  usePageTitle("Course Viewer");
  const { id } = useParams();
  const { addToast } = useToast();
  const user = useSelector((s) => s.auth.user);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonContents, setLessonContents] = useState({});
  const [enrollment, setEnrollment] = useState(null);
  const [lessonCompletionStatus, setLessonCompletionStatus] = useState({});
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      setCourse(c);
      const sorted = (l || []).sort(
        (a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0)
      );
      setLessons(sorted);

      // Load lesson contents
      const contents = {};
      await Promise.all(
        (l || []).map(async (lesson) => {
          try {
            const autosave = await fetchAutosave(lesson.id);
            if (autosave?.snapshot) {
              const snap = JSON.parse(autosave.snapshot);
              contents[lesson.id] = Array.isArray(snap)
                ? snap
                : snap.content
                  ? typeof snap.content === "string"
                    ? JSON.parse(snap.content)
                    : snap.content
                  : snap;
              return;
            }
          } catch {
            /* ignore */
          }
          if (lesson.content)
            contents[lesson.id] =
              typeof lesson.content === "string" ? lesson.content : JSON.stringify(lesson.content);
        })
      );
      setLessonContents(contents);

      // Load enrollment
      if (user?.id) await loadEnrollment();
    } catch (err) {
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

  const loadEnrollment = async () => {
    try {
      const status = await getEnrollmentStatus(id);
      if (status) {
        setEnrollment(status);
        try {
          const [progress, completions] = await Promise.all([
            getCourseProgress(id),
            getMyLessonCompletions(id),
          ]);
          if (progress) setEnrollment(progress);
          // Mark exactly the lessons the user completed, keyed by lesson id
          const newStatus = {};
          completions.forEach((c) => {
            newStatus[c.lessonId] = true;
          });
          setLessonCompletionStatus(newStatus);
        } catch {
          /* ok */
        }
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) throw err;
    }
  };

  const handleEnroll = async () => {
    if (!user?.id) {
      addToast("Please log in to enroll.", "error");
      return;
    }
    setEnrolling(true);
    try {
      const result = await enrollInCourseAPI(id);
      setEnrollment(result);
      addToast("Successfully enrolled!", "success");
    } catch (err) {
      addToast(err.message || "Failed to enroll.", "error");
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkLessonComplete = async (lessonId) => {
    if (!user?.id) {
      addToast("Please log in.", "error");
      return;
    }
    if (!enrollment) {
      try {
        setEnrollment(await enrollInCourseAPI(id));
      } catch (err) {
        addToast(err.message || "Failed to enroll.", "error");
        return;
      }
    }
    try {
      await markLessonCompleteAPI(lessonId);
      setLessonCompletionStatus((prev) => ({ ...prev, [lessonId]: true }));
      addToast("Lesson marked complete!", "success");
      await loadEnrollment();
    } catch (err) {
      addToast(err.message || "Failed.", "error");
    }
  };

  const handleMarkCourseComplete = async () => {
    if (!user?.id) return;
    try {
      for (const lesson of lessons) {
        if (!lessonCompletionStatus[lesson.id]) {
          await markLessonCompleteAPI(lesson.id);
          setLessonCompletionStatus((prev) => ({ ...prev, [lesson.id]: true }));
        }
      }
      addToast("Congratulations! Course completed!", "success");
      await loadEnrollment();
    } catch (err) {
      addToast(err.message || "Failed.", "error");
    }
  };

  const goToLesson = useCallback(
    (idx) => {
      if (idx >= 0 && idx < lessons.length) setActiveIndex(idx);
    },
    [lessons.length]
  );

  const activeLesson = lessons[activeIndex];
  const activeContent = activeLesson ? lessonContents[activeLesson.id] : null;

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

  // Not enrolled — show enroll prompt
  if (!enrollment) {
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
            disabled={enrolling}
            className="bg-primary hover:bg-primary-hover rounded-md px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {enrolling ? "Enrolling…" : "Enroll Now"}
          </button>
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
  );
};

export default CourseViewer;
