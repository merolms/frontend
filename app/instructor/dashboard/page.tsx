"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorDashboard from "@/containers/instructor/Dashboard";

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
