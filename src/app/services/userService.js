// User API Service
// Handles all API calls related to users
// Backend response envelope: { message: "success", data: ... }
// The http client (apiGet/apiPost/etc.) automatically unwraps to return data directly.

import { apiDelete, apiGet, apiPost, apiPut } from "@/app/services/http";

// ==================== USERS ====================
// GET /users?start=0&limit=10  -> returns Response { data: User[] }
// GET /users/{id}             -> returns Response { data: UserResponse }
// PUT /users/{id}             -> body: domain.User, returns Response
// DELETE /users/{id}          -> returns Response

export const fetchUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    const data = await apiGet(`/users?${queryParams}`);
    const list = Array.isArray(data) ? data : [];
    return { users: list, total: list.length };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const fetchUserById = async (id) => {
  try {
    return await apiGet(`/users/${id}`);
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// POST /users is not in the backend — user creation goes through POST /auth/register
export const createUser = async (userData) => {
  try {
    const data = await apiPost("/auth/register", {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "",
    });
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const body = {
      id: parseInt(id),
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      bio: userData.bio || "",
      role: userData.role || "Student",
      avatar: userData.avatar || "",
      status: userData.status !== undefined ? userData.status : 1,
    };
    // PUT /users/{id} returns Response (no data), so apiPut returns body.data which is undefined
    // We fire-and-forget; the caller checks for errors via try/catch
    await apiPut(`/users/${id}`, body);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await apiDelete(`/users/${id}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
