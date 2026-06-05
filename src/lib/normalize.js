// Shared normalization utilities for API response data

/**
 * Extract a plain integer from a NullInt64 object or return null.
 * Backend may send null for nullable FK fields, or a plain number
 * after the NullInt64 MarshalJSON fix.
 *
 * @param {*} field - The field value from the API response.
 * @returns {number|null} The integer value, or null if invalid/missing.
 */
export const nullInt64 = (field) => {
  if (field === null || field === undefined) return null;
  if (typeof field === "number") return field;
  if (typeof field === "object") {
    if (field.valid === false) return null;
    const val = field.int64 ?? field.Int64 ?? field.value ?? null;
    return val !== null ? Number(val) : null;
  }
  const parsed = Number(field);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Convert a Unix epoch in seconds to JavaScript milliseconds.
 * Backend stores timestamps as int64 epoch seconds.
 *
 * @param {number} epochSec - Unix timestamp in seconds.
 * @returns {number} Milliseconds since epoch (for new Date()).
 */
export const toUnixMs = (epochSec) => {
  if (epochSec === null || epochSec === undefined) return null;
  const n = Number(epochSec);
  if (!Number.isFinite(n)) return null;
  return n * 1000;
};

/**
 * Convert a Unix epoch in seconds to an ISO date string.
 *
 * @param {number} epochSec - Unix timestamp in seconds.
 * @returns {string} ISO date string, or empty string if invalid.
 */
export const toISODate = (epochSec) => {
  const ms = toUnixMs(epochSec);
  if (ms === null) return "";
  try {
    return new Date(ms).toISOString().split("T")[0];
  } catch {
    return "";
  }
};
