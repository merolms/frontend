import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";

/**
 * Returns the full media URL for same-origin media.
 * The Service Worker intercepts these requests and adds the Authorization header.
 * This allows browser-native <video>, <img>, <audio> elements to make
 * authenticated requests with proper range request support for seeking.
 *
 * For external URLs (unsplash, data:, blob:), returns unchanged.
 *
 * @param {string|null} url - Media URL that may need auth
 * @returns {string|null} Full media URL, or null if no URL / not authenticated
 */
export function useAuthenticatedMediaUrl(url) {
  const [authenticatedUrl, setAuthenticatedUrl] = useState(null);

  useEffect(() => {
    if (!url) {
      setAuthenticatedUrl(null);
      return;
    }

    // data: or blob: URLs — use directly
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      setAuthenticatedUrl(url);
      return;
    }

    // Determine if this URL points to our API server (needs auth)
    const isSameOrigin =
      url.startsWith(API_BASE) ||
      url.startsWith("/media/") ||
      url.startsWith("/uploads/") ||
      url.startsWith("/lessons/") ||
      url.startsWith("/blocks/");

    // External URLs (unsplash, etc.) — use directly, no auth needed
    if (!isSameOrigin) {
      setAuthenticatedUrl(url);
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setAuthenticatedUrl(null);
      return;
    }

    // Build the full URL (Service Worker will add Authorization header)
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    setAuthenticatedUrl(fullUrl);
  }, [url]);

  return authenticatedUrl;
}
