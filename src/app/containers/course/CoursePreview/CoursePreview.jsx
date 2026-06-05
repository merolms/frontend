import { ArrowLeft, ArrowRight, BookOpen, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SideBar from "@/app/containers/SideBar/SideBar";
import { fetchAutosave, fetchLessonBlocks } from "@/app/services/blockService";
import { fetchCourseById, fetchLessons } from "@/app/services/courseService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MeroEduEditor from "@/editor/Editor";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import { t } from "@/styles/theme";

import { ReaderLayout } from "@/components/layouts/ReaderLayout";

const CoursePreview = () => {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLessonContent = useCallback(async (lesson) => {
    try {
      const autosave = await fetchAutosave(lesson.id);
      if (autosave?.snapshot) {
        const snap = JSON.parse(autosave.snapshot);

        return Array.isArray(snap)
          ? snap
          : snap.content
            ? typeof snap.content === "string"
              ? JSON.parse(snap.content)
              : snap.content
            : [snap];
      }
    } catch {
      /* ignore */
      console.error("Failed to load autosave for lesson", lesson.id);
    }
    try {
      const blocks = await fetchLessonBlocks(lesson.id);
      if (blocks.length > 0) return blocks;
    } catch {
      /* ignore */
    }
    return [];
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
        setCourse(c);
        const sorted = (l || []).sort(
          (a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0)
        );
        setLessons(sorted);
        if (sorted.length > 0) {
          const target = lessonId
            ? sorted.find((x) => String(x.id) === String(lessonId)) || sorted[0]
            : sorted[0];
          const content = await loadLessonContent(target);
          console.log("Loaded content for lesson", target.id, content);
          setSelectedLesson({ ...target, _content: content });
        }
      } catch (err) {
        setError(err.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, lessonId, loadLessonContent]);

  const handleSelectLesson = useCallback(
    async (idx) => {
      const lesson = lessons[idx];
      if (!lesson || lesson.id === selectedLesson?.id) return;
      navigate(`/courses/${id}/preview/${lesson.id}`, { replace: true });
      const content = await loadLessonContent(lesson);
      setSelectedLesson({ ...lesson, _content: content });
    },
    [id, lessons, selectedLesson, navigate, loadLessonContent]
  );

  const lessonIndex = selectedLesson ? lessons.findIndex((l) => l.id === selectedLesson.id) : -1;

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

  if (error) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <div style={{ flex: 1, padding: 24 }}>
          <p style={{ color: "var(--error)" }}>{error}</p>
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
                  initialContent={selectedLesson._content.content}
                  editable={false}
                  showToolbar={false}
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
