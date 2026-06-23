"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LearningPathForm from "@/containers/learningPath/LearningPathForm";

export default function LearningPathCreatePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <RoleGuard roles={["Administrator", "Instructor"]}>
          <LearningPathForm />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
