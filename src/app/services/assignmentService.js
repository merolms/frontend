// Assignment API Service
// Handles all API calls related to assignments and submissions

import { apiDelete, apiGet, apiPost, apiPut } from "@/app/services/http";

// ==================== FIELD MAPPING ====================
// Backend uses camelCase per swagger: lessonId, maxPoints, dueDate, etc.
// Backend timestamps: createdAt, updatedAt, submittedAt, gradedAt (integer unix)

const tsToIso = (ts) => {
  if (!ts) return null;
  const ms = ts > 1e12 ? ts : ts * 1000;
  return new Date(ms).toISOString();
};

const normalizeAssignment = (a) => ({
  id: a.id,
  lessonId: a.lessonId,
  title: a.title || "",
  description: a.description || "",
  instructions: a.instructions || "",
  maxPoints: a.maxPoints || 100,
  passingPoints: a.passingPoints || 0,
  dueDate: tsToIso(a.dueDate),
  allowLate: a.allowLate || false,
  latePenalty: a.latePenalty || 0,
  maxSubmissions: a.maxSubmissions || 1,
  audienceType: a.audienceType || "COURSE",
  status: a.status !== undefined && a.status !== null ? String(a.status) : "0",
  publishedAt: tsToIso(a.publishedAt),
  publishedBy: a.publishedBy,
  deletedAt: tsToIso(a.deletedAt),
  deletedBy: a.deletedBy,
  createdAt: tsToIso(a.createdAt) || "",
  updatedAt: tsToIso(a.updatedAt) || "",
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
  gradedAt: tsToIso(s.gradedAt),
  submittedAt: tsToIso(s.submittedAt) || "",
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
  createdAt: tsToIso(a.createdAt) || "",
});

const normalizeEnrollment = (e) => ({
  id: e.id,
  assignmentId: e.assignmentId,
  userId: e.userId,
  enrolledBy: e.enrolledBy,
  enrolledAt: tsToIso(e.enrolledAt) || "",
});

const normalizeTeamEnrollment = (e) => ({
  id: e.id,
  assignmentId: e.assignmentId,
  teamId: e.teamId,
  enrolledBy: e.enrolledBy,
  enrolledAt: tsToIso(e.enrolledAt) || "",
});

// ==================== ASSIGNMENTS ====================

/**
 * Get paginated list of all assignments
 * GET /assignments?start=0&limit=10 returns Response { data: Assignment[] }
 */
export const getAssignments = async (params = {}) => {
  const { start = 0, limit = 10 } = params;
  const data = await apiGet(`/assignments?start=${start}&limit=${limit}`);
  const assignments = Array.isArray(data) ? data : [];
  return {
    assignments: assignments.map(normalizeAssignment),
    total: assignments.length,
  };
};

/**
 * Get assignments by lesson ID
 * GET /assignments/lessons/{lessonId}/assignments returns Response { data: Assignment[] }
 */
export const getAssignmentsByLesson = async (lessonId) => {
  const data = await apiGet(`/assignments/lessons/${lessonId}/assignments`);
  const assignments = Array.isArray(data) ? data : [];
  return assignments.map(normalizeAssignment);
};

/**
 * Get assignment by ID
 * GET /assignments/{id} returns Response { data: Assignment }
 */
export const getAssignmentById = async (assignmentId) => {
  const data = await apiGet(`/assignments/${assignmentId}`);
  return normalizeAssignment(data);
};

/**
 * Create assignment
 * POST /assignments or POST /assignments/lessons/{lessonId}/assignments
 * Returns Response { data: Assignment }
 */
export const createAssignment = async (lessonId, assignmentData) => {
  const payload = {
    title: assignmentData.title,
    description: assignmentData.description,
    instructions: assignmentData.instructions,
    maxPoints: assignmentData.maxPoints || 100,
    passingPoints: assignmentData.passingPoints || 0,
    dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate).getTime() / 1000 : null,
    allowLate: assignmentData.allowLate || false,
    latePenalty: assignmentData.latePenalty || 0,
    maxSubmissions: assignmentData.maxSubmissions || 1,
    audienceType: assignmentData.audienceType || "COURSE",
  };
  if (lessonId && !isNaN(parseInt(lessonId))) {
    payload.lessonId = parseInt(lessonId);
  }
  const endpoint = lessonId && !isNaN(parseInt(lessonId))
    ? `/assignments/lessons/${lessonId}/assignments`
    : `/assignments`;
  const data = await apiPost(endpoint, payload);
  return normalizeAssignment(data);
};

/**
 * Update assignment
 * PUT /assignments/{id} returns Response { data: Assignment }
 */
export const updateAssignment = async (assignmentId, assignmentData) => {
  const payload = {
    title: assignmentData.title,
    description: assignmentData.description,
    instructions: assignmentData.instructions,
    maxPoints: assignmentData.maxPoints,
    passingPoints: assignmentData.passingPoints,
    dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate).getTime() / 1000 : null,
    allowLate: assignmentData.allowLate,
    latePenalty: assignmentData.latePenalty,
    maxSubmissions: assignmentData.maxSubmissions,
    audienceType: assignmentData.audienceType,
  };
  const data = await apiPut(`/assignments/${assignmentId}`, payload);
  return normalizeAssignment(data);
};

/**
 * Delete assignment (soft delete)
 * DELETE /assignments/{id} returns 204 No Content
 */
export const deleteAssignment = async (assignmentId) => {
  await apiDelete(`/assignments/${assignmentId}`);
};

/**
 * Publish assignment
 * POST /assignments/{id}/publish returns Response { data: Assignment }
 */
export const publishAssignment = async (assignmentId) => {
  const data = await apiPost(`/assignments/${assignmentId}/publish`);
  return normalizeAssignment(data);
};

// ==================== SUBMISSIONS ====================

/**
 * Submit individual assignment
 * POST /assignments/{id}/submit returns Response { data: Submission }
 */
export const submitAssignment = async (assignmentId, submissionData) => {
  const payload = {
    content: submissionData.content,
    attachmentURLs: submissionData.attachmentURLs,
  };
  const data = await apiPost(`/assignments/${assignmentId}/submit`, payload);
  return normalizeSubmission(data);
};

/**
 * Submit team assignment
 * POST /assignments/{id}/submit-team returns Response { data: Submission }
 */
export const submitTeamAssignment = async (assignmentId, teamId, submissionData) => {
  const payload = {
    teamId: teamId,
    content: submissionData.content,
    attachmentURLs: submissionData.attachmentURLs,
  };
  const data = await apiPost(`/assignments/${assignmentId}/submit-team`, payload);
  return normalizeSubmission(data);
};

/**
 * Get submissions for assignment
 * GET /assignments/{id}/submissions returns Response { data: Submission[] }
 */
export const getSubmissions = async (assignmentId) => {
  const data = await apiGet(`/assignments/${assignmentId}/submissions`);
  const submissions = Array.isArray(data) ? data : [];
  return submissions.map(normalizeSubmission);
};

/**
 * Get submission by ID
 * GET /assignments/submissions/{id} returns Response { data: Submission }
 */
export const getSubmissionById = async (submissionId) => {
  const data = await apiGet(`/assignments/submissions/${submissionId}`);
  return normalizeSubmission(data);
};

/**
 * Grade submission
 * PUT /assignments/submissions/{id}/grade returns Response { data: Submission }
 */
export const gradeSubmission = async (submissionId, gradingData) => {
  const payload = {
    score: gradingData.score,
    feedback: gradingData.feedback,
  };
  const data = await apiPut(`/assignments/submissions/${submissionId}/grade`, payload);
  return normalizeSubmission(data);
};

/**
 * Grade team submission
 * PUT /assignments/submissions/{id}/grade-team returns Response { data: Submission }
 */
export const gradeTeamSubmission = async (submissionId, gradingData) => {
  const payload = {
    score: gradingData.score,
    feedback: gradingData.feedback,
  };
  const data = await apiPut(`/assignments/submissions/${submissionId}/grade-team`, payload);
  return normalizeSubmission(data);
};

// ==================== ATTACHMENTS ====================

/**
 * Get assignment attachments
 * GET /assignments/{id}/attachments returns Response { data: AssignmentAttachment[] }
 */
export const getAttachments = async (assignmentId) => {
  const data = await apiGet(`/assignments/${assignmentId}/attachments`);
  const attachments = Array.isArray(data) ? data : [];
  return attachments.map(normalizeAttachment);
};

/**
 * Add attachment to assignment
 * POST /assignments/{id}/attachments body: { mediaId }
 * Returns Response { data: AssignmentAttachment }
 */
export const addAttachment = async (assignmentId, mediaId) => {
  const payload = { mediaId };
  const data = await apiPost(`/assignments/${assignmentId}/attachments`, payload);
  return normalizeAttachment(data);
};

/**
 * Delete attachment
 * DELETE /assignments/attachments/{id} returns 204 No Content
 */
export const deleteAttachment = async (attachmentId) => {
  await apiDelete(`/assignments/attachments/${attachmentId}`);
};

// ==================== ENROLLMENTS ====================

/**
 * Enroll user in assignment
 * POST /assignments/{id}/enroll-user body: { userId }
 * Returns Response { data: AssignmentEnrollment }
 */
export const enrollUser = async (assignmentId, userId) => {
  const payload = { userId };
  const data = await apiPost(`/assignments/${assignmentId}/enroll-user`, payload);
  return normalizeEnrollment(data);
};

/**
 * Remove user enrollment
 * DELETE /assignments/{id}/enroll-user/{userId} returns 204 No Content
 */
export const removeUserEnrollment = async (assignmentId, userId) => {
  await apiDelete(`/assignments/${assignmentId}/enroll-user/${userId}`);
};

/**
 * Get enrolled users
 * GET /assignments/{id}/enrolled-users returns Response { data: AssignmentEnrollment[] }
 */
export const getEnrolledUsers = async (assignmentId) => {
  const data = await apiGet(`/assignments/${assignmentId}/enrolled-users`);
  const enrollments = Array.isArray(data) ? data : [];
  return enrollments.map(normalizeEnrollment);
};

/**
 * Enroll team in assignment
 * POST /assignments/{id}/enroll-team body: { teamId }
 * Returns Response { data: AssignmentTeamEnrollment }
 */
export const enrollTeam = async (assignmentId, teamId) => {
  const payload = { teamId };
  const data = await apiPost(`/assignments/${assignmentId}/enroll-team`, payload);
  return normalizeTeamEnrollment(data);
};

/**
 * Remove team enrollment
 * DELETE /assignments/{id}/enroll-team/{teamId} returns 204 No Content
 */
export const removeTeamEnrollment = async (assignmentId, teamId) => {
  await apiDelete(`/assignments/${assignmentId}/enroll-team/${teamId}`);
};

/**
 * Get enrolled teams
 * GET /assignments/{id}/enrolled-teams returns Response { data: AssignmentTeamEnrollment[] }
 */
export const getEnrolledTeams = async (assignmentId) => {
  const data = await apiGet(`/assignments/${assignmentId}/enrolled-teams`);
  const enrollments = Array.isArray(data) ? data : [];
  return enrollments.map(normalizeTeamEnrollment);
};
