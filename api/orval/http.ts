/**
 * Custom fetcher for orval-generated TanStack Query hooks.
 *
 * Delegates to the existing http.ts request() so we get:
 *   - VITE_API_BASE from env
 *   - JWT injection from localStorage
 *   - { message, data } envelope unwrapping
 *   - Auth error handling (401/403)
 */

import { request } from "@/services/http";

export const customFetcher = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  return request<T>(url, options);
};
