// TanStack Query hooks for Enrollments

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import {
  fetchEnrollments,
  enrollInCourse as enrollInCourseAPI,
  getEnrollmentStatus,
  getCourseProgress,
  markLessonCompleteAPI,
  dropCourseAPI,
  getMyLessonCompletions,
  getMyEnrollments,
  getCourseEnrollments,
  getLessonCompletionCounts,
  adminEnrollUserInCourse,
  adminEnrollTeamInCourse,
} from "@/app/services/enrollmentService";

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
  const qc = useQueryClient();
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => dropCourseAPI(courseId),
    onSuccess: (data, courseId) => {
      qc.setQueryData(queryKeys.courses.enrollment(courseId), data);
      qc.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
};

export const useMarkLessonComplete = (courseId) => {
  const qc = useQueryClient();
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, userId }) => adminEnrollUserInCourse(courseId, userId),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.enrollments(courseId) });
    },
  });
};

export const useAdminEnrollTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, teamId }) => adminEnrollTeamInCourse(courseId, teamId),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.enrollments(courseId) });
    },
  });
};
