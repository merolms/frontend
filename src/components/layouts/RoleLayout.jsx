import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import RoleBasedSidebar from "./RoleBasedSidebar";

/**
 * RoleLayout — Automatically renders the appropriate layout based on user role.
 * All authenticated users get the role-based sidebar.
 * Unauthenticated users are redirected to login.
 */
const RoleLayout = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <RoleBasedSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};

export default RoleLayout;
