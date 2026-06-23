"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import MyLearning from "@/containers/course/MyLearning/MyLearning";

export default function MyLearningPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <MyLearning />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
