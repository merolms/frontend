// Auth Service
// Authentication via backend API (JWT-based).
// All auth calls go through the centralized http client which handles
// JWT injection and the { message, data } response envelope.

import { apiPost, apiGet, apiPut } from "@/app/services/http";

// ==================== STATIC USERS (for role management UI) ====================
// These are reference data for the role/permission management pages.
// Login/Register go through the real backend API.

const staticUsers = [
  {
    id: 1,
    email: "admin@meroedu.com",
    password: "admin123",
    firstName: "John",
    lastName: "Doe",
    role: "Administrator",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "active",
    permissions: ["*"],
    joinedAt: "2024-01-01",
    lastActive: "2025-03-25",
    phone: "+1 555-0101",
    bio: "Platform administrator with full access.",
    coursesEnrolled: 5,
    coursesCompleted: 3,
    teams: ["Engineering", "Product"],
  },
  {
    id: 2,
    email: "instructor@meroedu.com",
    password: "instructor123",
    firstName: "Jane",
    lastName: "Smith",
    role: "Instructor",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "active",
    permissions: [
      "dashboard.view",
      "courses.view",
      "courses.create",
      "courses.edit",
      "users.view",
      "teams.view",
      "reports.view",
    ],
    joinedAt: "2024-02-15",
    lastActive: "2025-03-24",
    phone: "+1 555-0102",
    bio: "Experienced instructor specializing in web development.",
    coursesEnrolled: 12,
    coursesCompleted: 8,
    teams: ["Engineering"],
  },
  {
    id: 3,
    email: "teamlead@meroedu.com",
    password: "teamlead123",
    firstName: "Diana",
    lastName: "Prince",
    role: "Team Lead",
    avatar: "https://i.pravatar.cc/150?img=10",
    status: "active",
    permissions: [
      "dashboard.view",
      "courses.view",
      "courses.create",
      "users.view",
      "users.edit",
      "teams.view",
      "teams.edit",
      "teams.manage_members",
      "reports.view",
    ],
    joinedAt: "2024-03-01",
    lastActive: "2025-03-23",
    phone: "+1 555-0103",
    bio: "Team lead managing engineering teams.",
    coursesEnrolled: 8,
    coursesCompleted: 6,
    teams: ["Engineering", "Design"],
  },
  {
    id: 4,
    email: "student@meroedu.com",
    password: "student123",
    firstName: "Bob",
    lastName: "Wilson",
    role: "Student",
    avatar: "https://i.pravatar.cc/150?img=3",
    status: "active",
    permissions: ["dashboard.view", "courses.view"],
    joinedAt: "2024-06-01",
    lastActive: "2025-03-25",
    phone: "+1 555-0104",
    bio: "Student learning web development.",
    coursesEnrolled: 3,
    coursesCompleted: 1,
    teams: [],
  },
];

// ==================== ROLE DEFINITIONS ====================

const roleDefinitions = [
  {
    id: "role_admin",
    name: "Administrator",
    description: "Full access to all features and settings.",
    color: "red",
    permissions: ["*"],
  },
  {
    id: "role_instructor",
    name: "Instructor",
    description: "Can manage courses, view users and teams, and access reports.",
    color: "blue",
    permissions: [
      "dashboard.view",
      "courses.view",
      "courses.create",
      "courses.edit",
      "courses.delete",
      "courses.lessons.manage",
      "users.view",
      "teams.view",
      "reports.view",
    ],
  },
  {
    id: "role_team_lead",
    name: "Team Lead",
    description: "Can manage their team members and view team progress.",
    color: "purple",
    permissions: [
      "dashboard.view",
      "courses.view",
      "courses.create",
      "users.view",
      "users.edit",
      "teams.view",
      "teams.edit",
      "teams.manage_members",
      "reports.view",
    ],
  },
  {
    id: "role_student",
    name: "Student",
    description: "Can view dashboard and enrolled courses.",
    color: "teal",
    permissions: ["dashboard.view", "courses.view"],
  },
];

// ==================== PERMISSION CATALOG ====================

export const permissionCatalog = {
  dashboard: {
    label: "Dashboard",
    permissions: [{ key: "dashboard.view", label: "View Dashboard" }],
  },
  courses: {
    label: "Courses",
    permissions: [
      { key: "courses.view", label: "View Courses" },
      { key: "courses.create", label: "Create Courses" },
      { key: "courses.edit", label: "Edit Courses" },
      { key: "courses.delete", label: "Delete Courses" },
      { key: "courses.publish", label: "Publish / Archive Courses" },
      { key: "courses.lessons.manage", label: "Manage Course Lessons" },
    ],
  },
  users: {
    label: "Users",
    permissions: [
      { key: "users.view", label: "View Users" },
      { key: "users.create", label: "Create Users" },
      { key: "users.edit", label: "Edit Users" },
      { key: "users.delete", label: "Delete Users" },
      { key: "users.assign_roles", label: "Assign Roles" },
    ],
  },
  teams: {
    label: "Teams",
    permissions: [
      { key: "teams.view", label: "View Teams" },
      { key: "teams.create", label: "Create Teams" },
      { key: "teams.edit", label: "Edit Teams" },
      { key: "teams.delete", label: "Delete Teams" },
      { key: "teams.manage_members", label: "Manage Team Members" },
    ],
  },
  roles: {
    label: "Roles & Permissions",
    permissions: [
      { key: "roles.view", label: "View Roles" },
      { key: "roles.create", label: "Create Roles" },
      { key: "roles.edit", label: "Edit Roles" },
      { key: "roles.delete", label: "Delete Roles" },
    ],
  },
  reports: {
    label: "Reports",
    permissions: [
      { key: "reports.view", label: "View Reports" },
      { key: "reports.export", label: "Export Reports" },
    ],
  },
};

export const allPermissions = Object.values(permissionCatalog).flatMap(
  (domain) => domain.permissions
);

// ==================== AUTH FUNCTIONS (real backend API) ====================

/**
 * Login with email and password.
 * Backend POST /auth/login returns { token, user }.
 */
export const login = async (email, password) => {
  const data = await apiPost("/auth/login", { email, password });
  return { user: data.user, token: data.token };
};

/**
 * Register a new user account.
 * Backend POST /auth/register returns { token, user }.
 */
export const register = async (userData) => {
  const data = await apiPost("/auth/register", userData);
  return { user: data.user, token: data.token };
};

/**
 * Fetch the current user's profile from the backend.
 * Backend GET /auth/me returns the user object.
 */
export const getProfile = async () => {
  return await apiGet("/auth/me");
};

/**
 * Update the current user's profile.
 */
export const updateProfile = async (profileData) => {
  return await apiPut("/auth/profile", profileData);
};

/**
 * Change the current user's password.
 */
export const changePassword = async (passwordData) => {
  return await apiPut("/auth/password", passwordData);
};

/**
 * Validate a stored token by calling the backend.
 * Backend GET /auth/me validates the JWT and returns the user.
 */
export const validateToken = async () => {
  return await apiGet("/auth/me");
};

/**
 * Logout — client-side only (JWT is stateless).
 */
export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

// ==================== SESSION HELPERS ====================

export const storeAuth = (user, token) => {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const getStoredAuth = () => {
  try {
    const token = localStorage.getItem("auth_token");
    const user = JSON.parse(localStorage.getItem("auth_user") || "null");
    if (token && user) return { token, user };
  } catch {
    // ignore
  }
  return null;
};

// ==================== ROLES (real backend API) ====================

const normalizeRolePermissions = (role) => {
  if (!role) return role;
  return {
    ...role,
    permissions: Array.isArray(role.permissions)
      ? role.permissions
      : (role.permissions || "").split(",").filter(Boolean),
  };
};

export const fetchRoles = async () => {
  const data = await apiGet("/roles");
  if (!Array.isArray(data)) return [];
  return data.map(normalizeRolePermissions);
};

export const fetchRoleById = async (id) => {
  const data = await apiGet(`/roles/${id}`);
  return normalizeRolePermissions(data);
};

export const createRole = async (roleData) => {
  return await apiPost("/roles", roleData);
};

export const updateRole = async (id, roleData) => {
  return await apiPut(`/roles/${id}`, roleData);
};

export const deleteRole = async (id) => {
  return await apiDelete(`/roles/${id}`);
};

export const adminResetPassword = async (userId, newPassword) => {
  return await apiPost("/auth/admin/reset-password", { userId: parseInt(userId, 10), newPassword });
};

// ==================== ROLE DEFINITIONS (static UI data) ====================

export const getRoleDefinitions = () => Promise.resolve([...roleDefinitions]);

export const getRoleById = (id) => {
  const role = roleDefinitions.find((r) => r.id === id);
  return Promise.resolve(role ? { ...role } : null);
};

// ==================== PASSWORD RESET (mock - no backend endpoint yet) ====================

export const forgotPassword = async (email) => {
  await new Promise((r) => setTimeout(r, 500));
  return { message: "If an account with that email exists, a reset link has been sent." };
};

export const resetPassword = async (_token, _newPassword) => {
  await new Promise((r) => setTimeout(r, 400));
  return { message: "Password has been reset successfully." };
};

// ==================== PERMISSION HELPERS ====================

export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  if (user.permissions.includes("*")) return true;
  return user.permissions.includes(permission);
};

export const hasAllPermissions = (user, permissions) => {
  return permissions.every((p) => hasPermission(user, p));
};

export const hasAnyPermission = (user, permissions) => {
  return permissions.some((p) => hasPermission(user, p));
};

export const getRolePermissions = (roleName) => {
  const role = roleDefinitions.find((r) => r.name === roleName);
  return role ? role.permissions : [];
};

// Export static users for demo login page
export { staticUsers };

// ==================== DEMO: mockUpdateUser for Settings page ====================

export const mockUpdateUser = async (userId, updates) => {
  await new Promise((r) => setTimeout(r, 300));
  const user = staticUsers.find((u) => u.id === userId);
  if (user) {
    Object.assign(user, updates);
  }
  return user;
};
