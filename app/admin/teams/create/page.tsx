"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamCreate from "@/containers/team/TeamCreate/TeamCreate";

export default function AdminTeamsCreatePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <TeamCreate />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
