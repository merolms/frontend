"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import CategoryManagement from "@/containers/category/CategoryManagement/CategoryManagement";

export default function AdminCategoriesPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <CategoryManagement />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
