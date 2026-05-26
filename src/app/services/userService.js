// User API Service
// Handles all API calls related to users

import { apiGet, apiPost, apiPut, apiDelete } from '@/app/services/http';

// ==================== USERS ====================

export const fetchUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    return await apiGet(`/users?${queryParams}`);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUserById = async (id) => {
  try {
    return await apiGet(`/users/${id}`);
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    return await apiPost('/users', userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    return await apiPut(`/users/${id}`, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await apiDelete(`/users/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const assignUserToTeam = async (userId, teamId) => {
  try {
    return await apiPost(`/users/${userId}/teams`, { teamId });
  } catch (error) {
    console.error('Error assigning user to team:', error);
    throw error;
  }
};

export const removeUserFromTeam = async (userId, teamId) => {
  try {
    await apiDelete(`/users/${userId}/teams/${teamId}`);
  } catch (error) {
    console.error('Error removing user from team:', error);
    throw error;
  }
};

// ==================== MOCK DATA ====================

let mockUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=1',
    phone: '+1 555-0101',
    bio: 'Platform administrator with 5+ years of experience in ed-tech.',
    teams: ['Team Alpha', 'Team Beta'],
    joinedAt: '2024-01-15',
    lastActive: '2025-03-25',
    coursesEnrolled: 3,
    coursesCompleted: 1,
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'Instructor',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=5',
    phone: '+1 555-0102',
    bio: 'Senior instructor specializing in web development and design.',
    teams: ['Team Alpha'],
    joinedAt: '2024-02-01',
    lastActive: '2025-03-24',
    coursesEnrolled: 8,
    coursesCompleted: 5,
  },
  {
    id: 3,
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@example.com',
    role: 'Student',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=3',
    phone: '+1 555-0103',
    bio: 'Learning Python and data science.',
    teams: ['Team Gamma'],
    joinedAt: '2024-03-10',
    lastActive: '2025-03-23',
    coursesEnrolled: 4,
    coursesCompleted: 2,
  },
  {
    id: 4,
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.j@example.com',
    role: 'Instructor',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=9',
    phone: '+1 555-0104',
    bio: 'JavaScript expert and curriculum developer.',
    teams: ['Team Beta'],
    joinedAt: '2024-04-05',
    lastActive: '2025-03-25',
    coursesEnrolled: 6,
    coursesCompleted: 4,
  },
  {
    id: 5,
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie.b@example.com',
    role: 'Student',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?img=8',
    phone: '+1 555-0105',
    bio: 'Exploring cloud computing and DevOps.',
    teams: [],
    joinedAt: '2024-06-20',
    lastActive: '2025-01-10',
    coursesEnrolled: 2,
    coursesCompleted: 0,
  },
  {
    id: 6,
    firstName: 'Diana',
    lastName: 'Prince',
    email: 'diana.p@example.com',
    role: 'Team Lead',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=10',
    phone: '+1 555-0106',
    bio: 'Leading Team Alpha with a focus on frontend development.',
    teams: ['Team Alpha'],
    joinedAt: '2024-01-20',
    lastActive: '2025-03-25',
    coursesEnrolled: 10,
    coursesCompleted: 8,
  },
  {
    id: 7,
    firstName: 'Eve',
    lastName: 'Adams',
    email: 'eve.a@example.com',
    role: 'Student',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=16',
    phone: '+1 555-0107',
    bio: 'Backend development student.',
    teams: ['Team Beta', 'Team Gamma'],
    joinedAt: '2024-08-15',
    lastActive: '2025-03-22',
    coursesEnrolled: 5,
    coursesCompleted: 3,
  },
  {
    id: 8,
    firstName: 'Frank',
    lastName: 'Miller',
    email: 'frank.m@example.com',
    role: 'Student',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=12',
    phone: '+1 555-0108',
    bio: 'Full-stack development enthusiast.',
    teams: ['Team Gamma'],
    joinedAt: '2024-09-01',
    lastActive: '2025-03-20',
    coursesEnrolled: 3,
    coursesCompleted: 1,
  },
  {
    id: 9,
    firstName: 'Grace',
    lastName: 'Lee',
    email: 'grace.lee@example.com',
    role: 'Instructor',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=20',
    phone: '+1 555-0109',
    bio: 'UI/UX design instructor with industry experience.',
    teams: ['Team Delta'],
    joinedAt: '2024-05-10',
    lastActive: '2025-03-24',
    coursesEnrolled: 7,
    coursesCompleted: 6,
  },
  {
    id: 10,
    firstName: 'Henry',
    lastName: 'Davis',
    email: 'henry.d@example.com',
    role: 'Student',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?img=14',
    phone: '+1 555-0110',
    bio: 'Data science and machine learning student.',
    teams: [],
    joinedAt: '2024-11-01',
    lastActive: '2025-02-15',
    coursesEnrolled: 1,
    coursesCompleted: 0,
  },
];

const mockTeamsList = [
  { id: 1, name: 'Team Alpha' },
  { id: 2, name: 'Team Beta' },
  { id: 3, name: 'Team Gamma' },
  { id: 4, name: 'Team Delta' },
];

// Mock API functions
export const mockFetchUsers = (params = {}) => {
  let results = [...mockUsers];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }

  if (params.role) {
    results = results.filter((u) => u.role === params.role);
  }

  if (params.status) {
    results = results.filter((u) => u.status === params.status);
  }

  if (params.sort === 'name') {
    results.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  } else if (params.sort === 'email') {
    results.sort((a, b) => a.email.localeCompare(b.email));
  } else if (params.sort === 'joined') {
    results.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
  } else if (params.sort === 'lastActive') {
    results.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
  }

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 8;
  const total = results.length;
  const start = (page - 1) * limit;
  const paginatedResults = results.slice(start, start + limit);

  return Promise.resolve({
    users: paginatedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const mockFetchUserById = (id) => {
  const user = mockUsers.find((u) => u.id === parseInt(id));
  if (!user) return Promise.reject(new Error('User not found'));
  return Promise.resolve({ ...user });
};

export const mockCreateUser = (userData) => {
  const newUser = {
    ...userData,
    id: Date.now(),
    status: 'active',
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    teams: [],
    joinedAt: new Date().toISOString().split('T')[0],
    lastActive: new Date().toISOString().split('T')[0],
    coursesEnrolled: 0,
    coursesCompleted: 0,
  };
  mockUsers.push(newUser);
  return Promise.resolve(newUser);
};

export const mockUpdateUser = (id, userData) => {
  const index = mockUsers.findIndex((u) => u.id === parseInt(id));
  if (index === -1) return Promise.reject(new Error('User not found'));
  mockUsers[index] = { ...mockUsers[index], ...userData };
  return Promise.resolve(mockUsers[index]);
};

export const mockDeleteUser = (id) => {
  mockUsers = mockUsers.filter((u) => u.id !== parseInt(id));
  return Promise.resolve();
};

export const mockAssignUserToTeam = (userId, teamId) => {
  const user = mockUsers.find((u) => u.id === parseInt(userId));
  const team = mockTeamsList.find((t) => t.id === parseInt(teamId));
  if (!user || !team) return Promise.reject(new Error('User or team not found'));
  if (!user.teams.includes(team.name)) {
    user.teams.push(team.name);
  }
  return Promise.resolve(user);
};

export const mockRemoveUserFromTeam = (userId, teamId) => {
  const user = mockUsers.find((u) => u.id === parseInt(userId));
  const team = mockTeamsList.find((t) => t.id === parseInt(teamId));
  if (!user || !team) return Promise.reject(new Error('User or team not found'));
  user.teams = user.teams.filter((t) => t !== team.name);
  return Promise.resolve(user);
};

export const mockGetTeams = () => Promise.resolve(mockTeamsList);

export const mockRoles = ['Administrator', 'Instructor', 'Team Lead', 'Student'];
