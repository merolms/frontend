"use client";

import UserContainer from "@/containers/user/User";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AdminUsersPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <UserContainer />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}