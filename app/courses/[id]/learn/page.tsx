"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseViewer from "@/containers/course/CourseViewer/CourseViewer";

export default function CourseLearnPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseViewer courseId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
