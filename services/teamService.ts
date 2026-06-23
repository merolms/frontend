// Team API Service - Reduced
// Only contains helper functions that aren't available in orval or for specific use cases
// All team CRUD operations have been migrated to orval-generated hooks

import { apiGet } from "@/services/http";

// ==================== TEAMS (helper for Promise.all) ====================
// This function is kept for manual fetching in Promise.all contexts
// For most use cases, use useTeams hook from useEntities.js
export const fetchTeams = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    if (params.search) queryParams.set("search", params.search);

    const data = await apiGet(`/teams?${queryParams}`);
    const list = Array.isArray(data) ? data : [];
    return { teams: list, total: list.length };
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

// ==================== TEAM MEMBERS (helper for Promise.all) ====================
// This function is kept for manual fetching in Promise.all contexts
// For most use cases, use useTeamMembers hook from useEntities.js
export const fetchTeamMembers = async (teamId) => {
  try {
    const data = await apiGet(`/teams/${teamId}/members`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};

// ==================== USERS (for member assignment) ====================
// These functions are kept because orval doesn't have the available-users endpoint
// GET /users?start=0&limit=100  -> returns Response { data: User[] }

export const fetchUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    if (params.search) queryParams.set("search", params.search);
    const data = await apiGet(`/users?${queryParams}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getAvailableUsers = async (teamId) => {
  try {
    const data = await apiGet(`/teams/${teamId}/available-users`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching available users:", error);
    throw error;
  }
};
