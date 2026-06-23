import { getRoleColor, getRoleLabel } from "@/utils/roles";

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md" | "lg";
}

type RoleColor = "red" | "blue" | "purple" | "teal" | "gray";

const sizeClasses: Record<string, string> = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
};

const colorClasses: Record<RoleColor, string> = {
  red: "bg-red-500/10 text-red-600 border border-red-500/20 uppercase tracking-wider font-bold",
  blue: "bg-blue-500/10 text-blue-600 border border-blue-500/20 uppercase tracking-wider font-bold",
  purple:
    "bg-purple-500/10 text-purple-600 border border-purple-500/20 uppercase tracking-wider font-bold",
  teal: "bg-teal-500/10 text-teal-600 border border-teal-500/20 uppercase tracking-wider font-bold",
  gray: "bg-gray-500/10 text-gray-600 border border-gray-500/20 uppercase tracking-wider font-bold",
};

/**
 * RoleBadge — Displays a user's role as a colored badge.
 *
 * Usage:
 *   <RoleBadge role={user.role} />
 *   <RoleBadge role={user.role} size="sm" />
 */
const RoleBadge = ({ role, size = "md" }: RoleBadgeProps) => {
  const label = getRoleLabel(role);
  const color = getRoleColor(role) as RoleColor;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.gray}`}
    >
      {label}
    </span>
  );
};

export default RoleBadge;
