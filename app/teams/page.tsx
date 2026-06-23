"use client";

import TeamContainer from "@/containers/team/Team";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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