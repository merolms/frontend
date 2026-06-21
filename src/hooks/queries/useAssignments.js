// TanStack Query hooks for Assignments

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addAttachment,
  createAssignment,
  deleteAssignment,
  deleteAttachment,
  enrollTeam,
  enrollUser,
  getAssignmentById,
  getAssignments,
  getAssignmentsByLesson,
  getAttachments,
  getEnrolledTeams,
  getEnrolledUsers,
  getSubmissionById,
  getSubmissions,
  gradeSubmission,
  publishAssignment,
  submitAssignment,
  updateAssignment,
} from "@/app/services/assignmentService";
import { queryKeys } from "@/lib/queryKeys";

// ─── Queries ──────────────────────────────────────────────

export const useAssignments = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.assignments.list(params),
    queryFn: () => getAssignments(params),
  });
};

export const useAssignmentsByLesson = (lessonId) => {
  return useQuery({
    queryKey: queryKeys.assignments.list(lessonId),
    queryFn: () => getAssignmentsByLesson(lessonId),
    enabled: !!lessonId,
  });
};

export const useAssignment = (id) => {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: () => getAssignmentById(id),
    enabled: !!id,
  });
};

export const useSubmissions = (assignmentId) => {
  return useQuery({
    queryKey: queryKeys.assignments.submissions(assignmentId),
    queryFn: () => getSubmissions(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useSubmission = (id) => {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: () => getSubmissionById(id),
    enabled: !!id,
  });
};

export const useAssignmentAttachments = (assignmentId) => {
  return useQuery({
    queryKey: queryKeys.assignments.attachments(assignmentId),
    queryFn: () => getAttachments(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useEnrolledUsers = (assignmentId) => {
  return useQuery({
    queryKey: queryKeys.assignments.enrolledUsers(assignmentId),
    queryFn: () => getEnrolledUsers(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useEnrolledTeams = (assignmentId) => {
  return useQuery({
    queryKey: queryKeys.assignments.enrolledTeams(assignmentId),
    queryFn: () => getEnrolledTeams(assignmentId),
    enabled: !!assignmentId,
  });
};

// ─── Mutations ─────────────────────────────────────────────

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }) => createAssignment(lessonId, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.list(data.lessonId) });
    },
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateAssignment(id, data),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.assignments.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
};

export const useDeleteAssignment = () => {
  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
};

export const usePublishAssignment = () => {
  return useMutation({
    mutationFn: publishAssignment,
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.assignments.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
};

export const useSubmitAssignment = () => {
  return useMutation({
    mutationFn: ({ assignmentId, data }) => submitAssignment(assignmentId, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.submissions(data.assignmentId) });
    },
  });
};

export const useGradeSubmission = () => {
  return useMutation({
    mutationFn: ({ submissionId, data }) => gradeSubmission(submissionId, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.submissions(data.assignmentId) });
    },
  });
};

export const useAddAttachment = () => {
  return useMutation({
    mutationFn: ({ assignmentId, mediaId }) => addAttachment(assignmentId, mediaId),
    onSuccess: (_, { assignmentId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.attachments(assignmentId) });
    },
  });
};

export const useDeleteAttachment = () => {
  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
};

export const useEnrollUser = () => {
  return useMutation({
    mutationFn: ({ assignmentId, userId }) => enrollUser(assignmentId, userId),
    onSuccess: (_, { assignmentId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.enrolledUsers(assignmentId) });
    },
  });
};

export const useEnrollTeam = () => {
  return useMutation({
    mutationFn: ({ assignmentId, teamId }) => enrollTeam(assignmentId, teamId),
    onSuccess: (_, { assignmentId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.enrolledTeams(assignmentId) });
    },
  });
};
