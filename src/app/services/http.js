// Centralized API client wrapper
// - Reads JWT from localStorage
// - Injects Authorization header
// - Parses the { message, data } backend envelope
// - Throws ApiError on non-2xx responses
// - Calls onAuthError callback on 401/403 responses

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";

// Optional callback for auth errors (set by the Redux store)
let onAuthError = null;

/**
 * Set a callback to be called when a 401 or 403 response is received.
 * The callback should clear auth state and redirect to login.
 */
export const setAuthErrorHandler = (handler) => {
  onAuthError = handler;
};

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Core fetch wrapper.
 * @param {string} path - API path (e.g. '/courses')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} The `data` field from the backend response envelope
 */
async function request(path, options = {}) {
  const token = localStorage.getItem("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({ message: "Server error" }));

  // Handle auth errors globally
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    if (onAuthError) {
      onAuthError(body.message, response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(body.message || "Request failed", response.status, body.data);
  }

  // Backend returns { message: "success", data: {...} }
  return body.data;
}

// Convenience helpers
export const apiGet = (path) => request(path, { method: "GET" });

export const apiPost = (path, data) =>
  request(path, { method: "POST", body: JSON.stringify(data) });

export const apiPut = (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) });

export const apiDelete = (path) => request(path, { method: "DELETE" });

export const apiPatch = (path, data) =>
  request(path, { method: "PATCH", body: JSON.stringify(data) });

// Multipart file upload — does NOT set Content-Type so the browser adds the boundary
export const apiUpload = async (path, formData) => {
  const token = localStorage.getItem("auth_token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });
  const body = await response.json().catch(() => ({ message: "Server error" }));
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    if (onAuthError) onAuthError(body.message, response.status);
  }
  if (!response.ok) {
    throw new ApiError(body.message || "Request failed", response.status, body.data);
  }
  return body.data;
};

// Expose request for custom calls
export { request, API_BASE, ApiError };

// Expose API_BASE for services that construct query strings
export const getApiBase = () => API_BASE;
