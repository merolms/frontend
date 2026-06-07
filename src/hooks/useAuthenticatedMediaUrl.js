import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";

/**
 * Fetches a media URL that requires authentication and returns a blob URL
 * that can be used directly in <img>, <video>, <audio> etc.
 *
 * Handles:
 * - Relative URLs like /media/<uuid> → fetched with auth via API_BASE
 * - Absolute URLs pointing to the same API base → fetched with auth
 * - data: / blob: URLs → passed through unchanged
 * - External URLs (unsplash, etc.) → passed through unchanged
 *
 * @param {string|null} url - Media URL that may require auth
 * @returns {string|null} Blob URL or null while loading/on error
 */
export function useAuthenticatedMediaUrl(url) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      return;
    }

    // data: or blob: URLs — use directly
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      setBlobUrl(url);
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
      setBlobUrl(url);
      return;
    }

    // Build the fetch URL — if absolute, use as-is; if relative, prepend API_BASE
    const fetchUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

    let objectUrl = null;
    let cancelled = false;

    const fetchMedia = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(fetchUrl, { headers });
        if (!response.ok) {
          if (!cancelled) setBlobUrl(null);
          return;
        }

        const blob = await response.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setBlobUrl(null);
      }
    };

    fetchMedia();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return blobUrl;
}
