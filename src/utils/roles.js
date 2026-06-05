import { hasPermission } from "@/app/services/authService";

// ─── Role Detection ───────────────────────────────────────────────

export const isAdmin = (user) => user?.role === "Administrator";
export const isInstructor = (user) => user?.role === "Instructor";
export const isTeamLead = (user) => user?.role === "Team Lead";
export const isStudent = (user) => user?.role === "Student";

export const isAdminOrInstructor = (user) => ["Administrator", "Instructor"].includes(user?.role);

export const isAdminOrTeamLead = (user) => ["Administrator", "Team Lead"].includes(user?.role);

// ─── Permission Shortcuts ─────────────────────────────────────────

export const canManageCourses = (user) =>
  hasAnyPermission(user, ["courses.create", "courses.edit", "courses.delete"]);

export const canManageUsers = (user) =>
  hasAnyPermission(user, ["users.create", "users.edit", "users.delete"]);

export const canManageTeams = (user) =>
  hasAnyPermission(user, ["teams.create", "teams.edit", "teams.manage_members"]);

export const canManageRoles = (user) =>
  hasAnyPermission(user, ["roles.create", "roles.edit", "roles.delete"]);

export const canViewReports = (user) => hasPermission(user, "reports.view");

// ─── Helper ───────────────────────────────────────────────────────

export const hasAnyPermission = (user, permissions = []) => {
  if (!user?.permissions) return false;
  if (user.permissions.includes("*")) return true;
  return permissions.some((p) => user.permissions.includes(p));
};

export const hasAllPermissions = (user, permissions = []) => {
  if (!user?.permissions) return false;
  if (user.permissions.includes("*")) return true;
  return permissions.every((p) => user.permissions.includes(p));
};

// ─── Role Display ─────────────────────────────────────────────────

export const getRoleLabel = (role) => {
  const labels = {
    Administrator: "Admin",
    Instructor: "Instructor",
    "Team Lead": "Team Lead",
    Student: "Student",
  };
  return labels[role] || role || "Unknown";
};

export const getRoleColor = (role) => {
  const colors = {
    Administrator: "red",
    Instructor: "blue",
    "Team Lead": "purple",
    Student: "teal",
  };
  return colors[role] || "gray";
};

export const getRoleBadgeVariant = (role) => {
  const variants = {
    Administrator: "destructive",
    Instructor: "default",
    "Team Lead": "secondary",
    Student: "outline",
  };
  return variants[role] || "outline";
};
