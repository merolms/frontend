import { Check, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { t } from "@/styles/theme";

/**
 * ReaderLayout — shared full-viewport reading layout with sidebar lesson list.
 * Used by CourseViewer and CoursePreview.
 */
export const ReaderLayout = ({
  course,
  lessons,
  activeIndex,
  onGoToLesson,
  children,
  topBarRight,
  sidebar = true,
  enrollment,
  onMarkLessonComplete,
  onMarkCourseComplete,
  lessonCompletionStatus = {},
}) => {
  const activeLesson = lessons[activeIndex];
  const isLessonCompleted = activeLesson ? lessonCompletionStatus[activeLesson.id] : false;
  const allLessonsCompleted =
    lessons.length > 0 && lessons.every((l) => lessonCompletionStatus[l.id]);
  const isCourseCompleted = enrollment?.status === "completed";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <ReaderTopBar
        course={course}
        activeLesson={activeLesson}
        activeIndex={activeIndex}
        totalLessons={lessons.length}
        topBarRight={topBarRight}
        enrollment={enrollment}
        isLessonCompleted={isLessonCompleted}
        allLessonsCompleted={allLessonsCompleted}
        isCourseCompleted={isCourseCompleted}
        onMarkLessonComplete={() => onMarkLessonComplete?.(activeLesson?.id)}
        onMarkCourseComplete={onMarkCourseComplete}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {sidebar && (
          <ReaderSidebar
            lessons={lessons}
            activeIndex={activeIndex}
            onGoToLesson={onGoToLesson}
            lessonCompletionStatus={lessonCompletionStatus}
          />
        )}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: t("bg-secondary"),
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────

const ReaderTopBar = ({
  course,
  activeLesson,
  activeIndex,
  totalLessons,
  topBarRight,
  enrollment,
  isLessonCompleted,
  allLessonsCompleted,
  isCourseCompleted,
  onMarkLessonComplete,
  onMarkCourseComplete,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
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
      <div
        className="text-text-muted flex items-center gap-1 text-xs"
        style={{ flex: 1, minWidth: 0 }}
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
          className="text-primary cursor-pointer truncate hover:underline"
          style={{ maxWidth: 200 }}
        >
          {course?.title}
        </button>
        <ChevronRight size={12} />
        <span className="truncate">{activeLesson?.title || "Reading"}</span>
      </div>

      {enrollment && activeLesson && !isLessonCompleted && (
        <button
          onClick={onMarkLessonComplete}
          className="text-success hover:text-success hover:bg-success/10 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
        >
          <Check size={14} /> Mark Complete
        </button>
      )}

      {enrollment && allLessonsCompleted && !isCourseCompleted && (
        <button
          onClick={onMarkCourseComplete}
          className="text-accent hover:text-accent hover:bg-accent/10 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
        >
          🏆 Complete Course
        </button>
      )}

      {isCourseCompleted && (
        <span className="bg-success/10 text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
          🏆 Completed
        </span>
      )}

      <span className="text-text-muted flex-shrink-0 text-xs">
        Lesson {activeIndex + 1} of {totalLessons}
      </span>
      {topBarRight}
    </div>
  );
};

const ReaderSidebar = ({ lessons, activeIndex, onGoToLesson, lessonCompletionStatus }) => (
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
    <div
      style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${t("border-primary")}`,
        background: t("bg-secondary"),
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: t("text-muted"),
          marginBottom: 6,
        }}
      >
        Lessons
      </p>
      <div className="bg-bg-surface-active h-1 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{
            width: `${lessons.length > 0 ? ((activeIndex + 1) / lessons.length) * 100 : 0}%`,
          }}
        />
      </div>
      <p className="text-text-muted mt-1 text-[11px]">
        {activeIndex + 1} of {lessons.length}
      </p>
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
            <span
              className={`truncate text-xs ${isActive ? "text-text-primary font-semibold" : "text-text-secondary"}`}
            >
              {lesson.title || `Lesson ${idx + 1}`}
            </span>
          </div>
        );
      })}
    </div>
  </aside>
);

export default ReaderLayout;
