"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamEdit from "@/containers/team/TeamEdit/TeamEdit";

export default function TeamEditPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["teams.view"]}>
        <RoleGuard roles={["Administrator", "Team Lead"]}>
          <TeamEdit teamId={params.id} />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
