// TanStack Query hooks for Courses
// Replaces Redux thunks + manual useState/useEffect data fetching

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useUpdateCourseStatus } from "@/app/api/orval";
import {
  createCourse,
  createLesson,
  deleteCourse,
  deleteLesson,
  fetchCourseById,
  fetchCourses,
  fetchLessons,
  reorderLessons,
  updateCourse,
  updateLesson,
} from "@/app/services/courseService";
import { queryKeys } from "@/lib/queryKeys";

// ─── Queries ──────────────────────────────────────────────

export const useCourses = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: () => fetchCourses(params),
    keepPreviousData: true, // Show previous page data while loading new page
  });
};

export const useCourse = (id) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => fetchCourseById(id),
    enabled: !!id,
  });
};

export const useCourseLessons = (courseId) => {
  return useQuery({
    queryKey: queryKeys.courses.lessons(courseId),
    queryFn: () => fetchLessons(courseId, { start: 0, limit: 100 }),
    select: (data) => data.lessons || [],
    enabled: !!courseId,
  });
};

// ─── Mutations ─────────────────────────────────────────────

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCourse(id, data),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.courses.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const usePublishCourse = () => {
  const qc = useQueryClient();
  const updateStatus = useUpdateCourseStatus();

  return useMutation({
    mutationFn: (id) => updateStatus.mutateAsync({ id, data: "published" }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.courses.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useArchiveCourse = () => {
  const qc = useQueryClient();
  const updateStatus = useUpdateCourseStatus();

  return useMutation({
    mutationFn: (id) => updateStatus.mutateAsync({ id, data: "archived" }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.courses.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useRestoreCourse = () => {
  const qc = useQueryClient();
  const updateStatus = useUpdateCourseStatus();

  return useMutation({
    mutationFn: (id) => updateStatus.mutateAsync({ id, data: "draft" }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.courses.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

// ─── Lesson Mutations ──────────────────────────────────────

export const useCreateLesson = (courseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createLesson(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.lessons(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useUpdateLesson = (courseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }) => updateLesson(courseId, lessonId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.lessons(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useDeleteLesson = (courseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId }) => deleteLesson(courseId, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.lessons(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useReorderLessons = (courseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessons) => reorderLessons(courseId, lessons),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.lessons(courseId) });
    },
  });
};
