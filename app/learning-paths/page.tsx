"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LearningPathList from "@/containers/learningPath/LearningPathList";

export default function LearningPathsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <LearningPathList />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
