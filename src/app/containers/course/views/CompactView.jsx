import { BookOpen, List, Network, Pencil, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { getCategoryColor, getStatusLabel } from "./viewHelpers";

const CompactView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-8 w-full" />
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="bg-bg-surface-active text-text-muted border-border grid grid-cols-12 gap-2 border-b px-3 py-2 text-[11px] font-medium">
        <div className="col-span-5">Course</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1 text-center">Lessons</div>
        <div className="col-span-1 text-center">Enrolled</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <div
            key={course.id}
            className="border-border hover:bg-bg-surface-hover grid cursor-pointer grid-cols-12 items-center gap-2 border-b px-3 py-2 transition-colors"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <div className="col-span-5 flex items-center gap-2">
              <BookOpen size={12} className="text-text-muted shrink-0" />
              <span className="text-text-primary truncate text-xs">{course.title}</span>
            </div>
            <div className="col-span-2">
              <Badge variant={getCategoryColor(course.category)} className="text-[10px]">
                {course.category}
              </Badge>
            </div>
            <div className="col-span-1">
              {status && (
                <Badge
                  variant={status.color === "grey" ? "gray" : status.color}
                  className="text-[10px]"
                >
                  {status.text}
                </Badge>
              )}
            </div>
            <div className="text-text-muted col-span-1 text-center text-[11px]">
              {course.totalLessons}
            </div>
            <div className="text-text-muted col-span-1 text-center text-[11px]">
              {course.enrolledUsers}
            </div>
            <div
              className="col-span-2 flex items-center justify-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                to={`/courses/${course.id}/builder`}
                className="border-border text-text-muted hover:bg-bg-surface-active rounded border px-1.5 py-0.5 text-[10px]"
                onClick={(e) => e.stopPropagation()}
              >
                Builder
              </Link>
              <Link
                to={`/courses/${course.id}/edit`}
                className="border-border text-text-muted hover:bg-bg-surface-active rounded border px-1.5 py-0.5 text-[10px]"
                onClick={(e) => e.stopPropagation()}
              >
                Edit
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompactView;
