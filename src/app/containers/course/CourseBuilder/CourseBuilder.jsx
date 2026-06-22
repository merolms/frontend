import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Save, Eye, AlertCircle, Check, Loader2, X, GripVertical, Menu, Book } from "lucide-react";

import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import { saveLessonBlocks } from "@/app/services/blockService";
import {
  createLesson,
  deleteLesson,
  fetchCourseById,
  fetchLessons,
  reorderLessons,
  updateLesson,
} from "@/app/services/courseService";
import MeroEduEditor from "@/editor/Editor";
import { loadLessonDoc } from "@/editor/utils/lessonContent";
import { usePageTitle } from "@/hooks";
import RoleBasedSidebar from "@/components/layouts/RoleBasedSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

import LessonPanel from "./components/LessonPanel";

// ─── CourseBuilder ───────────────────────────────────────────────
const CourseBuilder = () => {
  usePageTitle("Course Builder");
  const navigate = useNavigate();
  const { id, lessonId } = useParams();
  const { isExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const contentRef = useRef("");
  const [content, setContent] = useState("");
  const [panelWidth, setPanelWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const resizeStart = useRef({ x: 0, width: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);
  const [error, setError] = useState(null);
  const [words, setWords] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await fetchCourseById(id);
      setCourse(courseData);
      const lessonList = await fetchLessons(id);
      lessonList.sort((a, b) => (a.displayOrder || a.sort_order || 0) - (b.displayOrder || b.sort_order || 0));
      if (lessonList?.length > 0) {
        setLessons(lessonList);
        // If URL has a lessonId, try to select that lesson; otherwise fall back to first
        let targetLesson = lessonList[0];
        if (lessonId) {
          const found = lessonList.find((l) => String(l.id) === String(lessonId));
          if (found) targetLesson = found;
        }
        await loadLesson(targetLesson);
      } else {
        // Only create first lesson if we have no lessons at all
        // Don't auto-create - let the user click the add button
        setLessons([]);
        setSelectedLesson(null);
        setContent("");
      }
    } catch (err) {
      setError(err.message || "Failed to load course.");
    } finally {
      setLoading(false);
    }
  }, [id, lessonId, navigate]);

  const loadLesson = useCallback(
    async (lesson) => {
      setSelectedLesson(lesson);
      setContent("");
      contentRef.current = "";
      clearTimeout(autosaveTimer.current);
      lastAutosaveContent.current = "";

      // Update URL to reflect selected lesson (replace to avoid history spam)
      navigate(`/courses/${id}/builder/${lesson.id}`, { replace: true });

      // Autosave snapshot first, then DB blocks (shared parse rules)
      const doc = await loadLessonDoc(lesson.id);
      const hasContent = Array.isArray(doc) ? doc.length > 0 : (doc?.content?.length || 0) > 0;
      const json = hasContent ? JSON.stringify(doc) : "";
      setContent(json);
      contentRef.current = json;
    },
    [id, navigate]
  );

  useEffect(() => {
    loadData();
  }, [id, lessonId]);

  const handleSave = async () => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      setError(null);
      clearTimeout(autosaveTimer.current);
      const currentContent = contentRef.current;
      // Persist to the lesson record (source of truth); autosave is recovery only
      await updateLesson(id, selectedLesson.id, {
        title: selectedLesson.title,
        content: currentContent,
        type: "blocknote",
      });
      await saveLessonBlocks(
        selectedLesson.id,
        JSON.stringify({ content: currentContent, format: "blocknote" })
      );
      lastAutosaveContent.current = currentContent;
      setAutosaveStatus("saved");
      setTimeout(() => setAutosaveStatus(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const autosaveTimer = useRef(null);
  const lastAutosaveContent = useRef("");
  const isSavingAutosave = useRef(false);

  const doAutosave = useCallback(async () => {
    if (!selectedLesson || isSavingAutosave.current) return;
    const currentContent = contentRef.current;
    if (!currentContent || currentContent === lastAutosaveContent.current) return;
    isSavingAutosave.current = true;
    try {
      await saveLessonBlocks(
        selectedLesson.id,
        JSON.stringify({ content: currentContent, format: "blocknote" })
      );
      lastAutosaveContent.current = currentContent;
      setAutosaveStatus("saved");
      // Clear the "saved" indicator after 3s, but only if no newer change came in
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => setAutosaveStatus(""), 3000);
    } catch {
      // autosave is best-effort; ignore
    } finally {
      isSavingAutosave.current = false;
    }
  }, [selectedLesson]);

  useEffect(() => () => clearTimeout(autosaveTimer.current), []);

  // Track whether user has changed content since last autosave
  const handleContentChange = useCallback(
    (json) => {
      contentRef.current = json;
      doAutosave();
    },
    [doAutosave]
  );
  const handleStatsChange = useCallback(({ words: w }) => setWords(w), []);

  const handleReorderLessons = useCallback(
    async (newLessons) => {
      const previousLessons = lessons;
      const reordered = newLessons.map((l, i) => ({ ...l, displayOrder: i + 1 }));
      setLessons(reordered);
      try {
        await reorderLessons(id, reordered);
      } catch (err) {
        setLessons(previousLessons);
        setError(err.message || "Failed to reorder lessons.");
      }
    },
    [lessons, id]
  );

  const handleResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizing(true);
      setIsDragging(true);
      resizeStart.current = { x: e.clientX, width: panelWidth };
      const handleMove = (ev) => {
        const dx = ev.clientX - resizeStart.current.x;
        const next = Math.max(160, Math.min(480, resizeStart.current.width + dx));
        setPanelWidth(next);
      };

      const handleUp = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        setIsDragging(false);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [panelWidth]
  );

  const handleSelectLesson = useCallback(
    async (lessonId) => {
      if (lessonId === selectedLesson?.id) return;
      const lesson = lessons.find((l) => l.id === lessonId);
      if (lesson) await loadLesson(lesson);
    },
    [selectedLesson, lessons]
  );

  const handleRenameLesson = async (lessonId, newTitle) => {
    try {
      await updateLesson(id, lessonId, { title: newTitle });
      setLessons(lessons.map((l) => (l.id === lessonId ? { ...l, title: newTitle } : l)));
      if (selectedLesson?.id === lessonId) setSelectedLesson((l) => ({ ...l, title: newTitle }));
    } catch (err) {
      setError(err.message || "Failed to rename lesson.");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(id, lessonId);
      const updated = lessons.filter((l) => l.id !== lessonId);
      setLessons(updated);
      // If the deleted lesson was selected, select the next one (or previous if last)
      if (selectedLesson?.id === lessonId) {
        const idx = lessons.findIndex((l) => l.id === lessonId);
        const next = updated[idx] || updated[idx - 1] || null;
        if (next) {
          await loadLesson(next);
          navigate(`/courses/${id}/builder/${next.id}`, { replace: true });
        } else {
          setSelectedLesson(null);
          setContent("");
          contentRef.current = "";
        }
      }
    } catch (err) {
      setError(err.message || "Failed to delete lesson.");
    }
  };

  const handleAddLesson = async () => {
    try {
      setAddingLesson(true);
      const nextDisplayOrder = lessons.length > 0 
        ? Math.max(...lessons.map(l => l.displayOrder || l.sort_order || 0)) + 1 
        : 1;
      
      const newLesson = await createLesson(id, {
        courseId: parseInt(id, 10),
        title: `Lesson ${lessons.length + 1}`,
        displayOrder: nextDisplayOrder,
      });
      
      // Add to state and select the new lesson
      setLessons([...lessons, newLesson]);
      await loadLesson(newLesson);
    } catch (err) {
      setError(err.message || "Failed to add lesson.");
    } finally {
      setAddingLesson(false);
    }
  };

  const handleBulkDeleteLessons = async (lessonIds) => {
    try {
      for (const lessonId of lessonIds) {
        await deleteLesson(id, lessonId);
      }
      const updated = lessons.filter((l) => !lessonIds.includes(l.id));
      setLessons(updated);
      // If selected lesson was deleted, select the next one
      if (selectedLesson && lessonIds.includes(selectedLesson.id)) {
        const idx = lessons.findIndex((l) => l.id === selectedLesson.id);
        const next = updated[idx] || updated[idx - 1] || null;
        if (next) {
          await loadLesson(next);
          navigate(`/courses/${id}/builder/${next.id}`, { replace: true });
        } else {
          setSelectedLesson(null);
          setContent("");
          contentRef.current = "";
        }
      }
    } catch (err) {
      setError(err.message || "Failed to delete lessons.");
    }
  };

  const handleBulkDuplicateLessons = async (lessonIds) => {
    try {
      const newLessons = [...lessons];
      const maxDisplayOrder = lessons.length > 0 
        ? Math.max(...lessons.map(l => l.displayOrder || l.sort_order || 0)) 
        : 0;
      
      let currentDisplayOrder = maxDisplayOrder + 1;
      for (const lessonId of lessonIds) {
        const original = lessons.find((l) => l.id === lessonId);
        if (original) {
          const duplicated = await createLesson(id, {
            courseId: parseInt(id, 10),
            title: `${original.title} (Copy)`,
            displayOrder: currentDisplayOrder,
          });
          newLessons.push(duplicated);
          currentDisplayOrder++;
        }
      }
      setLessons(newLessons);
    } catch (err) {
      setError(err.message || "Failed to duplicate lessons.");
    }
  };

  const lessonIndex = lessons.findIndex((l) => l.id === selectedLesson?.id);

  // ─── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <RoleBasedSidebar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading editor…</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <RoleBasedSidebar />
      
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <main
        onClick={() => isMobileOpen && setIsMobileOpen(false)}
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
          "lg:ml-16",
          isExpanded && "lg:ml-64"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/30 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl shadow-sm px-4 sm:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-sm flex-1 min-w-0">
            <button
              onClick={() => navigate("/courses")}
              className="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              Courses
            </button>
            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
            >
              {course?.title}
            </button>
            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-foreground truncate max-w-[200px]">
              {selectedLesson?.title || "Untitled"}
            </span>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {words > 0 && (
              <span className="text-xs text-muted-foreground bg-accent/50 rounded-full px-2 py-1 font-mono">
                {words} words
              </span>
            )}
            {autosaveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-xs text-foreground">
                <Check size={12} /> Saved
              </span>
            )}
            <button
              onClick={() =>
                navigate(`/courses/${id}/preview/${selectedLesson?.id || lessonId || ""}`)
              }
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
              <Eye size={14} /> Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
            <div className="flex h-9 w-9 items-center justify-center">
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        {/* Error bar */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 text-sm flex-shrink-0">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 p-1 rounded hover:bg-red-500/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Editor layout (fills remaining height, scrollable) ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <LessonPanel
            lessons={lessons}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={handleSelectLesson}
            onAddLesson={handleAddLesson}
            onRenameLesson={handleRenameLesson}
            onDeleteLesson={handleDeleteLesson}
            onReorder={handleReorderLessons}
            onBulkDelete={handleBulkDeleteLessons}
            onBulkDuplicate={handleBulkDuplicateLessons}
            adding={addingLesson}
            width={panelWidth}
            isDragging={isDragging}
          />

          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            className={cn(
              "w-1.5 flex-shrink-0 cursor-col-resize transition-colors select-none",
              isResizing ? "bg-primary/30" : "bg-transparent hover:bg-border/50"
            )}
          />

          {/* Scrollable canvas */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 p-4 sm:p-6 lg:p-8">
            {/* Document card */}
            <div className="w-full min-w-[760px] max-w-5xl mx-auto bg-background rounded-xl shadow-lg border border-border/50 flex flex-col flex-shrink-0">
              {/* Lesson header */}
              <div className="mb-8 pb-5 border-b border-border/30">
                <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">
                  Lesson {lessonIndex >= 0 ? lessonIndex + 1 : 1}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {selectedLesson?.title || "Untitled Lesson"}
                </h1>
              </div>
              
              {/* Editor */}
              {lessons.length > 0 && selectedLesson ? (
                <MeroEduEditor
                  key={selectedLesson?.id} // remount editor when lesson changes to reset state
                  initialContent={content}
                  onContentChange={handleContentChange}
                  onStatsChange={handleStatsChange}
                  lessonId={selectedLesson?.id}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                  <Book size={48} className="opacity-30 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No lessons yet</h2>
                  <p className="text-sm max-w-md text-center">
                    Click the + button in the sidebar to create your first lesson
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </main>
    </div>
  );
};

export default CourseBuilder;
