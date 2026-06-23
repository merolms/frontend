"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import CourseDetail from "@/app/containers/course/CourseDetail";
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
