// Events Service
// Real API integration matching swagger endpoints.
//
// Endpoints:
//   GET    /events?start=0&limit=10          — Organization events
//   POST   /events                           — Create event
//   GET    /events/{id}                      — Get event by ID
//   PUT    /events/{id}                      — Update event
//   DELETE /events/{id}                      — Delete event
//   GET    /events/course/{courseId}         — Get events by course
//   GET    /events/time-range                — Get events in time range
//   GET    /events/type/{type}               — Get events by type
//   GET    /events/upcoming                  — Get upcoming events
//   GET    /events/user                      — Get user events
//   GET    /events/user/attendees            — Get events where user is attendee
//   GET    /events/{eventId}/attendees       — Get event attendees
//   POST   /events/{eventId}/attendees       — Add attendee
//   GET    /events/{eventId}/attendees/count — Get attendee count
//   PUT    /events/{eventId}/attendees/{userId} — Update attendee status
//   DELETE /events/{eventId}/attendees/{userId} — Remove attendee
//   GET    /events/{id}/stats                — Get event statistics

import { apiDelete, apiGet, apiPost, apiPut } from "@/app/services/http";

// ==================== EVENTS ====================

/**
 * Get organization events
 * GET /events?start=0&limit=10 returns Response { data: Event[] }
 */
export const fetchEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    const data = await apiGet(`/events?${queryParams}`);
    const events = Array.isArray(data) ? data : [];
    return { events, total: events.length };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

/**
 * Get event by ID
 * GET /events/{id} returns Response { data: Event }
 */
export const fetchEventById = async (id) => {
  try {
    return await apiGet(`/events/${id}`);
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

/**
 * Create event
 * POST /events body: CreateEventRequest returns Response { data: Event }
 */
export const createEvent = async (data) => {
  try {
    const body = {
      title: data.title,
      description: data.description || "",
      startTime: data.startDate ? new Date(data.startDate).getTime() / 1000 : null,
      endTime: data.endDate ? new Date(data.endDate).getTime() / 1000 : null,
      eventType: data.type || "workshop",
      location: data.location || "",
      maxAttendees: data.maxAttendees || 0,
      meetingUrl: data.meetingUrl || "",
      courseId: data.courseId || null,
      timezone: data.timezone || "UTC",
      isRecurring: data.isRecurring || false,
      recurrenceRule: data.recurrenceRule || "",
      organizationId: data.organizationId || 1,
    };
    return await apiPost("/events", body);
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

/**
 * Update event
 * PUT /events/{id} body: UpdateEventRequest returns Response { data: Event }
 */
export const updateEvent = async (id, data) => {
  try {
    const body = {};
    if (data.title !== undefined) body.title = data.title;
    if (data.description !== undefined) body.description = data.description;
    if (data.startDate !== undefined) body.startTime = new Date(data.startDate).getTime() / 1000;
    if (data.endDate !== undefined) body.endTime = new Date(data.endDate).getTime() / 1000;
    if (data.type !== undefined) body.eventType = data.type;
    if (data.location !== undefined) body.location = data.location;
    if (data.maxAttendees !== undefined) body.maxAttendees = data.maxAttendees;
    if (data.meetingUrl !== undefined) body.meetingUrl = data.meetingUrl;
    if (data.timezone !== undefined) body.timezone = data.timezone;
    if (data.isRecurring !== undefined) body.isRecurring = data.isRecurring;
    if (data.recurrenceRule !== undefined) body.recurrenceRule = data.recurrenceRule;
    return await apiPut(`/events/${id}`, body);
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

/**
 * Delete event
 * DELETE /events/{id} returns 204 No Content
 */
export const deleteEvent = async (id) => {
  try {
    await apiDelete(`/events/${id}`);
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

/**
 * Get events for a specific month (convenience wrapper)
 * Uses GET /events/time-range internally
 */
export const fetchEventsForMonth = async (year, month) => {
  try {
    const start = new Date(year, month, 1).getTime() / 1000;
    const end = new Date(year, month + 1, 0, 23, 59, 59).getTime() / 1000;
    return await fetchEventsByTimeRange(start, end);
  } catch (error) {
    console.error("Error fetching events for month:", error);
    throw error;
  }
};

/**
 * Get events by course
 * GET /events/course/{courseId} returns Response { data: Event[] }
 */
export const fetchEventsByCourse = async (courseId) => {
  try {
    const data = await apiGet(`/events/course/${courseId}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching course events:", error);
    throw error;
  }
};

/**
 * Get events in time range
 * GET /events/time-range?start=...&end=... returns Response { data: Event[] }
 */
export const fetchEventsByTimeRange = async (start, end) => {
  try {
    const queryParams = new URLSearchParams();
    if (start) queryParams.set("start", start);
    if (end) queryParams.set("end", end);
    const data = await apiGet(`/events/time-range?${queryParams}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching events by time range:", error);
    throw error;
  }
};

/**
 * Get events by type
 * GET /events/type/{type} returns Response { data: Event[] }
 */
export const fetchEventsByType = async (type) => {
  try {
    const data = await apiGet(`/events/type/${type}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching events by type:", error);
    throw error;
  }
};

/**
 * Get upcoming events
 * GET /events/upcoming?start=0&limit=10 returns Response { data: Event[] }
 */
export const fetchUpcomingEvents = async (limit = 10) => {
  try {
    const data = await apiGet(`/events/upcoming?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

/**
 * Get events for the authenticated user
 * GET /events/user?start=0&limit=10 returns Response { data: Event[] }
 */
export const fetchUserEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    const data = await apiGet(`/events/user?${queryParams}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching user events:", error);
    throw error;
  }
};

/**
 * Get events where user is an attendee
 * GET /events/user/attendees?start=0&limit=10 returns Response { data: Event[] }
 */
export const fetchUserAttendeeEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    const data = await apiGet(`/events/user/attendees?${queryParams}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching user attendee events:", error);
    throw error;
  }
};

// ==================== ATTENDEES ====================

/**
 * Get event attendees
 * GET /events/{eventId}/attendees?start=0&limit=10 returns Response { data: EventAttendee[] }
 */
export const fetchEventAttendees = async (eventId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set("start", params.start);
    if (params.limit !== undefined) queryParams.set("limit", params.limit);
    const data = await apiGet(`/events/${eventId}/attendees?${queryParams}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching event attendees:", error);
    throw error;
  }
};

/**
 * Add attendee to event
 * POST /events/{eventId}/attendees body: CreateEventAttendeeRequest returns Response
 */
export const addEventAttendee = async (eventId, userId, status = "invited") => {
  try {
    return await apiPost(`/events/${eventId}/attendees`, { eventId, userId, status });
  } catch (error) {
    console.error("Error adding attendee:", error);
    throw error;
  }
};

/**
 * Get attendee count
 * GET /events/{eventId}/attendees/count returns Response { data: { count } }
 */
export const getEventAttendeeCount = async (eventId) => {
  try {
    const data = await apiGet(`/events/${eventId}/attendees/count`);
    return data?.count || 0;
  } catch (error) {
    console.error("Error fetching attendee count:", error);
    throw error;
  }
};

/**
 * Update attendee status
 * PUT /events/{eventId}/attendees/{userId} body: UpdateEventAttendeeRequest returns Response
 */
export const updateAttendeeStatus = async (eventId, userId, status) => {
  try {
    return await apiPut(`/events/${eventId}/attendees/${userId}`, { status });
  } catch (error) {
    console.error("Error updating attendee status:", error);
    throw error;
  }
};

/**
 * Remove attendee from event
 * DELETE /events/{eventId}/attendees/{userId} returns 204 No Content
 */
export const removeEventAttendee = async (eventId, userId) => {
  try {
    await apiDelete(`/events/${eventId}/attendees/${userId}`);
  } catch (error) {
    console.error("Error removing attendee:", error);
    throw error;
  }
};

// ==================== STATS ====================

/**
 * Get event statistics
 * GET /events/{id}/stats returns Response { data: { ... } }
 */
export const fetchEventStats = async (id) => {
  try {
    return await apiGet(`/events/${id}/stats`);
  } catch (error) {
    console.error("Error fetching event stats:", error);
    throw error;
  }
};

// ==================== HELPERS ====================

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
