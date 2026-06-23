import { useSelector } from "react-redux";

import type { RootState } from "@/redux/store";
import { hasPermission } from "@/services/authService";

/**
 * Can — Conditionally renders children based on user permission.
 *
 * Usage:
 *   <Can permission="courses.create">
 *     <Button>Create Course</Button>
 *   </Can>
 *
 *   <Can permission="courses.edit" fallback={<span>Read only</span>}>
 *     <EditButton />
 *   </Can>
 *
 *   <Can permissions={["courses.edit", "courses.delete"]} match="all">
 *     <AdminActions />
 *   </Can>
 */
interface CanProps {
  permission?: string;
  permissions?: string[];
  match?: "any" | "all";
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

const Can = ({ permission, permissions, match = "any", children, fallback = null }: CanProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return fallback;

  // Super admin bypass
  if (user.permissions?.includes("*")) return children;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(user, permission);
  } else if (permissions && permissions.length > 0) {
    if (match === "all") {
      hasAccess = permissions.every((p) => hasPermission(user, p));
    } else {
      hasAccess = permissions.some((p) => hasPermission(user, p));
    }
  }

  return hasAccess ? children : fallback;
};

export default Can;
