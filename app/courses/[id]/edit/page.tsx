"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CourseEdit from "@/containers/course/CourseEdit";

export default function CourseEditPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.edit"]}>
        <RoleGuard roles={["Administrator", "Instructor"]}>
          <CourseEdit courseId={params.id} />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
