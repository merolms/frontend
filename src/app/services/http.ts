// Centralized API client wrapper
// - Reads JWT from localStorage
// - Injects Authorization header
// - Parses the { message, data } backend envelope
// - Throws ApiError on non-2xx responses
// - Calls onAuthError callback on 401/403 responses

const API_BASE: string = (import.meta as any).env.VITE_API_BASE || "http://192.168.1.67:9090";

export type AuthErrorHandler = (message: string, status: number) => void;

// Optional callback for auth errors (set by the Redux store)
let onAuthError: AuthErrorHandler | null = null;

/**
 * Set a callback to be called when a 401 or 403 response is received.
 * The callback should clear auth state and redirect to login.
 */
export const setAuthErrorHandler = (handler: AuthErrorHandler): void => {
  onAuthError = handler;
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface ApiResponse<T = any> {
  message: string;
  data: T;
  errorMessage?: string;
}

/**
 * Core fetch wrapper.
 * @param {string} path - API path (e.g. '/courses')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} The `data` field from the backend response envelope
 */
async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body: ApiResponse<T> = await response
    .json()
    .catch(() => ({ message: "Server error", data: null as unknown as T }));

  // Handle auth errors globally
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    if (onAuthError) {
      onAuthError(body.message, response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      body.message || body.errorMessage || "Request failed",
      response.status,
      body.data
    );
  }

  // Backend returns { message: "success", data: {...} }
  return body.data;
}

// Convenience helpers
export const apiGet = <T = any>(path: string): Promise<T> => request<T>(path, { method: "GET" });

export const apiPost = <T = any>(path: string, data: any): Promise<T> =>
  request<T>(path, { method: "POST", body: JSON.stringify(data) });

export const apiPut = <T = any>(path: string, data: any): Promise<T> =>
  request<T>(path, { method: "PUT", body: JSON.stringify(data) });

export const apiDelete = <T = any>(path: string): Promise<T> =>
  request<T>(path, { method: "DELETE" });

export const apiPatch = <T = any>(path: string, data: any): Promise<T> =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data) });

// Multipart file upload — does NOT set Content-Type so the browser adds the boundary
export const apiUpload = async <T = any>(path: string, formData: FormData): Promise<T> => {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });
  const body: ApiResponse<T> = await response
    .json()
    .catch(() => ({ message: "Server error", data: null as unknown as T }));
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    if (onAuthError) onAuthError(body.message, response.status);
  }
  if (!response.ok) {
    throw new ApiError(
      body.message || body.errorMessage || "Request failed",
      response.status,
      body.data
    );
  }
  return body.data;
};

// Expose request for custom calls
export { API_BASE, ApiError, request };

// Expose API_BASE for services that construct query strings
export const getApiBase = (): string => API_BASE;
