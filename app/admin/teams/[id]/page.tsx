"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamDetail from "@/containers/team/TeamDetail/TeamDetail";

export default function AdminTeamDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <TeamDetail teamId={params.id} />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
