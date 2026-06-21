// Event utility functions
// Non-API related helper functions for event management

export const getEventTypes = () => [
  { value: "all", label: "All Types" },
  { value: "workshop", label: "Workshop" },
  { value: "live_class", label: "Live Class" },
  { value: "meeting", label: "Meeting" },
  { value: "career", label: "Career Fair" },
  { value: "review", label: "Review Session" },
  { value: "ceremony", label: "Ceremony" },
  { value: "study_group", label: "Study Group" },
];

export const getEventColors = () => [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#22C55E", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EF4444", label: "Red" },
  { value: "#3B82F6", label: "Blue" },
];

export const formatEventDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export const formatEventTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

export const getEventStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
};

/**
 * Prepare event data for API submission
 * @param {object} formData - Form data from EventForm
 * @returns {object} API-ready event data
 */
export const prepareEventData = (formData) => ({
  title: formData.title,
  description: formData.description || "",
  startTime: formData.startDate ? new Date(formData.startDate).getTime() / 1000 : null,
  endTime: formData.endDate ? new Date(formData.endDate).getTime() / 1000 : null,
  eventType: formData.type || "workshop",
  location: formData.location || "",
  maxAttendees: formData.maxAttendees || 0,
  meetingUrl: formData.meetingUrl || "",
  courseId: formData.courseId || null,
  timezone: formData.timezone || "UTC",
  isRecurring: formData.isRecurring || false,
  recurrenceRule: formData.recurrenceRule || "",
  organizationId: formData.organizationId || 1,
});

/**
 * Prepare event update data (only include changed fields)
 * @param {object} formData - Form data from EventForm
 * @returns {object} API-ready event update data
 */
export const prepareEventUpdateData = (formData) => {
  const body = {};
  if (formData.title !== undefined) body.title = formData.title;
  if (formData.description !== undefined) body.description = formData.description;
  if (formData.startDate !== undefined)
    body.startTime = new Date(formData.startDate).getTime() / 1000;
  if (formData.endDate !== undefined) body.endTime = new Date(formData.endDate).getTime() / 1000;
  if (formData.type !== undefined) body.eventType = formData.type;
  if (formData.location !== undefined) body.location = formData.location;
  if (formData.maxAttendees !== undefined) body.maxAttendees = formData.maxAttendees;
  if (formData.meetingUrl !== undefined) body.meetingUrl = formData.meetingUrl;
  if (formData.timezone !== undefined) body.timezone = formData.timezone;
  if (formData.isRecurring !== undefined) body.isRecurring = formData.isRecurring;
  if (formData.recurrenceRule !== undefined) body.recurrenceRule = formData.recurrenceRule;
  return body;
};

/**
 * Get events for a specific month (convenience wrapper)
 * This is a helper function that calculates time range for a month
 * The actual fetching should be done with orval's useGetEventsInTimeRange hook
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {object} Start and end timestamps for the month
 */
export const getMonthTimeRange = (year, month) => {
  const start = new Date(year, month, 1).getTime() / 1000;
  const end = new Date(year, month + 1, 0, 23, 59, 59).getTime() / 1000;
  return { start, end };
};
