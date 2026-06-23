"use client";

import TeamCreate from "@/containers/team/TeamCreate/TeamCreate";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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