// User API Service
// Handles all API calls related to users
// Backend response envelope: { message: "success", data: ... }
// The http client (apiGet/apiPost/etc.) automatically unwraps to return data directly.

import { apiDelete, apiGet, apiPut } from "@/app/services/http";

// ==================== USERS ====================
// GET /users?start=0&limit=10  → returns UserResponse[] (array in data)
// GET /users/{id}             → returns UserResponse (single object in data)
// PUT /users/{id}             → body: domain.User, returns "User updated successfully"
// DELETE /users/{id}          → returns "User deleted successfully"

export const fetchUsers = async (params = {}) => {
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

    const url = `/users?${queryParams}`;
    const [res, statRes] = await Promise.all([
      fetch(`${API_BASE}${url}`, { headers }),
      fetch(`${API_BASE}/users/stat`, { headers }),
    ]);

    if (!res.ok) throw new Error("Failed to fetch users: " + res.status);
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

    return { users: list, total };
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
// This creates a user via the admin PUT endpoint after initial creation
export const createUser = async (userData) => {
  try {
    // The backend doesn't have a POST /users endpoint.
    // User creation is done via POST /auth/register.
    // For admin user creation, we use register then update.
    const { apiPost: post } = await import("@/app/services/http");
    const data = await post("/auth/register", {
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
    // PUT /users/{id} expects domain.User body
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
    return await apiPut(`/users/${id}`, body);
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
