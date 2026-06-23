import { useSelector } from "react-redux";

import type { RootState } from "@/redux/store";

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
interface HasRoleProps {
  roles: string[];
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

const HasRole = ({ roles, children, fallback = null }: HasRoleProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user?.role) return fallback;

  const hasRole = roles.includes(user.role);
  return hasRole ? children : fallback;
};

export default HasRole;
