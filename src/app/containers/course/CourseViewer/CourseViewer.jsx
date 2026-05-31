import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, Loader, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCourseById, fetchLessons } from "@/app/services/courseService";
import { fetchAutosave } from "@/app/services/blockService";
import { t } from "@/styles/theme";
import { useTheme as useThemeContext } from "@/app/context/ThemeContext";
import { useCreateBlockNote, BlockNoteViewRaw as BlockNoteView } from "@blocknote/react";
import "@blocknote/react/style.css";

const PARA_PROPS = { textAlignment: "left", backgroundColor: "default", textColor: "default" };

const toInlineContent = (content) => {
  if (!content) return [];
  if (Array.isArray(content))
    return content
      .filter((c) => c && c.type)
      .map((c) =>
        c.type === "text" ? { type: "text", text: c.text || "", styles: c.styles || {} } : c
      );
  if (typeof content === "string" && content.trim())
    return [{ type: "text", text: content, styles: {} }];
  if (typeof content === "object" && content.text)
    return [{ type: "text", text: content.text, styles: content.styles || {} }];
  return [];
};

const sanitizeBlocks = (content) => {
  if (!content) return [];
  let parsed;
  try {
    parsed = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    return typeof content === "string" && content.trim()
      ? [
          {
            type: "paragraph",
            props: { ...PARA_PROPS },
            content: [{ type: "text", text: content, styles: {} }],
            children: [],
          },
        ]
      : [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((b) => b && b.type)
    .map((b) => ({
      type: b.type,
      props: b.props || { ...PARA_PROPS },
      content: toInlineContent(b.content),
      children: Array.isArray(b.children) ? sanitizeBlocks(b.children) : [],
    }));
};

const CourseViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { resolvedTheme: theme } = useThemeContext();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonContents, setLessonContents] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      setCourse(c);
      const sorted = (l || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setLessons(sorted);
      const contents = {};
      await Promise.all(
        (l || []).map(async (lesson) => {
          try {
            const autosave = await fetchAutosave(lesson.id);
            if (autosave?.snapshot) {
              const snap = JSON.parse(autosave.snapshot);
              const raw = Array.isArray(snap)
                ? snap
                : snap.content
                  ? typeof snap.content === "string"
                    ? snap.content
                    : JSON.stringify(snap.content)
                  : snap;
              contents[lesson.id] = raw;
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
    } catch (err) {
      setError(err.message || "Failed to load course.");
    } finally {
      setLoading(false);
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
  const sanitizedBlocks = sanitizeBlocks(activeContent);

  const editor = useCreateBlockNote();
  useEffect(() => {
    if (!editor) return;
    if (sanitizedBlocks.length > 0) {
      try {
        editor.replaceBlocks(editor.document, sanitizedBlocks);
      } catch {
        /* ignore */
      }
    } else {
      try {
        editor.replaceBlocks(editor.document, []);
      } catch {
        /* ignore */
      }
    }
  }, [activeLesson?.id, editor]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="text-text-muted animate-spin" size={20} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <p style={{ color: "var(--error)" }}>{error}</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Top bar */}
      <div className="border-border bg-bg-surface flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <div className="text-text-muted flex items-center gap-1 text-xs">
          <button
            onClick={() => navigate("/courses")}
            className="text-primary cursor-pointer hover:underline"
          >
            Courses
          </button>
          <ChevronRight size={12} />
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="text-primary cursor-pointer hover:underline"
          >
            {course?.title}
          </button>
          <ChevronRight size={12} />
          <span>{activeLesson?.title || "Preview"}</span>
        </div>
        <span className="text-text-muted ml-auto text-sm">
          Lesson {activeIndex + 1} of {lessons.length}
        </span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Lesson content area */}
        <main
          className="flex flex-1 justify-center overflow-y-auto p-8"
          style={{ background: t("bg-secondary") }}
        >
          <div
            className="min-h-[500px] w-full max-w-3xl rounded-xl p-12"
            style={{ background: t("bg-surface"), boxShadow: t("shadow-md") }}
          >
            <div className="mb-7 border-b pb-5" style={{ borderColor: t("border-secondary") }}>
              <p
                className="mb-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Lesson {activeIndex + 1}
              </p>
              <h2 className="text-text-primary m-0 text-xl leading-tight font-semibold">
                {activeLesson?.title || "Untitled Lesson"}
              </h2>
            </div>

            {editor && sanitizedBlocks.length > 0 ? (
              <div style={{ minHeight: 200 }}>
                <BlockNoteView editor={editor} editable={false} theme={theme} />
              </div>
            ) : (
              <div className="text-text-muted flex min-h-[200px] items-center justify-center">
                <BookOpen size={32} className="mr-3 opacity-30" />
                This lesson has no content yet.
              </div>
            )}

            <div
              className="mt-10 flex items-center justify-between border-t pt-5"
              style={{ borderColor: t("border-secondary") }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToLesson(activeIndex - 1)}
                disabled={activeIndex === 0}
              >
                <ArrowLeft size={14} /> Previous
              </Button>
              <span className="text-text-muted text-xs">
                {activeIndex + 1} / {lessons.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToLesson(activeIndex + 1)}
                disabled={activeIndex >= lessons.length - 1}
              >
                Next <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </main>

        {/* Right sidebar — lesson outline */}
        <aside
          className="border-border flex w-72 shrink-0 flex-col overflow-hidden border-l"
          style={{ background: t("bg-surface") }}
        >
          <div
            className="border-border shrink-0 border-b px-4 pt-4 pb-3"
            style={{ background: t("bg-secondary") }}
          >
            <p
              className="text-[10px] font-bold tracking-wider uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Lessons
            </p>
            <div className="bg-bg-surface-active mt-2 h-1 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{
                  width: `${lessons.length > 0 ? ((activeIndex + 1) / lessons.length) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-text-muted mt-1 text-xs">
              {activeIndex + 1} of {lessons.length} completed
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {lessons.map((lesson, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={lesson.id}
                  onClick={() => goToLesson(idx)}
                  className="cursor-pointer px-4 py-2.5 transition-colors"
                  style={{
                    background: isActive ? t("bg-surface-active") : "transparent",
                    borderLeft: isActive
                      ? `2px solid var(--text-primary)`
                      : "2px solid transparent",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-xs ${isActive ? "text-text-primary font-semibold" : "text-text-secondary"}`}
                    >
                      <span className="text-text-muted mr-1.5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {lesson.title || `Lesson ${idx + 1}`}
                    </span>
                    {idx < activeIndex && <Check size={12} className="text-success shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default CourseViewer;
