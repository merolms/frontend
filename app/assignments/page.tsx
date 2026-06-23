"use client";

import AssignmentContainer from "@/containers/assignment/Assignment";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AssignmentsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AssignmentContainer />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}