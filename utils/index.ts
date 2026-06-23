/**
 * Format file size in human-readable format.
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Format a Unix timestamp (seconds) to a localized date string.
 */
export const formatDate = (epochSec) => {
  if (!epochSec) return "—";
  try {
    return new Date(epochSec * 1000).toLocaleDateString();
  } catch {
    return "—";
  }
};

/**
 * Format a Unix timestamp (seconds) to a relative time string.
 */
export const formatRelativeTime = (epochSec) => {
  if (!epochSec) return "—";
  const diff = Date.now() / 1000 - epochSec;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(epochSec);
};

/**
 * Clamp a number between min and max.
 */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Safely parse JSON, returning fallback on error.
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Debounce a function.
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Generate a unique ID.
 */
export const uid = () => Math.random().toString(36).substring(2, 10);

/**
 * Truncate text with ellipsis.
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "…";
};

/**
 * Get status color class.
 */
export const getStatusColor = (status) => {
  const colors = {
    active: "blue",
    completed: "green",
    dropped: "red",
    published: "green",
    draft: "gray",
    archived: "gray",
  };
  return colors[status] || "gray";
};

/**
 * Get status label.
 */
export const getStatusLabel = (status) => {
  const labels = {
    active: "In Progress",
    completed: "Completed",
    dropped: "Dropped",
    published: "published",
    draft: "draft",
    archived: "archived",
  };
  return labels[status] || status;
};
