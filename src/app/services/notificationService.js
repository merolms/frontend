// Notification Service
// Real API integration matching swagger endpoints.
//
// Endpoints:
//   GET    /notifications                    — List notifications
//   POST   /notifications                    — Create notification
//   GET    /notifications/unread             — Get unread notifications
//   GET    /notifications/summary            — Get notification summary
//   PUT    /notifications/read-all           — Mark all as read
//   GET    /notifications/{id}               — Get notification by ID
//   DELETE /notifications/{id}               — Delete notification
//   PUT    /notifications/{id}/read          — Mark as read
//   GET    /notifications/preferences        — Get preferences
//   POST   /notifications/preferences        — Create preference
//   GET    /notifications/preferences/{type} — Get preference by type
//   PUT    /notifications/preferences/{type} — Update preference
//   DELETE /notifications/preferences/{type} — Delete preference

import { apiDelete, apiGet, apiPost, apiPut } from "@/app/services/http";

// ==================== NOTIFICATIONS ====================

/**
 * Get notifications
 * GET /notifications returns Response { data: Notification[] }
 */
export const fetchNotifications = async () => {
  try {
    const data = await apiGet("/notifications");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notifications
 * GET /notifications/unread returns Response { data: Notification[] }
 */
export const fetchUnreadNotifications = async () => {
  try {
    const data = await apiGet("/notifications/unread");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
};

/**
 * Get notification summary
 * GET /notifications/summary returns Response { data: { unreadCount, totalCount } }
 */
export const fetchNotificationSummary = async () => {
  try {
    return await apiGet("/notifications/summary");
  } catch (error) {
    console.error("Error fetching notification summary:", error);
    throw error;
  }
};

/**
 * Get notification by ID
 * GET /notifications/{id} returns Response { data: Notification }
 */
export const fetchNotificationById = async (id) => {
  try {
    return await apiGet(`/notifications/${id}`);
  } catch (error) {
    console.error("Error fetching notification:", error);
    throw error;
  }
};

/**
 * Create notification
 * POST /notifications body: CreateNotificationRequest returns Response { data: Notification }
 */
export const createNotification = async (data) => {
  try {
    return await apiPost("/notifications", data);
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 * PUT /notifications/{id}/read returns Response
 */
export const markAsRead = async (id) => {
  try {
    return await apiPut(`/notifications/${id}/read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * PUT /notifications/read-all returns Response
 */
export const markAllAsRead = async () => {
  try {
    return await apiPut("/notifications/read-all");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete notification
 * DELETE /notifications/{id} returns Response
 */
export const deleteNotification = async (id) => {
  try {
    await apiDelete(`/notifications/${id}`);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Get unread count (convenience — uses summary endpoint)
 */
export const getUnreadCount = async () => {
  try {
    const summary = await fetchNotificationSummary();
    return summary?.unreadCount || 0;
  } catch {
    return 0;
  }
};

// ==================== PREFERENCES ====================

/**
 * Get notification preferences
 * GET /notifications/preferences returns Response { data: NotificationPreference[] }
 */
export const fetchNotificationPreferences = async () => {
  try {
    const data = await apiGet("/notifications/preferences");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw error;
  }
};

/**
 * Get notification preference by type
 * GET /notifications/preferences/{type} returns Response { data: NotificationPreference }
 */
export const fetchNotificationPreferenceByType = async (type) => {
  try {
    return await apiGet(`/notifications/preferences/${type}`);
  } catch (error) {
    console.error("Error fetching notification preference:", error);
    throw error;
  }
};

/**
 * Create notification preference
 * POST /notifications/preferences body: CreateNotificationPreferenceRequest returns Response
 */
export const createNotificationPreference = async (data) => {
  try {
    return await apiPost("/notifications/preferences", data);
  } catch (error) {
    console.error("Error creating notification preference:", error);
    throw error;
  }
};

/**
 * Update notification preference
 * PUT /notifications/preferences/{type} body: UpdateNotificationPreferenceRequest returns Response
 */
export const updateNotificationPreference = async (type, data) => {
  try {
    return await apiPut(`/notifications/preferences/${type}`, data);
  } catch (error) {
    console.error("Error updating notification preference:", error);
    throw error;
  }
};

/**
 * Delete notification preference
 * DELETE /notifications/preferences/{type} returns Response
 */
export const deleteNotificationPreference = async (type) => {
  try {
    await apiDelete(`/notifications/preferences/${type}`);
  } catch (error) {
    console.error("Error deleting notification preference:", error);
    throw error;
  }
};

// ==================== HELPERS ====================

export const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
