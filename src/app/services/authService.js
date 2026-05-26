// Auth Service
// Authentication via backend API (JWT-based).
// Falls back to demo mode with static users if VITE_DEMO_MODE=true or backend is unreachable.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.DEV;

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
    permissions: ['*'],
    joinedAt: '2024-01-01',
    lastActive: '2025-03-25',
    phone: '+1 555-0101',
    bio: 'Platform administrator with full access.',
    coursesEnrolled: 5,
    coursesCompleted: 3,
    teams: ['Engineering', 'Product'],
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
    joinedAt: '2024-02-15',
    lastActive: '2025-03-24',
    phone: '+1 555-0102',
    bio: 'Experienced instructor specializing in web development.',
    coursesEnrolled: 12,
    coursesCompleted: 8,
    teams: ['Engineering'],
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
    joinedAt: '2024-03-01',
    lastActive: '2025-03-23',
    phone: '+1 555-0103',
    bio: 'Team lead managing engineering teams.',
    coursesEnrolled: 8,
    coursesCompleted: 6,
    teams: ['Engineering', 'Design'],
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
    joinedAt: '2024-06-01',
    lastActive: '2025-03-25',
    phone: '+1 555-0104',
    bio: 'Student learning web development.',
    coursesEnrolled: 3,
    coursesCompleted: 1,
    teams: [],
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

// ==================== DEMO HELPER ====================

const generateDemoToken = (user) => {
  return btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
};

const findStaticUser = (email) => {
  return staticUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
};

// ==================== AUTH FUNCTIONS ====================

/**
 * Login with email and password.
 * In demo mode or when backend is unreachable, uses static users.
 */
export const login = async (email, password) => {
  // Try backend first (unless in explicit demo mode)
  if (!DEMO_MODE) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data.data;
        return { user, token };
      }

      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Invalid email or password.');
    } catch (err) {
      // If it's a network error, fall through to demo mode
      if (err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      // Network failed — fall through to demo fallback
    }
  }

  // Demo mode: authenticate against static users
  await new Promise((r) => setTimeout(r, 500)); // Simulate network delay

  const user = findStaticUser(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const token = generateDemoToken(user);
  return { user, token };
};

/**
 * Validate a stored token.
 * In demo mode, decodes the base64 token and looks up the static user.
 */
export const validateToken = async (token) => {
  if (!DEMO_MODE) {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      throw new Error('Invalid token.');
    } catch (err) {
      if (err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      // Fall through to demo
    }
  }

  // Demo mode: decode base64 token
  try {
    const payload = JSON.parse(atob(token));
    const user = staticUsers.find((u) => u.id === payload.userId);
    if (!user) throw new Error('User not found.');
    return user;
  } catch {
    throw new Error('Invalid token.');
  }
};

/**
 * Register a new user account.
 */
export const register = async (userData) => {
  if (!DEMO_MODE) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data.data;
        return { user, token };
      }

      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Registration failed.');
    } catch (err) {
      if (err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
    }
  }

  // Demo mode
  await new Promise((r) => setTimeout(r, 500));
  const existing = findStaticUser(userData.email);
  if (existing) throw new Error('An account with this email already exists.');

  const newUser = {
    id: staticUsers.length + 1,
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    role: 'Student',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'active',
    permissions: ['dashboard.view', 'courses.view'],
    joinedAt: new Date().toISOString().split('T')[0],
    lastActive: new Date().toISOString().split('T')[0],
  };
  staticUsers.push(newUser);
  const token = generateDemoToken(newUser);
  return { user: newUser, token };
};

/**
 * Fetch the current user's profile.
 */
export const getProfile = async (token) => {
  if (!DEMO_MODE) {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      throw new Error('Failed to fetch profile.');
    } catch (err) {
      if (err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
    }
  }
  return validateToken(token);
};

/**
 * Update the current user's profile.
 */
export const updateProfile = async (_token, profileData) => {
  await new Promise((r) => setTimeout(r, 400));
  // In demo mode, just return the updated data
  return { ...profileData };
};

/**
 * Change the current user's password.
 */
export const changePassword = async (_token, _passwordData) => {
  await new Promise((r) => setTimeout(r, 400));
  return true;
};

/**
 * Forgot password — send reset email.
 */
export const forgotPassword = async (email) => {
  if (!DEMO_MODE) {
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
      // Fall through
    }
  }

  await new Promise((r) => setTimeout(r, 500));
  return { message: 'If an account with that email exists, a reset link has been sent.' };
};

/**
 * Reset password.
 */
export const resetPassword = async (_token, _newPassword) => {
  await new Promise((r) => setTimeout(r, 400));
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
  const newRole = { id: `role_${Date.now()}`, ...roleData };
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

export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  if (user.permissions.includes('*')) return true;
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

// ==================== DEMO: mockUpdateUser for Settings page ====================

export const mockUpdateUser = async (userId, updates) => {
  await new Promise((r) => setTimeout(r, 300));
  const user = staticUsers.find((u) => u.id === userId);
  if (user) {
    Object.assign(user, updates);
  }
  return user;
};

// Export static users for demo login page
export { staticUsers };
