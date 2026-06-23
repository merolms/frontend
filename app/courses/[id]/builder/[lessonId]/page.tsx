"use client";

import CourseBuilder from "@/containers/course/CourseBuilder/CourseBuilder";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function CourseBuilderPage({ params }: { params: { id: string; lessonId?: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.lessons.manage"]}>
        <RoleGuard roles={["Administrator", "Instructor"]}>
          <CourseBuilder courseId={params.id} lessonId={params.lessonId} />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}