"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleManagement from "@/containers/role/RoleManagement/RoleManagement";

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
