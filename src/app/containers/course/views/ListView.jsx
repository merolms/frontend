import React from 'react';
import { BookOpen, Clock, List, Pencil, Network, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Paper } from '@/components/ui/card';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

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
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 min-w-0">
                {course.coverImage ? (
                  <img src={course.coverImage} alt={course.title} className="w-32 h-20 object-cover rounded-md shrink-0" />
                ) : (
                  <div className="w-32 h-20 rounded-md bg-bg-surface-active flex items-center justify-center shrink-0">
                    <BookOpen size={24} className="text-text-muted" />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">{course.title}</h3>
                  {status && <Badge variant={status.color === 'grey' ? 'gray' : status.color}>{status.text}</Badge>}
                  <p className="text-xs text-text-muted line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <Badge variant={getCategoryColor(course.category)} className="text-[10px]">{course.category}</Badge>
                    <span className="flex items-center gap-1"><User size={10} /> {course.author}</span>
                    <span className="flex items-center gap-1"><List size={10} /> {course.totalLessons}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {course.enrolledUsers}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={`/courses/${course.id}/builder`}
                  className="text-[11px] px-2 py-1 rounded border border-border text-text-muted hover:bg-bg-surface-active"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Network size={10} /> Builder
                </Link>
                <Link
                  to={`/courses/${course.id}/edit`}
                  className="text-[11px] px-2 py-1 rounded border border-border text-text-muted hover:bg-bg-surface-active"
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
