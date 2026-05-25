// Team API Service
// Handles all API calls related to teams

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// ==================== TEAMS ====================

export const fetchTeams = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/teams?${queryParams}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const fetchTeamById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/teams/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const updateTeam = async (id, teamData) => {
  try {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const deleteTeam = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/teams/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

export const addMemberToTeam = async (teamId, userId) => {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

export const removeMemberFromTeam = async (teamId, userId) => {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

export const fetchTeamMembers = async (teamId) => {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

// ==================== MOCK DATA ====================

let mockTeams = [
  {
    id: 1,
    name: 'Team Alpha',
    description: 'Frontend development team focused on React and modern web technologies.',
    color: '#1976d2',
    status: 'active',
    leader: 'Diana Prince',
    leaderId: 6,
    memberCount: 3,
    members: [
      { id: 1, firstName: 'John', lastName: 'Doe', role: 'Administrator', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 6, firstName: 'Diana', lastName: 'Prince', role: 'Team Lead', avatar: 'https://i.pravatar.cc/150?img=10' },
    ],
    coursesAssigned: 5,
    avgProgress: 78,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Team Beta',
    description: 'Backend and API development team specializing in Node.js and cloud services.',
    color: '#7b1fa2',
    status: 'active',
    leader: 'Alice Johnson',
    leaderId: 4,
    memberCount: 3,
    members: [
      { id: 4, firstName: 'Alice', lastName: 'Johnson', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=9' },
      { id: 7, firstName: 'Eve', lastName: 'Adams', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=16' },
      { id: 8, firstName: 'Frank', lastName: 'Miller', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=12' },
    ],
    coursesAssigned: 3,
    avgProgress: 65,
    createdAt: '2024-02-01',
  },
  {
    id: 3,
    name: 'Team Gamma',
    description: 'Data science and machine learning team working on analytics projects.',
    color: '#e65100',
    status: 'active',
    leader: 'Bob Wilson',
    leaderId: 3,
    memberCount: 3,
    members: [
      { id: 3, firstName: 'Bob', lastName: 'Wilson', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=3' },
      { id: 7, firstName: 'Eve', lastName: 'Adams', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=16' },
      { id: 8, firstName: 'Frank', lastName: 'Miller', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=12' },
    ],
    coursesAssigned: 4,
    avgProgress: 52,
    createdAt: '2024-03-10',
  },
  {
    id: 4,
    name: 'Team Delta',
    description: 'UI/UX design team creating beautiful and accessible user experiences.',
    color: '#33a163',
    status: 'active',
    leader: 'Grace Lee',
    leaderId: 9,
    memberCount: 1,
    members: [
      { id: 9, firstName: 'Grace', lastName: 'Lee', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=20' },
    ],
    coursesAssigned: 2,
    avgProgress: 91,
    createdAt: '2024-05-10',
  },
  {
    id: 5,
    name: 'Team Epsilon',
    description: 'DevOps and infrastructure team managing CI/CD and cloud deployments.',
    color: '#c62828',
    status: 'inactive',
    leader: null,
    leaderId: null,
    memberCount: 0,
    members: [],
    coursesAssigned: 0,
    avgProgress: 0,
    createdAt: '2024-06-01',
  },
];

// All users available for team assignment
const mockAllUsers = [
  { id: 1, firstName: 'John', lastName: 'Doe', role: 'Administrator', avatar: 'https://i.pravatar.cc/150?img=1', email: 'john.doe@example.com' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=5', email: 'jane.smith@example.com' },
  { id: 3, firstName: 'Bob', lastName: 'Wilson', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=3', email: 'bob.wilson@example.com' },
  { id: 4, firstName: 'Alice', lastName: 'Johnson', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=9', email: 'alice.j@example.com' },
  { id: 5, firstName: 'Charlie', lastName: 'Brown', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=8', email: 'charlie.b@example.com' },
  { id: 6, firstName: 'Diana', lastName: 'Prince', role: 'Team Lead', avatar: 'https://i.pravatar.cc/150?img=10', email: 'diana.p@example.com' },
  { id: 7, firstName: 'Eve', lastName: 'Adams', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=16', email: 'eve.a@example.com' },
  { id: 8, firstName: 'Frank', lastName: 'Miller', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=12', email: 'frank.m@example.com' },
  { id: 9, firstName: 'Grace', lastName: 'Lee', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=20', email: 'grace.lee@example.com' },
  { id: 10, firstName: 'Henry', lastName: 'Davis', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=14', email: 'henry.d@example.com' },
];

// Mock API functions
export const mockFetchTeams = (params = {}) => {
  let results = [...mockTeams];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    results = results.filter((t) => t.status === params.status);
  }

  if (params.sort === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (params.sort === 'members') {
    results.sort((a, b) => b.memberCount - a.memberCount);
  } else if (params.sort === 'progress') {
    results.sort((a, b) => b.avgProgress - a.avgProgress);
  } else {
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 8;
  const total = results.length;
  const start = (page - 1) * limit;

  return Promise.resolve({
    teams: results.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const mockFetchTeamById = (id) => {
  const team = mockTeams.find((t) => t.id === parseInt(id));
  if (!team) return Promise.reject(new Error('Team not found'));
  return Promise.resolve({ ...team });
};

export const mockCreateTeam = (teamData) => {
  const newTeam = {
    ...teamData,
    id: Date.now(),
    status: 'active',
    memberCount: 0,
    members: [],
    coursesAssigned: 0,
    avgProgress: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };
  mockTeams.push(newTeam);
  return Promise.resolve(newTeam);
};

export const mockUpdateTeam = (id, teamData) => {
  const index = mockTeams.findIndex((t) => t.id === parseInt(id));
  if (index === -1) return Promise.reject(new Error('Team not found'));
  mockTeams[index] = { ...mockTeams[index], ...teamData };
  return Promise.resolve(mockTeams[index]);
};

export const mockDeleteTeam = (id) => {
  mockTeams = mockTeams.filter((t) => t.id !== parseInt(id));
  return Promise.resolve();
};

export const mockAddMemberToTeam = (teamId, userId) => {
  const team = mockTeams.find((t) => t.id === parseInt(teamId));
  const user = mockAllUsers.find((u) => u.id === parseInt(userId));
  if (!team || !user) return Promise.reject(new Error('Team or user not found'));
  if (team.members.find((m) => m.id === user.id)) return Promise.reject(new Error('User already in team'));
  team.members.push({ id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar: user.avatar });
  team.memberCount = team.members.length;
  return Promise.resolve(team);
};

export const mockRemoveMemberFromTeam = (teamId, userId) => {
  const team = mockTeams.find((t) => t.id === parseInt(teamId));
  if (!team) return Promise.reject(new Error('Team not found'));
  team.members = team.members.filter((m) => m.id !== parseInt(userId));
  team.memberCount = team.members.length;
  return Promise.resolve(team);
};

export const mockGetAvailableUsers = (teamId) => {
  const team = mockTeams.find((t) => t.id === parseInt(teamId));
  if (!team) return Promise.resolve([]);
  const memberIds = team.members.map((m) => m.id);
  return Promise.resolve(mockAllUsers.filter((u) => !memberIds.includes(u.id)));
};

export const mockTeamColors = ['#1976d2', '#7b1fa2', '#e65100', '#33a163', '#c62828', '#00838f', '#f57f17', '#4a148c'];
