import { BookOpen, Clock, List, User } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";

import { getStatusLabel } from "./viewHelpers";

const CourseCardSkeleton = memo(() => (
  <div className="border-border bg-bg-surface flex h-full flex-col overflow-hidden rounded-md border shadow-sm">
    {/* Image skeleton */}
    <div className="bg-bg-surface-active h-40 w-full animate-pulse" />
    <div className="flex flex-1 flex-col gap-2 p-3">
      {/* Badge skeleton */}
      <div className="bg-bg-surface-active h-5 w-16 animate-pulse rounded-full" />
      {/* Title skeleton */}
      <div className="bg-bg-surface-active h-4 w-full animate-pulse rounded" />
      <div className="bg-bg-surface-active h-4 w-3/4 animate-pulse rounded" />
      {/* Description skeleton */}
      <div className="bg-bg-surface-active h-3 w-full animate-pulse rounded" />
      <div className="bg-bg-surface-active h-3 w-2/3 animate-pulse rounded" />
      {/* Stats skeleton */}
      <div className="text-text-muted mt-auto flex items-center gap-3 text-[11px]">
        <div className="bg-bg-surface-active h-3 w-12 animate-pulse rounded" />
        <div className="bg-bg-surface-active h-3 w-12 animate-pulse rounded" />
        <div className="bg-bg-surface-active h-3 w-12 animate-pulse rounded" />
      </div>
    </div>
  </div>
));

const CourseCard = memo(({ course, navigate }) => {
  const status = getStatusLabel(course.status);
  const slide = course.coverImage || course.images?.[0];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View course: ${course.title}`}
      className="border-border bg-bg-surface focus-visible:ring-primary flex h-full cursor-pointer flex-col overflow-hidden rounded-md border shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
      onClick={() => navigate(`/courses/${course.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/courses/${course.id}`);
        }
      }}
    >
      {/* Image */}
      {slide ? (
        <img
          src={slide}
          alt={`Cover image for ${course.title}`}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="bg-bg-surface-active flex h-40 w-full items-center justify-center">
          <BookOpen size={48} className="text-text-muted" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <Badge variant="default">{course.category}</Badge>
          <span className="text-text-muted flex items-center gap-1 text-[11px]">
            <User size={10} /> {course.author}
          </span>
        </div>

        <h3 className="text-text-primary line-clamp-2 text-sm font-semibold">{course.title}</h3>
        <p className="text-text-muted line-clamp-2 text-[11px]">{course.description}</p>

        <div className="text-text-muted mt-auto flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <List size={10} /> {course.totalLessons}
          </span>
          <span className="flex items-center gap-1">
            <User size={10} /> {course.enrolledUsers}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} /> {course.duration}
          </span>
        </div>

        {course.tags?.length > 0 && (
          <div className="flex items-center gap-1">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="default" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="default" className="text-[10px]">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {status && (
          <Badge variant={status.color === "grey" ? "gray" : status.color}>{status.text}</Badge>
        )}
      </div>
    </div>
  );
});

const GridView = ({ courses, navigate, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={48} />}
        title="No courses yet"
        description="Create your first course to get started."
        action={
          <button
            onClick={() => navigate?.("/courses/create")}
            className="bg-primary hover:bg-primary-hover text-secondary mt-4 rounded-md px-4 py-2 text-sm"
          >
            Create Course
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} navigate={navigate} />
      ))}
    </div>
  );
};

export default GridView;
