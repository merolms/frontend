import React from 'react';
import { BookOpen, Clock, List, Star, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusLabel, getCategoryColor } from './viewHelpers';
import { t } from '@/styles/theme';

const CourseCard = ({ course, navigate }) => {
  const status = getStatusLabel(course.status);
  const slide = course.coverImage || (course.images?.[0]);

  return (
    <div
      className="rounded-lg border border-border bg-bg-surface shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      {/* Image */}
      {slide ? (
        <img src={slide} alt={course.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-bg-surface-active">
          <BookOpen size={48} className="text-text-muted" />
        </div>
      )}

      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Badge variant="default">{course.category}</Badge>
          <span className="text-[11px] text-text-muted flex items-center gap-1"><User size={10} /> {course.author}</span>
        </div>

        <h3 className="text-sm font-semibold text-text-primary line-clamp-2">{course.title}</h3>
        <p className="text-[11px] text-text-muted line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-3 mt-auto text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><List size={10} /> {course.totalLessons}</span>
          <span className="flex items-center gap-1"><User size={10} /> {course.enrolledUsers}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
        </div>

        {course.tags?.length > 0 && (
          <div className="flex items-center gap-1">
            {course.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="default" className="text-[10px]">{tag}</Badge>)}
            {course.tags.length > 3 && <Badge variant="default" className="text-[10px]">+{course.tags.length - 3}</Badge>}
          </div>
        )}

        {status && <Badge variant={status.color === 'grey' ? 'gray' : status.color}>{status.text}</Badge>}
      </div>
    </div>
  );
};

const GridView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-bg-surface overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} navigate={navigate} />
      ))}
    </div>
  );
};

export default GridView;
