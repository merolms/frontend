// Enrollment Service
// Migrated to use orval-generated functions where available
// Lesson completion functions kept custom as they're not in orval

import {
  enrollmentAdminEnrollTeam,
  enrollmentAdminEnrollUser,
  enrollmentDrop,
  enrollmentEnroll,
  enrollmentGet,
  getMyEnrollments as orvalGetMyEnrollments,
} from "@/app/api/orval";
import { apiGet, apiPost } from "@/app/services/http";

// ==================== ORVAL-BASED FUNCTIONS ====================

export const enrollInCourse = async (courseId: string | number): Promise<unknown> => {
  try {
    return await enrollmentEnroll(courseId);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
};

export const getEnrollmentStatus = async (courseId: string | number): Promise<unknown | null> => {
  try {
    return await enrollmentGet(courseId);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return null;
  }
};

export const dropCourseAPI = async (courseId: string | number): Promise<unknown> => {
  try {
    return await enrollmentDrop(courseId);
  } catch (error) {
    console.error("Error dropping course:", error);
    throw error;
  }
};

export const getMyEnrollments = async (): Promise<unknown[]> => {
  try {
    const data = await orvalGetMyEnrollments();
    return data?.data || [];
  } catch (error) {
    console.error("Error fetching my enrollments:", error);
    return [];
  }
};

// ─── ADMIN ENROLLMENT API CALLS ───────────────────────────────────

export const adminEnrollUserInCourse = async (courseId: string | number, userId: string | number): Promise<unknown> => {
  try {
    return await enrollmentAdminEnrollUser(courseId, { userId });
  } catch (error) {
    console.error("Error enrolling user in course:", error);
    throw error;
  }
};

export const adminEnrollTeamInCourse = async (courseId: string | number, teamId: string | number): Promise<unknown> => {
  try {
    return await enrollmentAdminEnrollTeam(courseId, { teamId });
  } catch (error) {
    console.error("Error enrolling team in course:", error);
    throw error;
  }
};

// ==================== CUSTOM FUNCTIONS (NOT IN ORVAL) ====================

export const getCourseProgress = async (courseId: string | number): Promise<unknown | null> => {
  try {
    return await apiGet(`/courses/${courseId}/progress`);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return null;
  }
};

export const markLessonCompleteAPI = async (lessonId: string | number, timeSpentSeconds = 0): Promise<unknown> => {
  try {
    return await apiPost(`/lessons/${lessonId}/complete`, { timeSpentSeconds });
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    throw error;
  }
};

// Get the lessons the current user has completed in a course
export const getMyLessonCompletions = async (courseId: string | number): Promise<unknown[]> => {
  try {
    const completions = await apiGet(`/courses/${courseId}/completions`);
    return Array.isArray(completions) ? completions : [];
  } catch (error) {
    console.error("Error fetching lesson completions:", error);
    return [];
  }
};

export const getCourseEnrollments = async (courseId: string | number, params: { start?: number; limit?: number } = {}): Promise<unknown[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.append("start", params.start);
    if (params.limit !== undefined) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString();
    const url = `/courses/${courseId}/admin/enrollments${queryString ? `?${queryString}` : ""}`;

    return await apiGet(url);
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    return [];
  }
};

// Get per-lesson completion counts for a course (admin)
export const getLessonCompletionCounts = async (courseId: string | number): Promise<Record<string, unknown>> => {
  try {
    const counts = await apiGet(`/courses/${courseId}/admin/lesson-completion-counts`);
    return counts || {};
  } catch (error) {
    console.error("Error fetching lesson completion counts:", error);
    return {};
  }
};

// ==================== MOCK DATA REMOVED ====================
// Using real backend API calls instead of mock data
