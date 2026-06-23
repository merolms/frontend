"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseDetail from "@/containers/course/CourseDetail/CourseDetail";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseDetail courseId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
