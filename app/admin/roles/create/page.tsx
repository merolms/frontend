"use client";

import RoleCreate from "@/containers/role/RoleCreate/RoleCreate";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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