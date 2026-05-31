import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import { hasPermission } from "@/app/services/authService";

/**
 * Redirects to /login if the user is not authenticated.
 * Optionally checks for specific permissions.
 */
export const ProtectedRoute = ({ children, permissions = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permissions.length > 0) {
    const hasAccess = permissions.every((p) => hasPermission(user, p));
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

/**
 * Conditionally renders children based on permissions.
 * If user lacks permission, renders fallback (or null).
 */
export const PermissionGuard = ({ permissions = [], children, fallback = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return fallback;
  if (permissions.length === 0) return children;

  const hasAccess = permissions.every((p) => hasPermission(user, p));
  return hasAccess ? children : fallback;
};

export default ProtectedRoute;
