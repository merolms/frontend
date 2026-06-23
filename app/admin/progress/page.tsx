"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProgressTracking from "@/containers/progress/AdminProgressTracking";

export default function AdminProgressPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <AdminProgressTracking />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
