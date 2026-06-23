"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleCreate from "@/containers/role/RoleCreate/RoleCreate";

export default function AdminRolesCreatePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <RoleCreate />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
