import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckSquare, Square } from "lucide-react";

import { getCategoryColor, getStatusLabel } from "./viewHelpers";

const TableView = ({
  courses,
  navigate,
  loading,
  selectedIds = new Set(),
  onSelectOne,
  onSelectAll,
  viewMode,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">
            {viewMode === "table" && onSelectAll && (
              <button
                onClick={() => onSelectAll(selectedIds.size !== courses.length)}
                className="text-text-muted hover:text-text-primary"
              >
                {selectedIds.size === courses.length && courses.length > 0 ? (
                  <CheckSquare size={16} />
                ) : (
                  <Square size={16} />
                )}
              </button>
            )}
          </TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Lessons</TableHead>
          <TableHead className="text-center">Enrolled</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => {
          const status = getStatusLabel(course.status);
          return (
            <TableRow key={course.id}>
              <TableCell className="text-center">
                {viewMode === "table" && onSelectOne && (
                  <button
                    onClick={() => onSelectOne(course.id, !selectedIds.has(course.id))}
                    className="text-text-muted hover:text-text-primary"
                  >
                    {selectedIds.has(course.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                )}
              </TableCell>
              <TableCell>
                <div
                  className="flex cursor-pointer items-center gap-3"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage
                      src={
                        course.coverImage ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop"
                      }
                    />
                    <AvatarFallback>{(course.title?.[0] || "C").toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-text-primary text-xs font-medium">{course.title}</div>
                    <div className="text-text-muted line-clamp-1 text-[11px]">
                      {course.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getCategoryColor(course.category)}>{course.category}</Badge>
              </TableCell>
              <TableCell>
                {status && (
                  <Badge variant={status.color === "grey" ? "gray" : status.color}>
                    {status.text}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-text-muted text-center text-xs">
                {course.totalLessons}
              </TableCell>
              <TableCell className="text-text-muted text-center text-xs">
                {course.enrolledUsers}
              </TableCell>
              <TableCell className="text-text-muted text-xs">
                {course.createdAt
                  ? new Date(course.createdAt).toLocaleDateString()
                  : course.createdDate
                  ? new Date(course.createdDate).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell className="text-text-muted text-xs">
                {course.updatedAt
                  ? new Date(course.updatedAt).toLocaleDateString()
                  : course.lastUpdated
                  ? new Date(course.lastUpdated).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-primary text-[11px] hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    to={`/courses/${course.id}/builder`}
                    className="text-primary text-[11px] hover:underline"
                  >
                    Builder
                  </Link>
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
