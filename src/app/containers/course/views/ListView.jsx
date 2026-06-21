import { BookOpen, Eye, List, MoreHorizontal, Network, Pencil, User, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Paper } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getCategoryColor, getStatusLabel } from "./viewHelpers";

const ListView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Paper key={i} className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-24 w-32 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </div>
          </Paper>
        ))}
      </div>
    );
  }

  const CourseListItem = ({ course }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const status = getStatusLabel(course.status);

    const handleMenuClick = (e) => {
      e.stopPropagation();
      setMenuOpen(!menuOpen);
    };

    return (
      <Paper
        key={course.id}
        className="group relative cursor-pointer p-4 transition-shadow hover:shadow-md"
        onClick={() => navigate(`/courses/${course.id}`)}
      >
        {/* Quick Actions Menu */}
        <button
          onClick={handleMenuClick}
          className="bg-bg-surface/90 text-text-muted hover:bg-bg-surface absolute top-2 right-2 z-10 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <div className="bg-bg-surface absolute top-10 right-2 z-20 w-40 rounded-md border shadow-lg">
            <div className="p-1">
              <Link
                to={`/courses/${course.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
                className="text-text-muted hover:text-text-primary hover:bg-bg-surface-hover flex w-full items-center gap-2 rounded px-3 py-2 text-xs"
              >
                <Eye size={12} /> View
              </Link>
              <Link
                to={`/courses/${course.id}/builder`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
                className="text-text-muted hover:text-text-primary hover:bg-bg-surface-hover flex w-full items-center gap-2 rounded px-3 py-2 text-xs"
              >
                <Network size={12} /> Builder
              </Link>
              <Link
                to={`/courses/${course.id}/edit`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
                className="text-text-muted hover:text-text-primary hover:bg-bg-surface-hover flex w-full items-center gap-2 rounded px-3 py-2 text-xs"
              >
                <Pencil size={12} /> Edit
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            {course.coverImage ? (
              <img
                src={course.coverImage}
                alt={course.title}
                className="h-20 w-32 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="bg-bg-surface-active flex h-20 w-32 shrink-0 items-center justify-center rounded-md">
                <BookOpen size={24} className="text-text-muted" />
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <h3 className="text-text-primary text-sm font-semibold">{course.title}</h3>
              {status && (
                <Badge variant={status.color === "grey" ? "gray" : status.color}>
                  {status.text}
                </Badge>
              )}
              <p className="text-text-muted line-clamp-2 text-xs">{course.description}</p>
              <div className="text-text-muted flex items-center gap-3 text-[11px]">
                <Badge variant={getCategoryColor(course.category)} className="text-[10px]">
                  {course.category}
                </Badge>
                <span className="flex items-center gap-1">
                  <User size={10} /> {course.author}
                </span>
                <span className="flex items-center gap-1">
                  <List size={10} /> {course.totalLessons}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={10} /> {course.enrolledUsers}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    );
  };

  return (
    <div className="space-y-2">
      {courses.map((course) => (
        <CourseListItem key={course.id} course={course} navigate={navigate} />
      ))}
    </div>
  );
};

export default ListView;
