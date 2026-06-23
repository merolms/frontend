"use client";

import EventsPage from "@/containers/event/EventsPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AdminEventsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>
          <EventsPage />
        </RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}