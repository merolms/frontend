"use client";

import CategoryManagement from "@/containers/category/CategoryManagement/CategoryManagement";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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