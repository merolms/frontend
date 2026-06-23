// Shared normalization utilities for API response data

/**
 * Extract a plain integer from a NullInt64 object or return null.
 * Backend may send null for nullable FK fields, or a plain number
 * after the NullInt64 MarshalJSON fix.
 *
 * @param field - The field value from the API response.
 * @returns The integer value, or null if invalid/missing.
 */
export const nullInt64 = (field: unknown): number | null => {
  if (field === null || field === undefined) return null;
  if (typeof field === "number") return field;
  if (typeof field === "object") {
    if ((field as { valid?: boolean }).valid === false) return null;
    const val =
      (field as { int64?: number; Int64?: number; value?: number }).int64 ??
      (field as { Int64?: number }).Int64 ??
      (field as { value?: number }).value ??
      null;
    return val !== null ? Number(val) : null;
  }
  const parsed = Number(field);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Convert a Unix epoch in seconds to JavaScript milliseconds.
 * Backend stores timestamps as int64 epoch seconds.
 *
 * @param epochSec - Unix timestamp in seconds.
 * @returns Milliseconds since epoch (for new Date()).
 */
export const toUnixMs = (epochSec: unknown): number | null => {
  if (epochSec === null || epochSec === undefined) return null;
  const n = Number(epochSec);
  if (!Number.isFinite(n)) return null;
  return n * 1000;
};

/**
 * Convert a Unix epoch in seconds to an ISO date string.
 *
 * @param epochSec - Unix timestamp in seconds.
 * @returns ISO date string, or empty string if invalid.
 */
export const toISODate = (epochSec: unknown): string => {
  const ms = toUnixMs(epochSec);
  if (ms === null) return "";
  try {
    return new Date(ms).toISOString().split("T")[0];
  } catch {
    return "";
  }
};
