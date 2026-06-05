import { useSelector } from "react-redux";

/**
 * HasRole — Conditionally renders children based on user role.
 *
 * Usage:
 *   <HasRole roles={["Administrator", "Instructor"]}>
 *     <AdminPanel />
 *   </HasRole>
 *
 *   <HasRole roles={["Student"]} fallback={<p>Admin only</p>}>
 *     <StudentView />
 *   </HasRole>
 */
const HasRole = ({ roles, children, fallback = null }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user?.role) return fallback;

  const hasRole = roles.includes(user.role);
  return hasRole ? children : fallback;
};

export default HasRole;
