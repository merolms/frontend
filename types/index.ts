// @ts-nocheck
/**
 * Shared TypeScript type definitions for the MeroEdu frontend
 * This file consolidates common types and re-exports from API schemas
 */

// Re-export API types from Orval-generated schemas
export type {
  DomainAddress,
  DomainAddressType,
  DomainAdminResetPasswordRequest,
  DomainAIGenerationRequest,
  DomainRoleAssignment as DomainAssignment,
  DomainAssignmentAttachment,
  DomainAssignmentEnrollment,
  DomainAssignmentTeamEnrollment,
  DomainAttachment,
  DomainAttendeeStatus,
  DomainAuditLog,
  DomainCategory,
  DomainCertificateOrientation,
  DomainContentRevision,
  DomainContentType,
  DomainCourse,
  DomainCourseEnrollmentType,
  DomainCourseInsights,
  DomainCoursePrerequisite,
  DomainCreateCertificateRequest,
  DomainCreateCertificateTemplateRequest,
  DomainCreateEventAttendeeRequest,
  DomainCreateEventRequest,
  DomainCreateForumRequest,
  DomainCreateNotificationPreferenceRequest,
  DomainCreateNotificationRequest,
  DomainCreateReplyRequest,
  DomainCreateThreadRequest,
  DomainDiscussionForum,
  DomainDiscussionReply,
  DomainDiscussionThread,
  DomainEventType,
  DomainExportRequestStatus,
  DomainForumType,
  DomainLearnerStreak,
  DomainLesson,
  DomainLessonLessonBlock,
  DomainLessonPrerequisite,
  DomainLoginRequest,
  DomainLoginResponse,
  DomainNotificationType as DomainNotification,
  DomainNotificationType,
  DomainNullInt64,
  DomainOrgInsights,
  DomainPaginatedResponse,
  DomainPasswordChangeRequest,
  DomainPermission,
  DomainPrerequisiteType,
  DomainProfileUpdateRequest,
  DomainReactionCount,
  DomainRegisterRequest,
  DomainReorderRequest,
  DomainResponse,
  DomainRevokeCertificateRequest,
  DomainRole,
  DomainRoleAssignment,
  DomainRolePermission,
  DomainRubric,
  DomainRubricCriteria,
  DomainRubricGrade,
  DomainRubricLevel,
  DomainSentVia,
  DomainStatsResponse,
  DomainStatus,
  DomainSubmission,
  DomainSummaries,
  DomainTeam,
  DomainTeamMember,
  DomainThreadListResponse,
  DomainUpdateCertificateRequest,
  DomainUpdateCertificateTemplateRequest,
  DomainUpdateDataExportRequest,
  DomainUpdateEventAttendeeRequest,
  DomainUpdateEventRequest,
  DomainUpdateNotificationPreferenceRequest,
  UpdateReplyBody as DomainUpdateReplyRequest,
  UpdateThreadBody as DomainUpdateThreadRequest,
  DomainUser,
  HttpErrorDetail,
  HttpResponseError,
} from "@/api/orval/meroEduAPI.schemas";

// Common UI Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  username?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: string;
  permissions?: string[];
  status: number;
  lastLoginAt?: number;
  preferredLanguage?: string;
  loginCount?: number;
  created_at?: number;
  updated_at?: number;
  last_online?: number;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  status: string;
  enrollmentType?: string;
  categoryId?: number;
  authorId?: number;
  createdAt?: string;
  updatedAt?: string;
  lessonCount?: number;
  duration?: number;
  completionThreshold?: number;
  featured?: boolean;
  certificateEnabled?: boolean;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  displayOrder?: number;
  durationMinutes?: number;
  isFreePreview?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
  parentId?: number;
  sortOrder?: number;
  depth?: number;
  courseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  organizationId?: number;
  roleId?: number;
  status?: number;
  member_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  color?: string;
  isSystem?: boolean;
  parentRoleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  errorMessage?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// UI Component Types
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  body?: string;
  type: string;
  sentVia?: string[];
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Learning Path Types
export interface LearningPath {
  id: number;
  name: string;
  description?: string;
  courseIds: number[];
  estimatedDuration?: number;
  difficulty?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Progress Types
export interface CourseProgress {
  courseId: number;
  userId: number;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  lastAccessedAt?: string;
  completedAt?: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event Types
export interface Event {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  eventType?: string;
  location?: string;
  meetingUrl?: string;
  maxAttendees?: number;
  courseId?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress?: number;
  url?: string;
  error?: string;
}

// Assignment Types
export interface Assignment {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  dueDate?: string;
  points?: number;
  instructions?: string;
  allowLateSubmission?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  id: number;
  assignmentId: number;
  userId: number;
  content?: string;
  attachmentURLs?: string;
  score?: number;
  feedback?: string;
  status: string;
  submittedAt?: string;
  gradedAt?: string;
  isLate?: boolean;
}

// Role-based access control types
export type RoleType = "admin" | "instructor" | "learner" | "assistant";

export interface Permission {
  code: string;
  name: string;
  description?: string;
}

// Theme Types
export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  theme: Theme;
  primaryColor?: string;
  accentColor?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Dashboard Types
export interface DashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  activeLearners: number;
  courseCompletionRate: number;
  averageProgress: number;
}

// Search Types
export interface SearchResult<T = any> {
  id: number;
  type: string;
  title: string;
  description?: string;
  data: T;
  relevanceScore?: number;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
