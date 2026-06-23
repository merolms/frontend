"use client";

import TeamCreate from "@/containers/team/TeamCreate/TeamCreate";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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