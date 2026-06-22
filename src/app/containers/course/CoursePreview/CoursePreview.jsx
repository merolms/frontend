import { ArrowLeft, ArrowRight, BookOpen, Pencil, Loader2, Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import MeroEduEditor from "@/editor/Editor";
import { loadLessonDoc } from "@/editor/utils/lessonContent";
import { usePageTitle } from "@/hooks";
import { useCourse, useCourseLessons } from "@/hooks/queries/useCourses";
import RoleBasedSidebar from "@/components/layouts/RoleBasedSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

const CoursePreview = () => {
  usePageTitle("Course Preview");
  const navigate = useNavigate();
  const { id, lessonId } = useParams();
  const { isExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();

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
        (a, b) => (a.displayOrder || a.sortOrder || a.sort_order || 0) - (b.displayOrder || b.sortOrder || b.sort_order || 0)
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
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <RoleBasedSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading preview…</span>
          </div>
        </main>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <RoleBasedSidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-red-500">{displayError}</p>
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
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/30 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl shadow-sm px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Course title */}
            <div className="flex-1 lg:ml-0">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                {course?.title}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <ThemeSwitcher />
              <button
                onClick={() => navigate(`/courses/${id}/builder/${selectedLesson?.id || lessonId || ""}`)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
          </div>
        </header>

        {/* Lesson header */}
        <div className="border-b border-border/30 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
              Lesson {lessonIndex >= 0 ? lessonIndex + 1 : 1}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {selectedLesson?.title || "Untitled Lesson"}
            </h2>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {selectedLesson?._content ? (
              <div>
                <MeroEduEditor
                  initialContent={selectedLesson._content}
                  editable={false}
                  showToolbar={false}
                  lessonId={selectedLesson?.id}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                <BookOpen size={32} className="opacity-30 mb-3" />
                <span>This lesson has no content yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="border-t border-border/30 bg-gradient-to-r from-background via-background/95 to-background px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => handleSelectLesson(lessonIndex - 1)}
              disabled={lessonIndex <= 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft size={14} /> Previous
            </button>
            <span className="text-xs text-muted-foreground">
              {lessonIndex + 1} / {lessons.length}
            </span>
            <button
              onClick={() => handleSelectLesson(lessonIndex + 1)}
              disabled={lessonIndex < 0 || lessonIndex >= lessons.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursePreview;
