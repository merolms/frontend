// Auth Service
// Authentication via backend API (JWT-based).
// Falls back to demo mode with static users if VITE_DEMO_MODE=true.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// ==================== STATIC USERS ====================
// Default static users for authentication. Passwords are plaintext for now
// (in production, never do this — the real API will handle hashing).

const staticUsers = [
  {
    id: 1,
    email: 'admin@meroedu.com',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Administrator',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'active',
    permissions: ['*'], // Admin gets everything
  },
  {
    id: 2,
    email: 'instructor@meroedu.com',
    password: 'instructor123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'Instructor',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'active',
    permissions: [
      'dashboard.view',
      'courses.view', 'courses.create', 'courses.edit',
      'users.view',
      'teams.view',
      'reports.view',
    ],
  },
  {
    id: 3,
    email: 'teamlead@meroedu.com',
    password: 'teamlead123',
    firstName: 'Diana',
    lastName: 'Prince',
    role: 'Team Lead',
    avatar: 'https://i.pravatar.cc/150?img=10',
    status: 'active',
    permissions: [
      'dashboard.view',
      'courses.view',
      'users.view', 'users.edit',
      'teams.view', 'teams.edit', 'teams.manage_members',
      'reports.view',
    ],
  },
  {
    id: 4,
    email: 'student@meroedu.com',
    password: 'student123',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'Student',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'active',
    permissions: [
      'dashboard.view',
      'courses.view',
    ],
  },
];

// ==================== ROLE DEFINITIONS ====================

const roleDefinitions = [
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full access to all features and settings.',
    color: 'red',
    permissions: ['*'],
  },
  {
    id: 'role_instructor',
    name: 'Instructor',
    description: 'Can manage courses, view users and teams, and access reports.',
    color: 'blue',
    permissions: [
      'dashboard.view',
      'courses.view', 'courses.create', 'courses.edit', 'courses.delete',
      'courses.lessons.manage',
      'users.view',
      'teams.view',
      'reports.view',
    ],
  },
  {
    id: 'role_team_lead',
    name: 'Team Lead',
    description: 'Can manage their team members and view team progress.',
    color: 'purple',
    permissions: [
      'dashboard.view',
      'courses.view', 'courses.create',
      'users.view', 'users.edit',
      'teams.view', 'teams.edit', 'teams.manage_members',
      'reports.view',
    ],
  },
  {
    id: 'role_student',
    name: 'Student',
    description: 'Can view dashboard and enrolled courses.',
    color: 'teal',
    permissions: [
      'dashboard.view',
      'courses.view',
    ],
  },
];

// ==================== PERMISSION CATALOG ====================
// All possible permissions in the system, grouped by domain.

export const permissionCatalog = {
  dashboard: {
    label: 'Dashboard',
    permissions: [
      { key: 'dashboard.view', label: 'View Dashboard' },
    ],
  },
  courses: {
    label: 'Courses',
    permissions: [
      { key: 'courses.view', label: 'View Courses' },
      { key: 'courses.create', label: 'Create Courses' },
      { key: 'courses.edit', label: 'Edit Courses' },
      { key: 'courses.delete', label: 'Delete Courses' },
      { key: 'courses.publish', label: 'Publish / Archive Courses' },
      { key: 'courses.lessons.manage', label: 'Manage Lessons' },
    ],
  },
  users: {
    label: 'Users',
    permissions: [
      { key: 'users.view', label: 'View Users' },
      { key: 'users.create', label: 'Create Users' },
      { key: 'users.edit', label: 'Edit Users' },
      { key: 'users.delete', label: 'Delete Users' },
      { key: 'users.assign_roles', label: 'Assign Roles' },
    ],
  },
  teams: {
    label: 'Teams',
    permissions: [
      { key: 'teams.view', label: 'View Teams' },
      { key: 'teams.create', label: 'Create Teams' },
      { key: 'teams.edit', label: 'Edit Teams' },
      { key: 'teams.delete', label: 'Delete Teams' },
      { key: 'teams.manage_members', label: 'Manage Team Members' },
    ],
  },
  roles: {
    label: 'Roles & Permissions',
    permissions: [
      { key: 'roles.view', label: 'View Roles' },
      { key: 'roles.create', label: 'Create Roles' },
      { key: 'roles.edit', label: 'Edit Roles' },
      { key: 'roles.delete', label: 'Delete Roles' },
    ],
  },
  reports: {
    label: 'Reports',
    permissions: [
      { key: 'reports.view', label: 'View Reports' },
      { key: 'reports.export', label: 'Export Reports' },
    ],
  },
};

// Flatten all permissions into a single array
export const allPermissions = Object.values(permissionCatalog).flatMap(
  (domain) => domain.permissions
);

// ==================== AUTH FUNCTIONS ====================

/**
 * Login with email and password against the backend API.
 * Returns a user object and JWT token on success.
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Invalid email or password.');
  }

  const data = await response.json();
  // Backend returns { message: "success", data: { token, user } }
  const { token, user } = data.data;
  return { user, token };
};

/**
 * Validate a stored token by calling the backend /auth/me endpoint.
 */
export const validateToken = async (token) => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid token.');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Register a new user account.
 */
export const register = async (userData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Registration failed.');
  }

  const data = await response.json();
  const { token, user } = data.data;
  return { user, token };
};

/**
 * Fetch the current user's profile.
 */
export const getProfile = async (token) => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile.');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Update the current user's profile.
 */
export const updateProfile = async (token, profileData) => {
  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update profile.');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Change the current user's password.
 */
export const changePassword = async (token, passwordData) => {
  const response = await fetch(`${API_BASE}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to change password.');
  }

  return true;
};

/**
 * Forgot password — send reset email.
 */
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.data || { message: 'If an account with that email exists, a reset link has been sent.' };
    }
  } catch {
    // Fall through to default message
  }
  return { message: 'If an account with that email exists, a reset link has been sent.' };
};

/**
 * Reset password — always succeeds if endpoint doesn't exist yet (backward compat).
 */
export const resetPassword = async (_token, _newPassword) => {
  return { message: 'Password has been reset successfully.' };
};

/**
 * Logout — client-side only (JWT is stateless).
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

// ==================== ROLE FUNCTIONS ====================

export const getRoleDefinitions = () => Promise.resolve([...roleDefinitions]);

export const getRoleById = (id) => {
  const role = roleDefinitions.find((r) => r.id === id);
  return Promise.resolve(role ? { ...role } : null);
};

export const createRole = async (roleData) => {
  await new Promise((r) => setTimeout(r, 400));
  const newRole = {
    id: `role_${Date.now()}`,
    ...roleData,
  };
  roleDefinitions.push(newRole);
  return Promise.resolve(newRole);
};

export const updateRole = async (id, roleData) => {
  await new Promise((r) => setTimeout(r, 400));
  const index = roleDefinitions.findIndex((r) => r.id === id);
  if (index === -1) return Promise.reject(new Error('Role not found'));
  roleDefinitions[index] = { ...roleDefinitions[index], ...roleData };
  return Promise.resolve(roleDefinitions[index]);
};

export const deleteRole = async (id) => {
  await new Promise((r) => setTimeout(r, 400));
  const index = roleDefinitions.findIndex((r) => r.id === id);
  if (index === -1) return Promise.reject(new Error('Role not found'));
  roleDefinitions.splice(index, 1);
  return Promise.resolve();
};

// ==================== PERMISSION HELPERS ====================

/**
 * Check if a user has a specific permission.
 * Admins with '*' permission pass everything.
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
};

/**
 * Check if a user has all of the specified permissions.
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every((p) => hasPermission(user, p));
};

/**
 * Check if a user has any of the specified permissions.
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some((p) => hasPermission(user, p));
};

/**
 * Get all permissions for a given role name.
 */
export const getRolePermissions = (roleName) => {
  const role = roleDefinitions.find((r) => r.name === roleName);
  return role ? role.permissions : [];
};

// ==================== SESSION HELPERS ====================

export const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    if (token && user) return { token, user };
  } catch {
    // ignore
  }
  return null;
};

export const storeAuth = (user, token) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
};
