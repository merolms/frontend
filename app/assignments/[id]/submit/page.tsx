"use client";

import AssignmentSubmit from "@/containers/assignment/AssignmentSubmit";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AssignmentSubmitPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AssignmentSubmit assignmentId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}