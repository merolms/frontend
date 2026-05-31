// Team API Service
// Handles all API calls related to teams and team members
// Backend response envelope: { message: "success", data: ... }

import { apiGet, apiPost, apiPut, apiDelete } from "@/app/services/http";

import { t } from "@/styles/theme";

// ==================== TEAMS ====================
// GET /teams?start=0&limit=10  → returns Team[] (array in data)
// GET /teams/{id}             → returns Team (single object in data)
// POST /teams                 → body: { name, description, color, status }, returns Team
// PUT /teams/{id}             → body: Team, returns Team
// DELETE /teams/{id}          → returns "Team deleted successfully"

export const fetchTeams = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    const token = localStorage.getItem("auth_token");
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const url = `/teams?${queryParams}`;
    const [res, statRes] = await Promise.all([
      fetch(`${API_BASE}${url}`, { headers }),
      fetch(`${API_BASE}/teams/stat`, { headers }),
    ]);

    if (!res.ok) throw new Error("Failed to fetch teams: " + res.status);
    const body = await res.json();
    const envelope = body.data || body;
    const list = Array.isArray(envelope.data)
      ? envelope.data
      : Array.isArray(envelope)
        ? envelope
        : [];

    let total = list.length;
    if (statRes.ok) {
      const statBody = await statRes.json();
      if (statBody.data && typeof statBody.data.count === "number") {
        total = statBody.data.count;
      }
    }

    return { teams: list, total };
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const fetchTeamById = async (id) => {
  try {
    return await apiGet(`/teams/${id}`);
  } catch (error) {
    console.error("Error fetching team:", error);
    throw error;
  }
};

export const createTeam = async (teamData) => {
  try {
    const body = {
      name: teamData.name || "",
      description: teamData.description || "",
      color: teamData.color || t("accent"),
      status: teamData.status !== undefined ? teamData.status : 1,
    };
    return await apiPost("/teams", body);
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

export const updateTeam = async (id, teamData) => {
  try {
    const body = {
      id: parseInt(id),
      name: teamData.name || "",
      description: teamData.description || "",
      color: teamData.color || t("accent"),
      status: teamData.status !== undefined ? teamData.status : 1,
    };
    return await apiPut(`/teams/${id}`, body);
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
};

export const deleteTeam = async (id) => {
  try {
    await apiDelete(`/teams/${id}`);
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};

// ==================== TEAM MEMBERS ====================
// GET /teams/{id}/members       → returns TeamMember[] (array in data)
// POST /teams/{id}/members      → body: { userId }, returns "Member added successfully"
// DELETE /teams/{id}/members/{userId} → returns "Member removed successfully"

export const fetchTeamMembers = async (teamId) => {
  try {
    const data = await apiGet(`/teams/${teamId}/members`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};

export const addMemberToTeam = async (teamId, userData) => {
  try {
    const body = {
      userId: userData.id,
      teamId: parseInt(teamId, 10),
      userName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
      userEmail: userData.email || "",
      role: userData.role || "Student",
      avatar: userData.avatar || "",
    };
    return await apiPost(`/teams/${teamId}/members`, body);
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
};

export const removeMemberFromTeam = async (teamId, userId) => {
  try {
    await apiDelete(`/teams/${teamId}/members/${userId}`);
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
};

// ==================== USERS (for member assignment) ====================
// GET /users?start=0&limit=100  → returns UserResponse[]

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
