"use client";

import CourseContainer from "@/containers/course/Course";
import ProtectedRoute from "@/components/ProtectedRoute";
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