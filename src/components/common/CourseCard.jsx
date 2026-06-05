import { BookOpen } from "lucide-react";

/**
 * CourseCard — Reusable card for displaying course information.
 *
 * Props:
 *   course      - Course object with title, category, coverImage, etc.
 *   onEdit      - Optional edit handler
 *   onClick     - Main click handler
 *   showStatus  - Whether to show status badge (default: true for instructor)
 *   showEdit    - Whether to show edit button (default: true)
 */
const CourseCard = ({
  course,
  onEdit,
  onClick,
  showStatus = true,
  showEdit = true,
  actionLabel = "Continue →",
}) => {
  if (!course) return null;

  return (
    <div
      className="border-border bg-bg-surface flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
      onClick={onClick}
    >
      {course.coverImage ? (
        <img
          src={course.coverImage}
          alt={course.title}
          className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="bg-bg-surface-active flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-lg">
          <BookOpen size={20} className="text-text-muted" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h4 className="text-text-primary truncate text-sm font-semibold">{course.title}</h4>
        <p className="text-text-muted text-[11px]">
          {course.category} • {course.totalLessons} lessons
        </p>
        {course.progress !== undefined && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-text-muted text-[11px]">{course.progress}% complete</span>
            </div>
            <div className="bg-bg-surface-active h-1.5 w-full rounded-full">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showStatus && course.status && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              course.status === "Published"
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning"
            }`}
          >
            {course.status}
          </span>
        )}
        {showEdit && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
            className="text-text-muted hover:text-primary text-xs"
          >
            Edit
          </button>
        )}
        {actionLabel && (
          <button className="bg-primary hover:bg-primary-hover flex-shrink-0 rounded-md px-3 py-1.5 text-xs text-white">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
