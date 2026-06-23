"use client";

import AssignmentCreate from "@/containers/assignment/AssignmentCreate";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AssignmentCreatePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AssignmentCreate />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}