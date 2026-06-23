"use client";

import Profile from "@/containers/user/Profile/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}