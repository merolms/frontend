"use client";

import LearningPathDetail from "@/containers/learningPath/LearningPathDetail";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function LearningPathDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <LearningPathDetail learningPathId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}