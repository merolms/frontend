"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseBuilder from "@/containers/course/CourseBuilder/CourseBuilder";

export default function CourseBuilderPage({
  params,
}: {
  params: { id: string; lessonId?: string };
}) {
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
