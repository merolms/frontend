import { ArrowLeft, ArrowRight, BookOpen, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import SideBar from "@/app/containers/SideBar/SideBar";
import { ReaderLayout } from "@/components/layouts/ReaderLayout";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import MeroEduEditor from "@/editor/Editor";
import { loadLessonDoc } from "@/editor/utils/lessonContent";
import { usePageTitle } from "@/hooks";
import { useCourse, useCourseLessons } from "@/hooks/queries/useCourses";
import { t } from "@/styles/theme";

const CoursePreview = () => {
  usePageTitle("Course Preview");
  const navigate = useNavigate();
  const { id, lessonId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [error, setError] = useState(null);

  // ─── TanStack Query: replaces Promise.all + manual state ───
  const { data: courseData, isLoading: courseLoading, error: courseError } = useCourse(id);
  const { data: lessonsData = [], isLoading: lessonsLoading } = useCourseLessons(id);
  const loading = courseLoading || lessonsLoading;

  const loadLessonContent = useCallback((lesson) => loadLessonDoc(lesson.id), []);

  // Sync course data
  useEffect(() => {
    if (courseData) setCourse(courseData);
  }, [courseData]);

  // Load lessons and select initial lesson when data arrives
  useEffect(() => {
    if (!lessonsData.length) return;
    try {
      const sorted = [...lessonsData].sort(
        (a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0)
      );
      setLessons(sorted);

      if (sorted.length > 0) {
        const target = lessonId
          ? sorted.find((x) => String(x.id) === String(lessonId)) || sorted[0]
          : sorted[0];
        loadLessonContent(target).then((doc) => {
          const hasContent = Array.isArray(doc) ? doc.length > 0 : (doc?.content?.length || 0) > 0;
          const content = hasContent ? JSON.stringify(doc) : "";
          setSelectedLesson({ ...target, _content: content });
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load course.");
    }
  }, [lessonsData, lessonId, loadLessonContent]);

  const displayError = courseError?.message || error;

  const handleSelectLesson = useCallback(
    async (idx) => {
      const lesson = lessons[idx];
      if (!lesson || lesson.id === selectedLesson?.id) return;
      navigate(`/courses/${id}/preview/${lesson.id}`, { replace: true });
      const content = await loadLessonContent(lesson);
      const hasContent = Array.isArray(content)
        ? content.length > 0
        : (content?.content?.length || 0) > 0;
      setSelectedLesson({ ...lesson, _content: hasContent ? JSON.stringify(content) : "" });
    },
    [id, lessons, selectedLesson, navigate, loadLessonContent]
  );

  const lessonIndex = selectedLesson ? lessons.findIndex((l) => l.id === selectedLesson.id) : -1;

  // Keyboard navigation: left/right arrows to move between lessons
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.target.isContentEditable) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (lessonIndex < lessons.length - 1) handleSelectLesson(lessonIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (lessonIndex > 0) handleSelectLesson(lessonIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lessonIndex, lessons.length, handleSelectLesson]);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: t("bg-secondary"),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Skeleton className="h-8 w-48" />
            <span style={{ color: t("text-muted"), fontSize: 14 }}>Loading preview…</span>
          </div>
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <div style={{ flex: 1, padding: 24 }}>
          <p style={{ color: "var(--error)" }}>{displayError}</p>
        </div>
      </div>
    );
  }

  const topBarRight = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <ThemeSwitcher />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/courses/${id}/builder/${selectedLesson?.id || lessonId || ""}`)}
      >
        <Pencil size={14} /> Edit
      </Button>
    </div>
  );
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SideBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ReaderLayout
          course={course}
          lessons={lessons}
          activeIndex={Math.max(0, lessonIndex)}
          onGoToLesson={handleSelectLesson}
          topBarRight={topBarRight}
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
                Lesson {lessonIndex >= 0 ? lessonIndex + 1 : 1}
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
                {selectedLesson?.title || "Untitled Lesson"}
              </h2>
            </div>

            {selectedLesson?._content ? (
              <div style={{ flex: 1, marginLeft: "-35px" }}>
                <MeroEduEditor
                  initialContent={selectedLesson._content}
                  editable={false}
                  showToolbar={false}
                  lessonId={selectedLesson?.id}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectLesson(lessonIndex - 1)}
                disabled={lessonIndex <= 0}
              >
                <ArrowLeft size={14} /> Previous
              </Button>
              <span className="text-text-muted text-xs">
                {lessonIndex + 1} / {lessons.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectLesson(lessonIndex + 1)}
                disabled={lessonIndex < 0 || lessonIndex >= lessons.length - 1}
              >
                Next <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </ReaderLayout>
      </div>
    </div>
  );
};

export default CoursePreview;
