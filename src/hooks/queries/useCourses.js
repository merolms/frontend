// TanStack Query hooks for Courses
// Replaces Redux thunks + manual useState/useEffect data fetching

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import {
  fetchCourses,
  fetchCourseById,
  fetchLessons,
  createCourse,
  updateCourse,
  publishCourse,
  archiveCourse,
  restoreCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/app/services/courseService";

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
    queryFn: () => fetchLessons(courseId),
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
  return useMutation({
    mutationFn: publishCourse,
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.courses.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useArchiveCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveCourse,
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.courses.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useRestoreCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restoreCourse,
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
