"use client";

import TeamContainer from "@/containers/team/Team";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AdminTeamsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <TeamContainer />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}