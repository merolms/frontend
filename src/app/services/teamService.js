// Team API Service
// Handles all API calls related to teams
// Backend response envelope: { message: "success", data: ... }

import { apiGet, apiPost, apiPut, apiDelete } from '@/app/services/http';

// ==================== TEAMS ====================
// GET /teams?start=0&limit=10  → returns Team[] (array in data)
// GET /teams/{id}             → returns Team (single object in data)
// POST /teams                 → body: { name, description, color, status }, returns Team
// PUT /teams/{id}             → body: Team, returns Team
// DELETE /teams/{id}          → returns "Team deleted successfully"

export const fetchTeams = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set('start', params.start);
    if (params.limit !== undefined) queryParams.set('limit', params.limit);
    const data = await apiGet(`/teams?${queryParams}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const fetchTeamById = async (id) => {
  try {
    return await apiGet(`/teams/${id}`);
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const createTeam = async (teamData) => {
  try {
    const body = {
      name: teamData.name || '',
      description: teamData.description || '',
      color: teamData.color || '#2185d0',
      status: teamData.status !== undefined ? teamData.status : 1,
    };
    return await apiPost('/teams', body);
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const updateTeam = async (id, teamData) => {
  try {
    const body = {
      id: parseInt(id),
      name: teamData.name || '',
      description: teamData.description || '',
      color: teamData.color || '#2185d0',
      status: teamData.status !== undefined ? teamData.status : 1,
    };
    return await apiPut(`/teams/${id}`, body);
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const deleteTeam = async (id) => {
  try {
    await apiDelete(`/teams/${id}`);
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

// ==================== TEAM MEMBERS (not yet supported by backend) ====================
// The backend doesn't have /teams/{id}/members endpoints yet.
// These are stubs that return empty data gracefully.

export const getAvailableUsers = async () => {
  return [];
};

export const addMemberToTeam = async () => {
  throw new Error('Team member management is not yet supported by the backend.');
};

export const removeMemberFromTeam = async () => {
  throw new Error('Team member management is not yet supported by the backend.');
};
