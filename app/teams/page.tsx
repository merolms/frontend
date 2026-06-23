"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamContainer from "@/containers/team/Team";

export default function TeamsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["teams.view"]}>
        <RoleGuard roles={["Administrator", "Team Lead"]}>
          <TeamContainer />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
