import { ArrowLeft, ArrowRight, BookOpen, Loader2, Sparkles, Lock, Menu, X, Settings } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import { useToast } from "@/app/context/ToastContext";
import { hasPermission } from "@/app/services/authService";
import CourseCompletionCelebration from "@/components/CourseCompletionCelebration";
import { Badge } from "@/components/ui/badge";
import MeroEduEditor from "@/editor/Editor";
import { loadLessonDoc } from "@/editor/utils/lessonContent";
import { usePageTitle } from "@/hooks";
import { useCourse, useCourseLessons } from "@/hooks/queries/useCourses";
import {
  useEnrollInCourse,
  useEnrollmentStatus,
  useMarkLessonComplete,
  useMyLessonCompletions,
} from "@/hooks/queries/useEnrollments";
import RoleBasedSidebar from "@/components/layouts/RoleBasedSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";

const CourseViewer = () => {
  usePageTitle("Course Viewer");
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useSelector((s) => s.auth.user);
  const { isExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();

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
  const { data: completions = [] } = useMyLessonCompletions(id, { enabled: !!user?.id });

  const enrollMutation = useEnrollInCourse();
  const markCompleteMutation = useMarkLessonComplete(id);

  const loading = courseLoading || lessonsLoading;
  const error = courseError?.message;

  // Sort lessons by order
  const sortedLessons = [...lessons].sort(
    (a, b) => (a.displayOrder || a.sortOrder || a.sort_order || 0) - (b.displayOrder || b.sortOrder || b.sort_order || 0)
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
  ]);

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
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <RoleBasedSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading course…</span>
          </div>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <RoleBasedSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }
  if (!course) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <RoleBasedSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Course not found.</p>
        </main>
      </div>
    );
  }

  // Determine if course is enrollable
  const ispublished = course.status === "published";
  const isAdmin = hasPermission(user, "courses.publish"); // admin/instructor can see all

  // Not enrolled — show enroll prompt (only for published courses, or admins)
  if (!enrollment) {
    // draft/archived: show info message instead of enroll button (unless admin)
    if (!ispublished && !isAdmin) {
      return (
        <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
          <RoleBasedSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl p-10 text-center max-w-md shadow-lg border border-border/50">
              <BookOpen size={48} className="text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">{course.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {course.status === "draft"
                  ? "This course is not yet available. It is currently being prepared."
                  : "This course is no longer available for enrollment."}
              </p>
              <Badge variant={course.status === "draft" ? "secondary" : "destructive"}>
                {course.status === "draft" ? "draft" : "archived"}
              </Badge>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <RoleBasedSidebar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-10 text-center max-w-md shadow-lg border border-border/50">
            <BookOpen size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{course.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enroll to track your progress and mark lessons complete.
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrollMutation.isPending || !ispublished}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50 transition-all"
            >
              {enrollMutation.isPending
                ? "Enrolling…"
                : !ispublished
                  ? "Enrollment closed"
                  : "Enroll Now"}
            </button>
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
        {/* Course content */}
        <div className="flex-1 flex flex-col">
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
                  onClick={() => navigate("/settings")}
                  className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Lesson header */}
          <div className="border-b border-border/30 bg-gradient-to-r from-background via-background/95 to-background px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                Lesson {activeIndex + 1}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {activeLesson?.title || "Untitled Lesson"}
              </h2>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
              {activeContent ? (
                <div>
                  <MeroEduEditor
                    initialContent={activeContent}
                    editable={false}
                    showToolbar={false}
                    lessonId={activeLesson?.id}
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
                onClick={() => goToLesson(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft size={14} /> Previous
              </button>
              <span className="text-xs text-muted-foreground">
                {activeIndex + 1} / {lessons.length}
              </span>
              <button
                onClick={() => goToLesson(activeIndex + 1)}
                disabled={activeIndex >= lessons.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {showCelebration && (
        <CourseCompletionCelebration
          courseTitle={course?.title}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
};

export default CourseViewer;
