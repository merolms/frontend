"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminDashboard from "@/containers/admin/Dashboard";

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
