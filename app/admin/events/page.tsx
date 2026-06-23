"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import EventsPage from "@/containers/event/EventsPage";

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
