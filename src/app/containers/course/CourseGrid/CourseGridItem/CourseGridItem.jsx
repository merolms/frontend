import { BookOpen, Calendar, Users } from "lucide-react";
import React from "react";

const GridItem = (props) => {
  const course = props.course;
  return (
    <div className="border-border bg-bg-surface overflow-hidden rounded-lg border shadow-sm">
      <img src={course.CoverImage} alt={course.Title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <h3 className="text-text-primary text-sm font-semibold">{course.Title}</h3>
        <p className="text-text-muted mt-1 line-clamp-2 text-xs">{course.Description}</p>
        <div className="text-text-muted mt-3 flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <BookOpen size={10} /> Course Type
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={10} /> 11 Dec 2020
          </span>
          <span className="flex items-center gap-1">
            <Users size={10} /> 50
          </span>
        </div>
      </div>
    </div>
  );
};

export default GridItem;
