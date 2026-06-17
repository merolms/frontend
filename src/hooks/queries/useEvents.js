// TanStack Query hooks for Events

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchEventsByCourse,
  fetchEventsByTimeRange,
  fetchEventsByType,
  fetchUpcomingEvents,
  fetchUserEvents,
  fetchUserAttendeeEvents,
  fetchEventAttendees,
  addEventAttendee,
  getEventAttendeeCount,
  updateAttendeeStatus,
  removeEventAttendee,
  fetchEventStats,
} from "@/app/services/eventService";

// ─── Queries ──────────────────────────────────────────────

export const useEvents = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => fetchEvents(params),
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => fetchEventById(id),
    enabled: !!id,
  });
};

export const useEventsByCourse = (courseId) => {
  return useQuery({
    queryKey: queryKeys.events.list({ courseId }),
    queryFn: () => fetchEventsByCourse(courseId),
    enabled: !!courseId,
  });
};

export const useUpcomingEvents = (limit = 10) => {
  return useQuery({
    queryKey: queryKeys.events.upcoming(),
    queryFn: () => fetchUpcomingEvents(limit),
  });
};

export const useUserEvents = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.events.user(),
    queryFn: () => fetchUserEvents(params),
  });
};

export const useEventAttendees = (eventId, params = {}) => {
  return useQuery({
    queryKey: queryKeys.events.attendees(eventId),
    queryFn: () => fetchEventAttendees(eventId, params),
    enabled: !!eventId,
  });
};

export const useEventAttendeeCount = (eventId) => {
  return useQuery({
    queryKey: queryKeys.events.attendeeCount(eventId),
    queryFn: () => getEventAttendeeCount(eventId),
    enabled: !!eventId,
  });
};

export const useEventStats = (eventId) => {
  return useQuery({
    queryKey: queryKeys.events.stats(eventId),
    queryFn: () => fetchEventStats(eventId),
    enabled: !!eventId,
  });
};

// ─── Mutations ─────────────────────────────────────────────

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.events.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
};

export const useAddEventAttendee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId, status }) => addEventAttendee(eventId, userId, status),
    onSuccess: (_, { eventId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.events.attendees(eventId) });
      qc.invalidateQueries({ queryKey: queryKeys.events.attendeeCount(eventId) });
    },
  });
};

export const useUpdateAttendeeStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId, status }) => updateAttendeeStatus(eventId, userId, status),
    onSuccess: (_, { eventId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.events.attendees(eventId) });
    },
  });
};

export const useRemoveEventAttendee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }) => removeEventAttendee(eventId, userId),
    onSuccess: (_, { eventId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.events.attendees(eventId) });
      qc.invalidateQueries({ queryKey: queryKeys.events.attendeeCount(eventId) });
    },
  });
};
