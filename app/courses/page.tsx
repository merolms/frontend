"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import CourseContainer from "@/app/containers/course/Course";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function CoursesPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseContainer />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
