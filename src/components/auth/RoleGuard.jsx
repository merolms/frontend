import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * RoleGuard — Route-level role guard. Redirects if user doesn't have required role.
 *
 * Usage:
 *   <Route path="/admin" element={
 *     <RoleGuard roles={["Administrator"]}>
 *       <AdminDashboard />
 *     </RoleGuard>
 *   } />
 */
const RoleGuard = ({ roles, children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleGuard;
