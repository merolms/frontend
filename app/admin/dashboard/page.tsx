"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminDashboard from "@/containers/admin/Dashboard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AdminDashboardPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <AdminDashboard />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
