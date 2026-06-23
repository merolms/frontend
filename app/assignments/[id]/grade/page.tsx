"use client";

import AssignmentGrade from "@/containers/assignment/AssignmentGrade";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AssignmentGradePage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AssignmentGrade assignmentId={params.id} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}