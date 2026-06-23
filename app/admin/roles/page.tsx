"use client";

import RoleManagement from "@/containers/role/RoleManagement/RoleManagement";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AdminRolesPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <RoleManagement />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}