"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import CourseViewer from "@/app/containers/course/CourseViewer";
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
