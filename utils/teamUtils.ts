// Team utility functions
// Non-API related helper functions for team management

export interface TeamFormData {
  id?: string | number;
  name?: string;
  description?: string;
  color?: string;
  status?: number;
}

export interface ColorOption {
  value: string;
  label: string;
}

/**
 * Prepare team data for API submission
 * @param teamData - Form data from TeamForm
 * @param defaultColor - Default color from theme
 * @returns API-ready team data
 */
export const prepareTeamData = (teamData: TeamFormData, defaultColor: string = "#6366F1"): any => ({
  name: teamData.name || "",
  description: teamData.description || "",
  color: teamData.color || defaultColor,
  status: teamData.status !== undefined ? teamData.status : 1,
});

/**
 * Prepare team update data (only include changed fields)
 * @param teamData - Form data from TeamForm
 * @param defaultColor - Default color from theme
 * @returns API-ready team update data
 */
export const prepareTeamUpdateData = (
  teamData: TeamFormData,
  defaultColor: string = "#6366F1"
): any => ({
  id: typeof teamData.id === "string" ? parseInt(teamData.id) : teamData.id,
  name: teamData.name || "",
  description: teamData.description || "",
  color: teamData.color || defaultColor,
  status: teamData.status !== undefined ? teamData.status : 1,
});

export const getTeamColors = (): ColorOption[] => [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#22C55E", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EF4444", label: "Red" },
  { value: "#3B82F6", label: "Blue" },
];
