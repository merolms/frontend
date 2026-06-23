"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserCreate from "@/containers/user/UserCreate/UserCreate";

export default function AdminUsersCreatePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <UserCreate />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
