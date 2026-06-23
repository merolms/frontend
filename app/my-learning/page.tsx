"use client";

import MyLearning from "@/containers/course/MyLearning/MyLearning";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function MyLearningPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <MyLearning />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}