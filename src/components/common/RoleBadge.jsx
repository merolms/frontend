import { getRoleColor, getRoleLabel } from "@/utils/roles";

/**
 * RoleBadge — Displays a user's role as a colored badge.
 *
 * Usage:
 *   <RoleBadge role={user.role} />
 *   <RoleBadge role={user.role} size="sm" />
 */
const RoleBadge = ({ role, size = "md" }) => {
  const label = getRoleLabel(role);
  const color = getRoleColor(role);

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-[11px] px-2 py-0.5",
    lg: "text-xs px-3 py-1",
  };

  const colorClasses = {
    red: "bg-red-500/10 text-red-500 border border-red-500/20",
    blue: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
    teal: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
    gray: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.gray}`}
    >
      {label}
    </span>
  );
};

export default RoleBadge;
