import { BookOpen } from "lucide-react";

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop";

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
      className="group border-border bg-card flex cursor-pointer items-center gap-5 rounded-xl border p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
      onClick={onClick}
    >
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={course.coverImage || DEFAULT_COURSE_IMAGE}
          alt={course.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-110"
          onError={(e) => {
            e.target.src = DEFAULT_COURSE_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-foreground truncate text-base font-bold group-hover:text-primary transition-colors">
          {course.title}
        </h4>
        <p className="text-muted-foreground text-xs font-medium">
          {course.category} • {course.totalLessons} lessons
        </p>
        {course.progress !== undefined && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">{course.progress}% complete</span>
            </div>
            <div className="bg-secondary h-1.5 w-full rounded-full">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showStatus && course.status && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              course.status === "published"
                ? "border-green-500/20 bg-green-500/10 text-green-600"
                : "border-orange-500/20 bg-orange-500/10 text-orange-600"
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
            className="text-muted-foreground hover:text-primary p-2 transition-colors"
          >
            Edit
          </button>
        )}
        {actionLabel && (
          <Button size="sm" variant="primary" className="flex-shrink-0">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
