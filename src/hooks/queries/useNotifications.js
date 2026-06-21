// TanStack Query hooks for Notifications

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotification,
  fetchNotificationPreferences,
  fetchNotifications,
  fetchNotificationSummary,
  fetchUnreadNotifications,
  markAllAsRead,
  markAsRead,
  updateNotificationPreference,
} from "@/app/services/notificationService";
import { queryKeys } from "@/lib/queryKeys";

// ─── Queries ──────────────────────────────────────────────

export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: fetchNotifications,
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: fetchUnreadNotifications,
  });
};

export const useNotificationSummary = () => {
  return useQuery({
    queryKey: queryKeys.notifications.summary(),
    queryFn: fetchNotificationSummary,
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: fetchNotificationPreferences,
  });
};

// ─── Mutations ─────────────────────────────────────────────

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useUpdateNotificationPreference = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }) => updateNotificationPreference(type, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.preferences() });
    },
  });
};
