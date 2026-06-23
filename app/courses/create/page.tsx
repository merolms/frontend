"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseCreate from "@/containers/course/CourseCreate/CourseCreate";

export default function CourseCreatePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.create"]}>
        <RoleGuard roles={["Administrator", "Instructor"]}>
          <CourseCreate />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
