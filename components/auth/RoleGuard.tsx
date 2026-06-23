"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { RootState } from "@/redux/store";

/**
 * RoleGuard — Route-level role guard. Redirects if user doesn't have required role.
 *
 * Usage:
 *   <RoleGuard roles={["Administrator"]}>
 *     <AdminDashboard />
 *   </RoleGuard>
 */
const RoleGuard = ({ roles, children }: { roles?: string[]; children: React.ReactNode }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (roles && roles.length > 0 && !roles.includes(user?.role)) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, roles, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return null;
  }

  return children;
};

export default RoleGuard;
export { RoleGuard };
