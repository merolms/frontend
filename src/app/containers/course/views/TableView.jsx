import React from 'react';
import { BookOpen, ChevronRight, List, Network, User, Users, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const TableView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Lessons</TableHead>
          <TableHead className="text-center">Enrolled</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => {
          const status = getStatusLabel(course.status);
          return (
            <TableRow key={course.id}>
              <TableCell>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage src={course.coverImage} />
                    <AvatarFallback>{(course.title?.[0] || 'C').toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-medium text-text-primary">{course.title}</div>
                    <div className="text-[11px] text-text-muted line-clamp-1">{course.description}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell><Badge variant={getCategoryColor(course.category)}>{course.category}</Badge></TableCell>
              <TableCell>{status && <Badge variant={status.color === 'grey' ? 'gray' : status.color}>{status.text}</Badge>}</TableCell>
              <TableCell className="text-center text-xs text-text-muted">{course.totalLessons}</TableCell>
              <TableCell className="text-center text-xs text-text-muted">{course.enrolledUsers}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Link to={`/courses/${course.id}`} className="text-[11px] text-primary hover:underline">View</Link>
                  <Link to={`/courses/${course.id}/builder`} className="text-[11px] text-primary hover:underline">Builder</Link>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TableView;
