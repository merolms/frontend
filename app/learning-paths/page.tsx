"use client";

import LearningPathList from "@/containers/learningPath/LearningPathList";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function LearningPathsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <LearningPathList />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}