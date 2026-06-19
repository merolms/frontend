// Team utility functions
// Non-API related helper functions for team management

/**
 * Prepare team data for API submission
 * @param {object} teamData - Form data from TeamForm
 * @param {string} defaultColor - Default color from theme
 * @returns {object} API-ready team data
 */
export const prepareTeamData = (teamData, defaultColor = "#6366F1") => ({
  name: teamData.name || "",
  description: teamData.description || "",
  color: teamData.color || defaultColor,
  status: teamData.status !== undefined ? teamData.status : 1,
});

/**
 * Prepare team update data (only include changed fields)
 * @param {object} teamData - Form data from TeamForm
 * @param {string} defaultColor - Default color from theme
 * @returns {object} API-ready team update data
 */
export const prepareTeamUpdateData = (teamData, defaultColor = "#6366F1") => ({
  id: parseInt(teamData.id),
  name: teamData.name || "",
  description: teamData.description || "",
  color: teamData.color || defaultColor,
  status: teamData.status !== undefined ? teamData.status : 1,
});

export const getTeamColors = () => [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#22C55E", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EF4444", label: "Red" },
  { value: "#3B82F6", label: "Blue" },
];
