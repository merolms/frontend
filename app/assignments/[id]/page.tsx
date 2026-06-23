"use client";

import AssignmentDetail from "@/containers/assignment/AssignmentDetail";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AssignmentDetail assignmentId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}