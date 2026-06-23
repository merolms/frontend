"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Settings from "@/containers/user/Settings/Settings";

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
