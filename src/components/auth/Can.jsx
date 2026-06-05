import { useSelector } from "react-redux";

import { hasPermission } from "@/app/services/authService";

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
const Can = ({ permission, permissions, match = "any", children, fallback = null }) => {
  const { user } = useSelector((state) => state.auth);

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
