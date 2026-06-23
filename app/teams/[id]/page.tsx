"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamDetail from "@/containers/team/TeamDetail/TeamDetail";

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["teams.view"]}>
        <RoleGuard roles={["Administrator", "Team Lead"]}>
          <TeamDetail teamId={params.id} />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
