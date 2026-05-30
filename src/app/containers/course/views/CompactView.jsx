import React from 'react';
import { BookOpen, List, Pencil, Network, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const CompactView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-8 w-full" />
        {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-bg-surface-active text-[11px] font-medium text-text-muted border-b border-border">
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
            className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-border hover:bg-bg-surface-hover cursor-pointer transition-colors items-center"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <div className="col-span-5 flex items-center gap-2">
              <BookOpen size={12} className="text-text-muted shrink-0" />
              <span className="text-xs text-text-primary truncate">{course.title}</span>
            </div>
            <div className="col-span-2"><Badge variant={getCategoryColor(course.category)} className="text-[10px]">{course.category}</Badge></div>
            <div className="col-span-1">{status && <Badge variant={status.color === 'grey' ? 'gray' : status.color} className="text-[10px]">{status.text}</Badge>}</div>
            <div className="col-span-1 text-center text-[11px] text-text-muted">{course.totalLessons}</div>
            <div className="col-span-1 text-center text-[11px] text-text-muted">{course.enrolledUsers}</div>
            <div className="col-span-2 flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Link to={`/courses/${course.id}/builder`} className="text-[10px] px-1.5 py-0.5 rounded border border-border text-text-muted hover:bg-bg-surface-active" onClick={(e) => e.stopPropagation()}>Builder</Link>
              <Link to={`/courses/${course.id}/edit`} className="text-[10px] px-1.5 py-0.5 rounded border border-border text-text-muted hover:bg-bg-surface-active" onClick={(e) => e.stopPropagation()}>Edit</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompactView;
