"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleEdit from "@/containers/role/RoleEdit/RoleEdit";

export default function AdminRoleEditPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <RoleEdit roleId={params.id} />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
