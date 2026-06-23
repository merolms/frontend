"use client";

import AdminProgressTracking from "@/containers/progress/AdminProgressTracking";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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