"use client";

import InstructorDashboard from "@/containers/instructor/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function InstructorDashboardPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["courses.view"]}>
        <RoleGuard roles={["Administrator", "Instructor"]}>
          <InstructorDashboard />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}