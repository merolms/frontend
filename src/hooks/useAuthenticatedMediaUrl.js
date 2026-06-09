const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";

/**
 * Returns a URL with ?token=<jwt> for same-origin media URLs.
 * The backend auth middleware accepts ?token= as an alternative to Authorization header.
 * For video/audio, the backend 302-redirects to a presigned S3 URL (Range requests work).
 * For images/docs, the backend serves the content directly.
 *
 * External URLs, data:, and blob: URLs are passed through unchanged.
 *
 * @param {string|null} url - Media URL that may require auth
 * @returns {string|null} Authenticated URL or null
 */
export function useAuthenticatedMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  // External URLs (different origin) — pass through, no auth needed
  const isSameOrigin =
    url.startsWith(API_BASE) ||
    url.startsWith("/media/") ||
    url.startsWith("/uploads/") ||
    url.startsWith("/lessons/") ||
    url.startsWith("/blocks/");

  if (!isSameOrigin) return url;

  // Same-origin: append ?token= so backend auth middleware accepts the request
  const token = localStorage.getItem("auth_token");
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  return token ? `${fullUrl}?token=${encodeURIComponent(token)}` : fullUrl;
}
