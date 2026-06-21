// TanStack Query hooks for Enrollments

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  adminEnrollTeamInCourse,
  adminEnrollUserInCourse,
  dropCourseAPI,
  enrollInCourse as enrollInCourseAPI,
  getCourseEnrollments,
  getCourseProgress,
  getEnrollmentStatus,
  getLessonCompletionCounts,
  getMyEnrollments,
  getMyLessonCompletions,
  markLessonCompleteAPI,
} from "@/app/services/enrollmentService";
import { queryKeys } from "@/lib/queryKeys";

// ─── Queries ──────────────────────────────────────────────

export const useMyEnrollments = (limit = 100) => {
  return useQuery({
    queryKey: queryKeys.enrollments.my(),
    queryFn: () => getMyEnrollments(limit),
  });
};

export const useEnrollmentStatus = (courseId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.courses.enrollment(courseId),
    queryFn: () => getEnrollmentStatus(courseId),
    enabled: !!courseId && options.enabled !== false,
  });
};

export const useCourseProgress = (courseId) => {
  return useQuery({
    queryKey: queryKeys.courses.progress(courseId),
    queryFn: () => getCourseProgress(courseId),
    enabled: !!courseId,
  });
};

export const useMyLessonCompletions = (courseId) => {
  return useQuery({
    queryKey: queryKeys.lessons.completions(courseId),
    queryFn: () => getMyLessonCompletions(courseId),
    enabled: !!courseId,
  });
};

export const useCourseEnrollments = (courseId, params = {}) => {
  return useQuery({
    queryKey: queryKeys.courses.enrollments(courseId),
    queryFn: () => getCourseEnrollments(courseId, params),
    enabled: !!courseId,
  });
};

export const useLessonCompletionCounts = (courseId) => {
  return useQuery({
    queryKey: queryKeys.courses.completionCounts(courseId),
    queryFn: () => getLessonCompletionCounts(courseId),
    enabled: !!courseId,
  });
};

// ─── Mutations ─────────────────────────────────────────────

export const useEnrollInCourse = () => {
  return useMutation({
    mutationFn: (courseId) => enrollInCourseAPI(courseId),
    onSuccess: (data, courseId) => {
      qc.setQueryData(queryKeys.courses.enrollment(courseId), data);
      qc.invalidateQueries({ queryKey: queryKeys.enrollments.all });
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useDropCourse = () => {
  return useMutation({
    mutationFn: (courseId) => dropCourseAPI(courseId),
    onSuccess: (data, courseId) => {
      qc.setQueryData(queryKeys.courses.enrollment(courseId), data);
      qc.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
};

export const useMarkLessonComplete = (courseId) => {
  return useMutation({
    mutationFn: ({ lessonId, timeSpentSeconds }) =>
      markLessonCompleteAPI(lessonId, timeSpentSeconds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.lessons.completions(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.progress(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.enrollment(courseId) });
    },
  });
};

export const useAdminEnrollUser = () => {
  return useMutation({
    mutationFn: ({ courseId, userId }) => adminEnrollUserInCourse(courseId, userId),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.enrollments(courseId) });
    },
  });
};

export const useAdminEnrollTeam = () => {
  return useMutation({
    mutationFn: ({ courseId, teamId }) => adminEnrollTeamInCourse(courseId, teamId),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.enrollments(courseId) });
    },
  });
};
