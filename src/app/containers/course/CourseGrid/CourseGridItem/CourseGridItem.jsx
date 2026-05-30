import React from 'react';
import { BookOpen, Calendar, Users } from 'lucide-react';

const GridItem = (props) => {
  const course = props.course;
  return (
    <div className="rounded-lg border border-border bg-bg-surface shadow-sm overflow-hidden">
      <img src={course.CoverImage} alt={course.Title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary">{course.Title}</h3>
        <p className="text-xs text-text-muted mt-1 line-clamp-2">{course.Description}</p>
        <div className="flex items-center gap-3 mt-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><BookOpen size={10} /> Course Type</span>
          <span className="flex items-center gap-1"><Calendar size={10} /> 11 Dec 2020</span>
          <span className="flex items-center gap-1"><Users size={10} /> 50</span>
        </div>
      </div>
    </div>
  );
};

export default GridItem;
