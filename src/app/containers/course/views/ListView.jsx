import React from "react";
import { BookOpen, Clock, List, Pencil, Network, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/card";
import { getStatusLabel, getCategoryColor } from "./viewHelpers";

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

  return (
    <div className="space-y-2">
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <Paper
            key={course.id}
            className="cursor-pointer p-4 transition-shadow hover:shadow-md"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
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
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  to={`/courses/${course.id}/builder`}
                  className="border-border text-text-muted hover:bg-bg-surface-active rounded border px-2 py-1 text-[11px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Network size={10} /> Builder
                </Link>
                <Link
                  to={`/courses/${course.id}/edit`}
                  className="border-border text-text-muted hover:bg-bg-surface-active rounded border px-2 py-1 text-[11px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil size={10} /> Edit
                </Link>
              </div>
            </div>
          </Paper>
        );
      })}
    </div>
  );
};

export default ListView;
