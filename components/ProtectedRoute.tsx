"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/redux/store";
import { hasPermission } from "@/services/authService";

/**
 * Redirects to /login if the user is not authenticated.
 * Optionally checks for specific permissions.
 */
export const ProtectedRoute = ({
  children,
  permissions = [],
}: {
  children: React.ReactNode;
  permissions?: string[];
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (permissions.length > 0) {
      const hasAccess = permissions.every((p) => hasPermission(user, p));
      if (!hasAccess) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, user, permissions, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (permissions.length > 0) {
    const hasAccess = permissions.every((p) => hasPermission(user, p));
    if (!hasAccess) {
      return null;
    }
  }

  return children;
};

/**
 * Conditionally renders children based on permissions.
 * If user lacks permission, renders fallback (or null).
 */
export const PermissionGuard = ({
  permissions = [],
  children,
  fallback = null,
}: {
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) return fallback;
  if (permissions.length === 0) return children;

  const hasAccess = permissions.every((p) => hasPermission(user, p));
  return hasAccess ? children : fallback;
};

export default ProtectedRoute;
