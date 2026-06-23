import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Book,
  Check,
  ChevronRight,
  Eye,
  Loader2,
  Menu,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ThemeSwitcher from "@/components/ThemeSwitcher";
import { saveLessonBlocks } from "@/services/blockService";
import {
  createLesson,
  deleteLesson,
  fetchLessons,
  reorderLessons,
  updateLesson,
} from "@/services/courseService";
import RoleBasedSidebar from "@/components/layouts/RoleBasedSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import MeroEduEditor from "@/editor/Editor";
import { loadLessonDoc } from "@/editor/utils/lessonContent";
import { usePageTitle } from "@/hooks";
import { cn } from "@/lib/utils";

import LessonPanel from "./components/LessonPanel";

interface CourseBuilderProps {
  courseId: string;
  lessonId?: string;
}

// ─── CourseBuilder ───────────────────────────────────────────────
const CourseBuilder = ({ courseId, lessonId }: CourseBuilderProps) => {
  usePageTitle("Course Builder");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get page from URL search params
  const getPageFromUrl = () => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  };

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
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLessons: 0,
    lessonsPerPage: 10,
  });

  const loadData = useCallback(
    async (page = null) => {
      try {
        setLoading(true);
        setError(null);

        // Use page from parameter or URL
        let actualPage = page !== null ? page : getPageFromUrl();

        // Calculate pagination
        const lessonsPerPage = 10; // Fixed at 10
        const start = (actualPage - 1) * lessonsPerPage;
        const limit = lessonsPerPage;

        // Fetch lessons with pagination
        const result = await fetchLessons(courseId, { start, limit });
        const lessonList = result.lessons || [];
        lessonList.sort(
          (a, b) => (a.displayOrder || a.sort_order || 0) - (b.displayOrder || b.sort_order || 0)
        );

        // Update pagination state with backend-provided metadata
        const totalPages = result.totalPages || 1;
        setPagination((prev) => ({
          ...prev,
          currentPage: result.currentPage || actualPage,
          totalPages: totalPages,
          totalLessons: result.total || lessonList.length,
        }));

        // Check if the requested page is invalid (greater than total pages)
        // Only redirect if there are lessons available but page is invalid
        if (actualPage > totalPages && (result.total || lessonList.length) > 0) {
          console.warn(`Page ${actualPage} is invalid, redirecting to page 1`);
          // Reset to page 1
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.delete("page");
          const queryString = newSearchParams.toString();
          router.push(`/courses/${courseId}/builder${queryString ? `?${queryString}` : ""}`);
          loadData(1); // Reload with page 1
          return;
        }

        setLessons(lessonList);

        // Update URL if page changed
        const currentPage = getPageFromUrl();
        if (page !== null && page !== currentPage) {
          const newSearchParams = new URLSearchParams(searchParams.toString());
          if (page > 1) {
            newSearchParams.set("page", page);
          } else {
            newSearchParams.delete("page");
          }
          const queryString = newSearchParams.toString();
          router.push(`/courses/${courseId}/builder${queryString ? `?${queryString}` : ""}`);
        }

        // If URL has a lessonId, try to select that lesson
        if (lessonId) {
          const found = lessonList.find((l) => String(l.id) === String(lessonId));
          if (found) {
            // Lesson found on current page
            await loadLesson(found, actualPage);
          } else {
            // Lesson not found on current page
            // It might be on a different page or deleted
            // Only search if there are lessons in the course
            if ((result.total || lessonList.length) === 0) {
              console.warn(`Course has no lessons, clearing lessonId from URL`);
              router.push(`/courses/${courseId}/builder`);
              return;
            }

            console.warn(
              `Lesson ${lessonId} not found in page ${actualPage}, searching all pages...`
            );

            // Try to find the lesson by fetching all lessons
            try {
              const allLessonsResult = await fetchLessons(courseId, { start: 0, limit: 1000 });
              const allLessons = allLessonsResult.lessons || [];
              const foundAnywhere = allLessons.find((l) => String(l.id) === String(lessonId));

              if (foundAnywhere) {
                // Lesson exists, calculate its page
                const lessonIndex = allLessons.findIndex((l) => String(l.id) === String(lessonId));
                const lessonPage = Math.floor(lessonIndex / 10) + 1;

                console.log(
                  `Lesson ${lessonId} found on page ${lessonPage}, switching to that page`
                );
                // Load the correct page
                loadData(lessonPage);
                return; // Early return, loadData will handle loading the lesson
              } else {
                // Lesson doesn't exist (deleted)
                console.warn(`Lesson ${lessonId} not found (deleted)`);
                // Clear the lessonId from URL if there are no lessons
                if (lessonList.length === 0) {
                  router.push(`/courses/${courseId}/builder`);
                } else {
                  await loadLesson(lessonList[0], actualPage);
                }
              }
            } catch (searchError) {
              console.error("Error searching for lesson:", searchError);
              // Clear the lessonId from URL if there are no lessons
              if (lessonList.length === 0) {
                router.push(`/courses/${courseId}/builder`);
              } else {
                await loadLesson(lessonList[0], actualPage);
              }
            }
          }
        } else {
          // No lessonId in URL, select first lesson if available
          if (lessonList.length > 0) {
            await loadLesson(lessonList[0], actualPage);
          }
          // If no lessons, just show empty state (selectedLesson remains null)
        }
      } catch (err) {
        setError(err.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    },
    [courseId, lessonId, searchParams, router]
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      // Navigate to the new page without lessonId to allow browsing
      const searchParams = new URLSearchParams();
      if (newPage > 1) {
        searchParams.set("page", newPage);
      }
      const queryString = searchParams.toString();
      router.push(`/courses/${courseId}/builder${queryString ? `?${queryString}` : ""}`);
    }
  };

  const loadLesson = useCallback(
    async (lesson, currentPage = null) => {
      setSelectedLesson(lesson);
      setContent("");
      contentRef.current = "";
      clearTimeout(autosaveTimer.current);
      lastAutosaveContent.current = "";

      // Preserve page from URL if not provided
      const actualPage = currentPage !== null ? currentPage : getPageFromUrl();

      // Update URL to reflect selected lesson and page (replace to avoid history spam)
      const searchParams = new URLSearchParams();
      if (actualPage > 1) {
        searchParams.set("page", actualPage);
      }
      const queryString = searchParams.toString();
      router.push(`/courses/${courseId}/builder/${lesson.id}${queryString ? `?${queryString}` : ""}`);

      // Autosave snapshot first, then DB blocks (shared parse rules)
      const doc = await loadLessonDoc(lesson.id);
      const hasContent = Array.isArray(doc) ? doc.length > 0 : (doc?.content?.length || 0) > 0;
      const json = hasContent ? JSON.stringify(doc) : "";
      setContent(json);
      contentRef.current = json;
    },
    [courseId, searchParams, router]
  );

  useEffect(() => {
    loadData();
  }, [courseId, lessonId, searchParams]);

  // Unsaved changes protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasUnsavedChanges = contentRef.current !== lastAutosaveContent.current;
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        return ""; // Modern browsers require a return value
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }); // Run once on mount, check refs dynamically

  const handleSave = async () => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      setError(null);
      clearTimeout(autosaveTimer.current);
      const currentContent = contentRef.current;
      // Persist to the lesson record (source of truth); autosave is recovery only
      await updateLesson(courseId, selectedLesson.id, {
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
        await reorderLessons(courseId, reordered);
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
      await updateLesson(courseId, lessonId, { title: newTitle });
      setLessons(lessons.map((l) => (l.id === lessonId ? { ...l, title: newTitle } : l)));
      if (selectedLesson?.id === lessonId) setSelectedLesson((l) => ({ ...l, title: newTitle }));
    } catch (err) {
      setError(err.message || "Failed to rename lesson.");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(courseId, lessonId);
      const updated = lessons.filter((l) => l.id !== lessonId);
      setLessons(updated);
      // If the deleted lesson was selected, select the next one (or previous if last)
      if (selectedLesson?.id === lessonId) {
        const idx = lessons.findIndex((l) => l.id === lessonId);
        const next = updated[idx] || updated[idx - 1] || null;
        if (next) {
          await loadLesson(next);
          router.push(`/courses/${courseId}/builder/${next.id}`);
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
      // Use totalLessons for title generation instead of current page count
      const nextDisplayOrder = pagination.totalLessons > 0 ? pagination.totalLessons + 1 : 1;

      const newLesson = await createLesson(courseId, {
        courseId: parseInt(courseId, 10),
        title: `Lesson ${nextDisplayOrder}`,
        displayOrder: nextDisplayOrder,
      });

      // Add to state and select the new lesson
      setLessons([...lessons, newLesson]);
      await loadLesson(newLesson, pagination.currentPage);

      // Refresh pagination state after adding
      loadData(pagination.currentPage);
    } catch (err) {
      setError(err.message || "Failed to add lesson.");
    } finally {
      setAddingLesson(false);
    }
  };

  const handleBulkDeleteLessons = async (lessonIds) => {
    try {
      for (const lessonId of lessonIds) {
        await deleteLesson(courseId, lessonId);
      }
      const updated = lessons.filter((l) => !lessonIds.includes(l.id));
      setLessons(updated);
      // If selected lesson was deleted, select the next one
      if (selectedLesson && lessonIds.includes(selectedLesson.id)) {
        const idx = lessons.findIndex((l) => l.id === selectedLesson.id);
        const next = updated[idx] || updated[idx - 1] || null;
        if (next) {
          await loadLesson(next);
          router.push(`/courses/${courseId}/builder/${next.id}`);
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
      const maxDisplayOrder = pagination.totalLessons > 0 ? pagination.totalLessons : 0;

      let currentDisplayOrder = maxDisplayOrder + 1;
      for (const lessonId of lessonIds) {
        const original = lessons.find((l) => l.id === lessonId);
        if (original) {
          const duplicated = await createLesson(courseId, {
            courseId: parseInt(courseId, 10),
            title: `${original.title} (Copy)`,
            displayOrder: currentDisplayOrder,
          });
          newLessons.push(duplicated);
          currentDisplayOrder++;
        }
      }
      setLessons(newLessons);
      // Refresh pagination after duplicating
      loadData(pagination.currentPage);
    } catch (err) {
      setError(err.message || "Failed to duplicate lessons.");
    }
  };

  const lessonIndex = lessons.findIndex((l) => l.id === selectedLesson?.id);

  const handlePreviousLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === selectedLesson?.id);
    if (currentIndex > 0) {
      handleSelectLesson(lessons[currentIndex - 1].id);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === selectedLesson?.id);
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      handleSelectLesson(lessons[currentIndex + 1].id);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="from-background via-background to-background/95 flex min-h-screen bg-gradient-to-br">
        <RoleBasedSidebar />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="text-muted-foreground text-sm">Loading editor…</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="from-background via-background to-background/95 flex min-h-screen bg-gradient-to-br">
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
          "flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out",
          "lg:ml-16",
          isExpanded && "lg:ml-64"
        )}
      >
        {/* Top bar */}
        <header className="border-border/30 from-background via-background/95 to-background sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-gradient-to-r px-4 shadow-sm backdrop-blur-xl sm:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-all lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb navigation */}
          <nav className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <button
              onClick={() => router.push("/courses")}
              className="text-muted-foreground hover:text-foreground truncate transition-colors"
            >
              Courses
            </button>
            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="text-muted-foreground hover:text-foreground max-w-[160px] truncate transition-colors"
            >
              {course?.title}
            </button>
            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground max-w-[200px] truncate font-semibold">
              {selectedLesson?.title || "Untitled"}
            </span>
          </nav>

          {/* Right side actions */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {words > 0 && (
              <span className="text-muted-foreground bg-accent/50 rounded-full px-2 py-1 font-mono text-xs">
                {words} words
              </span>
            )}
            {autosaveStatus === "saved" && (
              <span className="text-foreground flex items-center gap-1.5 text-xs">
                <Check size={12} /> Saved
              </span>
            )}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
            >
              {isPreviewMode ? <Pencil size={14} /> : <Eye size={14} />}
              {isPreviewMode ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 rounded p-1 transition-colors hover:bg-red-500/20"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Editor layout (fills remaining height, scrollable) ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {!isPreviewMode && (
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
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}

          {/* Resize handle - hide in preview mode */}
          {!isPreviewMode && (
            <div
              onMouseDown={handleResizeStart}
              className={cn(
                "w-1.5 flex-shrink-0 cursor-col-resize transition-colors select-none",
                isResizing ? "bg-primary/30" : "hover:bg-border/50 bg-transparent"
              )}
            />
          )}

          {/* Scrollable canvas */}
          <main className="bg-muted/30 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 p-2.5">
            {/* Document card */}
            <div className="bg-background border-border/50 mx-auto flex w-full min-w-[760px] flex-shrink-0 flex-col rounded-xl border shadow-lg">
              {/* Lesson header */}
              <div className="border-border/30 mb-2 border-b pb-2 pl-5 pt-5">
                <div className="text-muted-foreground mb-1.5 text-[10px] font-bold tracking-wider uppercase">
                  Lesson {lessonIndex >= 0 ? lessonIndex + 1 : 1}
                </div>
                <h1 className="text-foreground text-2xl leading-tight font-bold sm:text-3xl">
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
                  editable={!isPreviewMode}
                  showToolbar={!isPreviewMode}
                />
              ) : (
                <div className="text-muted-foreground flex min-h-[400px] flex-col items-center justify-center">
                  <Book size={48} className="mb-4 opacity-30" />
                  <h2 className="mb-2 text-xl font-semibold">No lessons yet</h2>
                  <p className="max-w-md text-center text-sm">
                    Click the + button in the sidebar to create your first lesson
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Lesson navigation footer for preview mode */}
          {isPreviewMode && lessons.length > 0 && selectedLesson && (
            <div className="border-border/30 from-background via-background/95 to-background flex-shrink-0 border-t bg-gradient-to-r px-4 py-3">
              <div className="mx-auto flex max-w-6xl items-center justify-between">
                <button
                  onClick={handlePreviousLesson}
                  disabled={lessonIndex <= 0}
                  className="hover:bg-accent hover:text-foreground text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
                <span className="text-muted-foreground text-sm font-medium">
                  {lessonIndex + 1} / {lessons.length}
                </span>
                <button
                  onClick={handleNextLesson}
                  disabled={lessonIndex >= lessons.length - 1}
                  className="hover:bg-accent hover:text-foreground text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseBuilder;
