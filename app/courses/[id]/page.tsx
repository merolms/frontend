"use client";

import CourseDetail from "@/containers/course/CourseDetail/CourseDetail";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseDetail courseId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}