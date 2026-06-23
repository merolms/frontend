// @ts-nocheck
// TanStack Query hooks for Events

import { useQuery } from "@tanstack/react-query";

// Migrated to orval-generated hooks
import {
  useAddAttendee,
  useEventCreate,
  useEventDelete,
  useEventUpdate,
  useGetAttendeeCount,
  useGetCourseEvents,
  useGetEventAttendees,
  useGetEventStats,
  useGetOrgEvents,
  useGetUpcomingEvents,
  useGetUserEvents,
  useRemoveAttendee,
  useUpdateAttendeeStatus as useOrvalUpdateAttendeeStatus,
} from "@/api/orval";
import { queryKeys } from "@/lib/queryKeys";

// ─── Queries (Orval-generated) ───────────────────────────

export const useEvents = (params = {}) => {
  // Convert params to orval format
  const orvalParams = {};
  if (params.start !== undefined) orvalParams.start = params.start;
  if (params.limit !== undefined) orvalParams.limit = params.limit;

  const result = useGetOrgEvents(orvalParams);

  // Transform data to match expected format
  return {
    ...result,
    data: result.data?.data
      ? { events: result.data.data, total: result.data.data.length }
      : { events: [], total: 0 },
  };
};

export const useEvent = (id) => {
  // For single event, we need to implement using orval's eventGet function
  // But since there's no hook for get by ID, we'll need to use the base function or create a custom hook
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: async () => {
      // Import the base function dynamically to avoid circular dependencies
      const { eventGet } = await import("@/api/orval");
      const response = await eventGet(id);
      return response.data?.data;
    },
    enabled: !!id,
  });
};

export const useEventsByCourse = (courseId) => {
  const orvalParams = {};
  if (courseId !== undefined) {
    // orval takes courseId as a parameter, not in params object
  }

  const result = useGetCourseEvents(courseId, orvalParams);

  return {
    ...result,
    data: result.data?.data || [],
    enabled: !!courseId,
  };
};

export const useUpcomingEvents = (limit = 10) => {
  const orvalParams = {};
  if (limit !== undefined) orvalParams.limit = limit;

  const result = useGetUpcomingEvents(orvalParams);

  return {
    ...result,
    data: result.data?.data || [],
  };
};

export const useUserEvents = (params = {}) => {
  const orvalParams = {};
  if (params.start !== undefined) orvalParams.start = params.start;
  if (params.limit !== undefined) orvalParams.limit = params.limit;

  const result = useGetUserEvents(orvalParams);

  return {
    ...result,
    data: result.data?.data || [],
  };
};

export const useEventAttendees = (eventId, params = {}) => {
  const orvalParams = {};
  if (params.start !== undefined) orvalParams.start = params.start;
  if (params.limit !== undefined) orvalParams.limit = params.limit;

  const result = useGetEventAttendees(eventId, orvalParams);

  return {
    ...result,
    data: result.data?.data || [],
    enabled: !!eventId,
  };
};

export const useEventAttendeeCount = (eventId) => {
  const result = useGetAttendeeCount(eventId);

  return {
    ...result,
    data: result.data?.data?.count || 0,
    enabled: !!eventId,
  };
};

export const useEventStats = (eventId) => {
  const result = useGetEventStats(eventId);

  return {
    ...result,
    data: result.data?.data,
    enabled: !!eventId,
  };
};

// ─── Mutations (Orval-generated) ─────────────────────────

export const useCreateEvent = () => {
  const orvalMutation = useEventCreate();

  return {
    ...orvalMutation,
    mutate: async (data) => {
      // Orval expects { data: DomainCreateEventRequest }
      return orvalMutation.mutateAsync({ data });
    },
    mutateAsync: async (data) => {
      return orvalMutation.mutateAsync({ data });
    },
  };
};

export const useUpdateEvent = () => {
  const orvalMutation = useEventUpdate();

  return {
    ...orvalMutation,
    mutate: async ({ id, data }) => {
      // Orval expects { id: number; data: DomainUpdateEventRequest }
      return orvalMutation.mutateAsync({ id, data });
    },
    mutateAsync: async ({ id, data }) => {
      return orvalMutation.mutateAsync({ id, data });
    },
  };
};

export const useDeleteEvent = () => {
  const orvalMutation = useEventDelete();

  return {
    ...orvalMutation,
    mutate: async (id) => {
      // Orval expects { id: number }
      return orvalMutation.mutateAsync({ id });
    },
    mutateAsync: async (id) => {
      return orvalMutation.mutateAsync({ id });
    },
  };
};

export const useAddEventAttendee = () => {
  const orvalMutation = useAddAttendee();

  return {
    ...orvalMutation,
    mutate: async ({ eventId, userId, status }) => {
      // Orval expects { eventId: number; data: DomainCreateEventAttendeeRequest }
      return orvalMutation.mutateAsync({
        eventId,
        data: { eventId, userId, status: status || "invited" },
      });
    },
    mutateAsync: async ({ eventId, userId, status }) => {
      return orvalMutation.mutateAsync({
        eventId,
        data: { eventId, userId, status: status || "invited" },
      });
    },
  };
};

export const useUpdateAttendeeStatus = () => {
  const orvalMutation = useOrvalUpdateAttendeeStatus();

  return {
    ...orvalMutation,
    mutate: async ({ eventId, userId, status }) => {
      // Orval expects { eventId: number; userId: number; data: DomainUpdateEventAttendeeRequest }
      return orvalMutation.mutateAsync({
        eventId,
        userId,
        data: { status },
      });
    },
    mutateAsync: async ({ eventId, userId, status }) => {
      return orvalMutation.mutateAsync({
        eventId,
        userId,
        data: { status },
      });
    },
  };
};

export const useRemoveEventAttendee = () => {
  const orvalMutation = useRemoveAttendee();

  return {
    ...orvalMutation,
    mutate: async ({ eventId, userId }) => {
      // Orval expects { eventId: number; userId: number }
      return orvalMutation.mutateAsync({ eventId, userId });
    },
    mutateAsync: async ({ eventId, userId }) => {
      return orvalMutation.mutateAsync({ eventId, userId });
    },
  };
};
