"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LearningPathProgress from "@/containers/learningPath/LearningPathProgress";

export default function MyLearningProgressPage({ params }: { params: { learningPathId: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <LearningPathProgress learningPathId={params.learningPathId} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
