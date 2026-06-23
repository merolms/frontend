"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserContainer from "@/containers/user/User";

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
