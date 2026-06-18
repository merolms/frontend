// User API Service
// Handles all API calls related to users
// Backend response envelope: { message: "success", data: ... }
// The http client (apiGet/apiPost/etc.) automatically unwraps to return data directly.

import { apiDelete, apiGet, apiPost, apiPut } from "@/app/services/http";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  username?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: string;
  permissions?: string[];
  status: number;
  lastLoginAt?: number;
  preferredLanguage?: string;
  loginCount?: number;
  created_at?: number;
  updated_at?: number;
  last_online?: number;
}

export interface FetchUsersParams {
  start?: number;
  limit?: number;
}

export interface FetchUsersResult {
  users: User[];
  total: number;
}

// ==================== USERS ====================
// GET /users?start=0&limit=10  -> returns Response { data: User[] }
// GET /users/{id}             -> returns Response { data: UserResponse }
// PUT /users/{id}             -> body: domain.User, returns Response
// DELETE /users/{id}          -> returns Response

export const fetchUsers = async (params: FetchUsersParams = {}): Promise<FetchUsersResult> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start.toString());
    if (params.limit !== undefined) queryParams.set("limit", params.limit.toString());
    const data = await apiGet<User[]>(`/users?${queryParams}`);
    const list = Array.isArray(data) ? data : [];
    return { users: list, total: list.length };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const fetchUserById = async (id: number | string): Promise<User> => {
  try {
    return await apiGet<User>(`/users/${id}`);
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// POST /users is not in the backend — user creation goes through POST /auth/register
export const createUser = async (
  userData: Partial<User> & { password?: string }
): Promise<User> => {
  try {
    const data = await apiPost<User>("/auth/register", {
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

export const updateUser = async (id: number | string, userData: Partial<User>): Promise<void> => {
  try {
    const body = {
      id: typeof id === "string" ? parseInt(id) : id,
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
    await apiPut<void>(`/users/${id}`, body);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id: number | string): Promise<void> => {
  try {
    await apiDelete<void>(`/users/${id}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
