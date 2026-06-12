// Assignment API Service
// Handles all API calls related to assignments and submissions

import { apiDelete, apiGet, apiPost, apiPut } from "@/app/services/http";

// ==================== FIELD MAPPING ====================
// Backend uses snake_case: lesson_id, max_points, due_date
// Frontend uses camelCase: lessonId, maxPoints, dueDate

const normalizeAssignment = (a) => ({
  id: a.id,
  lessonId: a.lessonId,
  title: a.title || "",
  description: a.description || "",
  instructions: a.instructions || "",
  maxPoints: a.maxPoints || 100,
  passingPoints: a.passingPoints || 0,
  dueDate: a.dueDate ? new Date(a.dueDate * 1000).toISOString() : null,
  allowLate: a.allowLate || false,
  latePenalty: a.latePenalty || 0,
  maxSubmissions: a.maxSubmissions || 1,
  audienceType: a.audienceType || "COURSE",
  status: a.status || "DRAFT",
  publishedAt: a.publishedAt ? new Date(a.publishedAt * 1000).toISOString() : null,
  publishedBy: a.publishedBy,
  deletedAt: a.deletedAt ? new Date(a.deletedAt * 1000).toISOString() : null,
  deletedBy: a.deletedBy,
  createdAt: a.createdAt ? new Date(a.createdAt * 1000).toISOString() : "",
  updatedAt: a.updatedAt ? new Date(a.updatedAt * 1000).toISOString() : "",
  submissions: (a.submissions || []).map(normalizeSubmission),
  attachments: (a.attachments || []).map(normalizeAttachment),
});

const normalizeSubmission = (s) => ({
  id: s.id,
  assignmentId: s.assignmentId,
  userId: s.userId,
  user: s.user,
  content: s.content || "",
  attachmentURLs: s.attachmentURLs || "",
  status: s.status || "SUBMITTED",
  score: s.score,
  feedback: s.feedback || "",
  gradedBy: s.gradedBy,
  gradedAt: s.gradedAt ? new Date(s.gradedAt * 1000).toISOString() : null,
  submittedAt: s.submittedAt ? new Date(s.submittedAt * 1000).toISOString() : "",
  late: s.late || false,
  attemptNumber: s.attemptNumber || 1,
  submissionType: s.submissionType || "USER",
  teamId: s.teamId,
  submittedBy: s.submittedBy,
});

const normalizeAttachment = (a) => ({
  id: a.id,
  assignmentId: a.assignmentId,
  mediaId: a.mediaId,
  createdAt: a.createdAt ? new Date(a.createdAt * 1000).toISOString() : "",
});

const normalizeEnrollment = (e) => ({
  id: e.id,
  assignmentId: e.assignmentId,
  userId: e.userId,
  enrolledBy: e.enrolledBy,
  enrolledAt: e.enrolledAt ? new Date(e.enrolledAt * 1000).toISOString() : "",
});

const normalizeTeamEnrollment = (e) => ({
  id: e.id,
  assignmentId: e.assignmentId,
  teamId: e.teamId,
  enrolledBy: e.enrolledBy,
  enrolledAt: e.enrolledAt ? new Date(e.enrolledAt * 1000).toISOString() : "",
});

// ==================== ASSIGNMENTS ====================

/**
 * Get paginated list of all assignments
 */
export const getAssignments = async (params = {}) => {
  const { start = 0, limit = 10 } = params;
  const { request } = await import("@/app/services/http");
  const response = await request(`/assignments?start=${start}&limit=${limit}`);
  console.log("Response message", response)
  const assignments = Array.isArray(response) ? response : [];
  console.log("assignment", assignments)
  return {
    assignments: assignments.map(normalizeAssignment),
    total: response.total || 0,
  };
};

/**
 * Get assignments by lesson ID
 */
export const getAssignmentsByLesson = async (lessonId) => {
  const response = await apiGet(`/assignments/lessons/${lessonId}/assignments`);
  const assignments = Array.isArray(response) ? response : response?.data || [];
  return assignments.map(normalizeAssignment);
};

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (assignmentId) => {
  const response = await apiGet(`/assignments/${assignmentId}`);
  return normalizeAssignment(response);
};

/**
 * Create assignment
 */
export const createAssignment = async (lessonId, assignmentData) => {
  const payload = {
    title: assignmentData.title,
    description: assignmentData.description,
    instructions: assignmentData.instructions,
    max_points: assignmentData.maxPoints || 100,
    passing_points: assignmentData.passingPoints || 0,
    due_date: assignmentData.dueDate ? new Date(assignmentData.dueDate).getTime() / 1000 : null,
    allow_late: assignmentData.allowLate || false,
    late_penalty: assignmentData.latePenalty || 0,
    max_submissions: assignmentData.maxSubmissions || 1,
    audience_type: assignmentData.audienceType || "COURSE",
  };
  // Only include lesson_id if it's a valid number
  if (lessonId && !isNaN(parseInt(lessonId))) {
    payload.lesson_id = parseInt(lessonId);
  }
  const endpoint = lessonId && !isNaN(parseInt(lessonId))
    ? `/assignments/lessons/${lessonId}/assignments`
    : `/assignments`;
  const response = await apiPost(endpoint, payload);
  return normalizeAssignment(response);
};

/**
 * Update assignment
 */
export const updateAssignment = async (assignmentId, assignmentData) => {
  const payload = {
    title: assignmentData.title,
    description: assignmentData.description,
    instructions: assignmentData.instructions,
    max_points: assignmentData.maxPoints,
    passing_points: assignmentData.passingPoints,
    due_date: assignmentData.dueDate ? new Date(assignmentData.dueDate).getTime() / 1000 : null,
    allow_late: assignmentData.allowLate,
    late_penalty: assignmentData.latePenalty,
    max_submissions: assignmentData.maxSubmissions,
    audience_type: assignmentData.audienceType,
  };
  const response = await apiPut(`/assignments/${assignmentId}`, payload);
  return normalizeAssignment(response);
};

/**
 * Delete assignment (soft delete)
 */
export const deleteAssignment = async (assignmentId) => {
  await apiDelete(`/assignments/${assignmentId}`);
};

/**
 * Publish assignment
 */
export const publishAssignment = async (assignmentId) => {
  const response = await apiPost(`/assignments/${assignmentId}/publish`);
  return normalizeAssignment(response);
};

// ==================== SUBMISSIONS ====================

/**
 * Submit individual assignment
 */
export const submitAssignment = async (assignmentId, submissionData) => {
  const payload = {
    content: submissionData.content,
    attachmentURLs: submissionData.attachmentURLs,
  };
  const response = await apiPost(`/assignments/${assignmentId}/submit`, payload);
  return normalizeSubmission(response);
};

/**
 * Submit team assignment
 */
export const submitTeamAssignment = async (assignmentId, teamId, submissionData) => {
  const payload = {
    teamId: teamId,
    content: submissionData.content,
    attachmentURLs: submissionData.attachmentURLs,
  };
  const response = await apiPost(`/assignments/${assignmentId}/submit-team`, payload);
  return normalizeSubmission(response);
};

/**
 * Get submissions for assignment
 */
export const getSubmissions = async (assignmentId) => {
  const response = await apiGet(`/assignments/${assignmentId}/submissions`);
  const submissions = Array.isArray(response) ? response : response?.data || [];
  return submissions.map(normalizeSubmission);
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (submissionId) => {
  const response = await apiGet(`/assignments/submissions/${submissionId}`);
  return normalizeSubmission(response);
};

/**
 * Grade submission
 */
export const gradeSubmission = async (submissionId, gradingData) => {
  const payload = {
    score: gradingData.score,
    feedback: gradingData.feedback,
  };
  const response = await apiPut(`/assignments/submissions/${submissionId}/grade`, payload);
  return normalizeSubmission(response);
};

/**
 * Grade team submission
 */
export const gradeTeamSubmission = async (submissionId, gradingData) => {
  const payload = {
    score: gradingData.score,
    feedback: gradingData.feedback,
  };
  const response = await apiPut(`/assignments/submissions/${submissionId}/grade-team`, payload);
  return normalizeSubmission(response);
};

// ==================== ATTACHMENTS ====================

/**
 * Get assignment attachments
 */
export const getAttachments = async (assignmentId) => {
  const response = await apiGet(`/assignments/${assignmentId}/attachments`);
  const attachments = Array.isArray(response) ? response : response?.data || [];
  return attachments.map(normalizeAttachment);
};

/**
 * Add attachment to assignment
 */
export const addAttachment = async (assignmentId, mediaId) => {
  const payload = { mediaId };
  const response = await apiPost(`/assignments/${assignmentId}/attachments`, payload);
  return normalizeAttachment(response);
};

/**
 * Delete attachment
 */
export const deleteAttachment = async (attachmentId) => {
  await apiDelete(`/assignments/attachments/${attachmentId}`);
};

// ==================== ENROLLMENTS ====================

/**
 * Enroll user in assignment
 */
export const enrollUser = async (assignmentId, userId) => {
  const payload = { userId };
  const response = await apiPost(`/assignments/${assignmentId}/enroll-user`, payload);
  return normalizeEnrollment(response);
};

/**
 * Remove user enrollment
 */
export const removeUserEnrollment = async (assignmentId, userId) => {
  await apiDelete(`/assignments/${assignmentId}/enroll-user/${userId}`);
};

/**
 * Get enrolled users
 */
export const getEnrolledUsers = async (assignmentId) => {
  const response = await apiGet(`/assignments/${assignmentId}/enrolled-users`);
  const enrollments = Array.isArray(response) ? response : response?.data || [];
  return enrollments.map(normalizeEnrollment);
};

/**
 * Enroll team in assignment
 */
export const enrollTeam = async (assignmentId, teamId) => {
  const payload = { teamId };
  const response = await apiPost(`/assignments/${assignmentId}/enroll-team`, payload);
  return normalizeTeamEnrollment(response);
};

/**
 * Remove team enrollment
 */
export const removeTeamEnrollment = async (assignmentId, teamId) => {
  await apiDelete(`/assignments/${assignmentId}/enroll-team/${teamId}`);
};

/**
 * Get enrolled teams
 */
export const getEnrolledTeams = async (assignmentId) => {
  const response = await apiGet(`/assignments/${assignmentId}/enrolled-teams`);
  const enrollments = Array.isArray(response) ? response : response?.data || [];
  return enrollments.map(normalizeTeamEnrollment);
};
