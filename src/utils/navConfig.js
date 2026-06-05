import {
  BarChart3,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Home,
  Network,
  Shield,
  Tags,
  Users,
  Layers,
  Presentation,
} from "lucide-react";

/**
 * Sidebar navigation configuration grouped by role.
 * Role keys match the backend role names exactly.
 */

const NAV_GROUPS = {
  Administrator: [
    { path: "/admin/dashboard", label: "Dashboard", icon: Home },
    { path: "/courses", label: "Courses", icon: BookOpen },
    { path: "/learning-paths", label: "Learning Paths", icon: GraduationCap },
    { path: "/admin/categories", label: "Categories", icon: Tags },
    { path: "/admin/events", label: "Events", icon: CalendarDays },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/teams", label: "Teams", icon: Network },
    { path: "/admin/roles", label: "Roles", icon: Shield },
    { path: "/admin/progress", label: "Progress", icon: BarChart3 },
  ],
  Instructor: [
    { path: "/instructor/dashboard", label: "Dashboard", icon: Home },
    { path: "/courses", label: "My Courses", icon: BookOpen },
    { path: "/learning-paths", label: "Learning Paths", icon: GraduationCap },
    { path: "/my-learning", label: "My Learning", icon: BookOpen },
    { path: "/progress", label: "My Progress", icon: BarChart3 },
  ],
  "Team Lead": [
    { path: "/my-learning", label: "Dashboard", icon: Home },
    { path: "/courses", label: "My Courses", icon: BookOpen },
    { path: "/learning-paths", label: "Learning Paths", icon: GraduationCap },

    { path: "/teams", label: "My Teams", icon: Network },
    { path: "/progress", label: "My Progress", icon: BarChart3 },
  ],
  Student: [
    { path: "/my-learning", label: "My Learning", icon: Home },
    { path: "/courses", label: "Browse Courses", icon: BookOpen },
    { path: "/learning-paths", label: "Learning Paths", icon: GraduationCap },

    { path: "/progress", label: "My Progress", icon: BarChart3 },
  ],
};

/**
 * Get nav items for a specific role.
 */
export const getNavItemsForRole = (role) => {
  return NAV_GROUPS[role] || NAV_GROUPS.Student;
};

/**
 * Get all nav items that a user should see based on their role.
 */
export const getUserNavItems = (user) => {
  if (!user?.role) return [];
  return getNavItemsForRole(user.role);
};
