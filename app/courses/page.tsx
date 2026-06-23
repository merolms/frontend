"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseContainer from "@/containers/course/Course";

export default function CoursesPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseContainer />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
