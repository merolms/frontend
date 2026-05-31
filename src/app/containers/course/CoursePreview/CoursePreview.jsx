import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Edit3, ChevronRight } from "lucide-react";
import { fetchCourseById, fetchLessons } from "@/app/services/courseService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/card";
import { fetchAutosave, fetchLessonBlocks } from "@/app/services/blockService";
import { t } from "@/styles/theme";
import { useTheme as useThemeContext } from "@/app/context/ThemeContext";
import "@blocknote/react/style.css";
import { BlockNoteViewRaw as BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import SideBar from "@/app/containers/SideBar/SideBar";

const PARA_PROPS = { textAlignment: "left", backgroundColor: "default", textColor: "default" };

const toInlineContent = (content) => {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content
      .filter((c) => c && c.type)
      .map((c) =>
        c.type === "text" ? { type: "text", text: c.text || "", styles: c.styles || {} } : c
      );
  }
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
    if (typeof content === "string" && content.trim())
      return [
        {
          type: "paragraph",
          props: { ...PARA_PROPS },
          content: [{ type: "text", text: content, styles: {} }],
          children: [],
        },
      ];
    return [];
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

const LessonPanel = ({ lessons = [], selectedLessonId, onSelectLesson, width = 280 }) => {
  return (
    <aside
      className="flex flex-col overflow-hidden"
      style={{
        width,
        flexShrink: 0,
        background: t("bg-sidebar"),
        borderRight: `1px solid ${t("border-primary")}`,
      }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-between px-4 py-3"
        style={{ background: t("bg-secondary"), borderBottom: `1px solid ${t("border-primary")}` }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} style={{ color: t("text-muted") }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: t("text-muted"),
            }}
          >
            Lessons
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px" }}>
        {lessons.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 12px",
              color: t("text-disabled"),
              fontSize: 12,
            }}
          >
            No lessons yet
          </div>
        )}
        {lessons.map((lesson, i) => {
          const isActive = selectedLessonId === lesson.id;
          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: t("radius-md"),
                cursor: "pointer",
                marginBottom: 2,
                background: isActive ? t("bg-active") : "transparent",
                borderLeft: isActive ? `2px solid ${t("text-primary")}` : "2px solid transparent",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = t("bg-hover");
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: isActive ? t("text-primary") : t("bg-hover"),
                  color: isActive ? t("bg-surface") : t("text-muted"),
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13,
                  color: isActive ? t("text-primary") : t("text-secondary"),
                  fontWeight: isActive ? 550 : 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {lesson.title || `Lesson ${i + 1}`}
              </span>
            </div>
          );
        })}
      </div>
      {lessons.length > 0 && (
        <div
          className="flex-shrink-0 px-4 py-2"
          style={{ borderTop: `1px solid ${t("border-primary")}`, background: t("bg-secondary") }}
        >
          <span style={{ fontSize: 10, color: t("text-disabled") }}>
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>
      )}
    </aside>
  );
};

const CoursePreview = () => {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();
  const { resolvedTheme: theme } = useThemeContext();

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
    }
    try {
      const blocks = await fetchLessonBlocks(lesson.id);
      if (blocks.length > 0)
        return blocks.map((b) => ({
          id: String(b.id || Math.random()),
          type: b.type || "paragraph",
          props: { ...PARA_PROPS },
          content: toInlineContent(b.content || b.data || b.title || ""),
          children: [],
        }));
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
        const sorted = (l || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setLessons(sorted);
        if (sorted.length > 0) {
          const target = lessonId
            ? sorted.find((x) => String(x.id) === String(lessonId)) || sorted[0]
            : sorted[0];
          const content = await loadLessonContent(target);
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
    async (lId) => {
      if (lId === selectedLesson?.id) return;
      const lesson = lessons.find((x) => x.id === lId);
      if (!lesson) return;
      navigate(`/courses/${id}/preview/${lId}`, { replace: true });
      const content = await loadLessonContent(lesson);
      setSelectedLesson({ ...lesson, _content: content });
    },
    [id, lessonId, lessons, selectedLesson, navigate, loadLessonContent]
  );

  // Create read-only editor at top level (hooks must be called unconditionally)
  const editor = useCreateBlockNote({
    _tiptapOptions: { editable: false },
  });

  // Sync content into the editor when selected lesson changes
  useEffect(() => {
    if (!selectedLesson?._content) return;
    const blocks = sanitizeBlocks(selectedLesson._content);
    if (blocks.length > 0) {
      try {
        editor.replaceBlocks(editor.document, blocks);
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
  }, [selectedLesson?.id, selectedLesson?._content, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  const lessonIndex = lessons.findIndex((l) => l.id === selectedLesson?.id);
  const canGoPrev = lessonIndex > 0;
  const canGoNext = lessonIndex >= 0 && lessonIndex < lessons.length - 1;

  const goToPrev = () => {
    if (canGoPrev) handleSelectLesson(lessons[lessonIndex - 1].id);
  };
  const goToNext = () => {
    if (canGoNext) handleSelectLesson(lessons[lessonIndex + 1].id);
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <div
          style={{
            marginLeft: 70,
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
      <div style={{ display: "flex" }}>
        <div style={{ marginLeft: 70, flex: 1, padding: 24 }}>
          <Paper className="p-6">
            <p style={{ color: "var(--error)" }}>{error}</p>
          </Paper>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <SideBar />
      <div
        style={{
          marginLeft: 70,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: t("bg-secondary"),
        }}
      >
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 52,
            minHeight: 52,
            background: t("bg-surface"),
            borderBottom: `1px solid ${t("border-primary")}`,
            padding: "0 16px",
            flexShrink: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{ flex: 1, fontSize: 13 }}
            className="text-text-muted flex items-center gap-1 text-xs"
          >
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
            <span>{selectedLesson?.title || "Preview"}</span>
          </div>
          <span style={{ color: t("text-muted"), fontSize: 14 }}>
            Lesson {lessonIndex >= 0 ? lessonIndex + 1 : 1} of {lessons.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(`/courses/${id}/builder/${selectedLesson?.id || lessonId || ""}`)
            }
          >
            <Edit3 size={13} /> Edit
          </Button>
        </header>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex" }}>
          <LessonPanel
            lessons={lessons}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={handleSelectLesson}
          />

          {/* Content area */}
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "32px 24px",
              background: t("bg-secondary"),
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                background: t("bg-surface"),
                borderRadius: t("radius-lg"),
                boxShadow: t("shadow-md"),
                padding: "40px 48px",
              }}
            >
              {/* Lesson header */}
              <div
                style={{
                  marginBottom: 28,
                  paddingBottom: 20,
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
                    marginBottom: 6,
                  }}
                >
                  Lesson {lessonIndex >= 0 ? lessonIndex + 1 : 1}
                </p>
                <h2
                  style={{
                    color: "var(--text-primary)",
                    margin: 0,
                    lineHeight: 1.25,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  {selectedLesson?.title || "Untitled Lesson"}
                </h2>
              </div>

              {/* BlockNote read-only content */}
              {selectedLesson?._content && selectedLesson._content.length > 0 ? (
                <div style={{ minHeight: 200 }}>
                  <BlockNoteView editor={editor} theme={theme} editable={false} />
                </div>
              ) : (
                <div
                  style={{
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: t("text-muted"),
                    fontSize: 14,
                  }}
                >
                  <BookOpen size={32} style={{ opacity: 0.3, marginRight: 12 }} />
                  This lesson has no content yet.
                </div>
              )}

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 40,
                  paddingTop: 20,
                  borderTop: `1px solid ${t("border-secondary")}`,
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrev}
                  disabled={!canGoPrev}
                  style={{ color: t("text-secondary") }}
                >
                  <ArrowLeft size={14} /> Previous
                </Button>
                <span style={{ color: t("text-muted"), fontSize: 12 }}>
                  {lessonIndex + 1} / {lessons.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  disabled={!canGoNext}
                  style={{ color: t("text-secondary") }}
                >
                  Next <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
