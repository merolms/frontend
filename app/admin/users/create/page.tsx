"use client";

import UserCreate from "@/containers/user/UserCreate/UserCreate";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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