"use client";

import LearningPathProgress from "@/containers/learningPath/LearningPathProgress";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function MyLearningProgressPage({ params }: { params: { learningPathId: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <LearningPathProgress learningPathId={params.learningPathId} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}