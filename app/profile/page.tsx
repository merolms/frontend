"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Profile from "@/containers/user/Profile/Profile";

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
