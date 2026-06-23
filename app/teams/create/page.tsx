"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamCreate from "@/containers/team/TeamCreate/TeamCreate";

export default function TeamsCreatePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["teams.view"]}>
        <RoleGuard roles={["Administrator", "Team Lead"]}>
          <TeamCreate />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
