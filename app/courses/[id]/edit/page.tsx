"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import CourseEdit from "@/containers/course/CourseEdit";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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
