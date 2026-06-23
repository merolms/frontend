"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LearningPathDetail from "@/containers/learningPath/LearningPathDetail";

export default function LearningPathDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <LearningPathDetail learningPathId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
