"use client";

import Settings from "@/containers/user/Settings/Settings";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}