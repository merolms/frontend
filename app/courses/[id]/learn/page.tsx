"use client";

import CourseViewer from "@/containers/course/CourseViewer/CourseViewer";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function CourseLearnPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseViewer courseId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}