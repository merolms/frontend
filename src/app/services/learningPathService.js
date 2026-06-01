// Learning Path API Service
// Backend base path: /learning-paths (no /api prefix; backend basePath=/)

import { apiDelete, apiGet, apiPost, apiPut } from "@/app/services/http";

// ==================== LIST ====================
// GET /learning-paths?page=1&limit=6&search=react&category=Programming&status=published
// Returns { message, data: { paths, total, page, limit, totalPages } }
export const fetchLearningPaths = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", params.page);
  if (params.limit) queryParams.set("limit", params.limit);
  if (params.search) queryParams.set("search", params.search);
  if (params.category && params.category !== "all") queryParams.set("category", params.category);
  if (params.status && params.status !== "all") queryParams.set("status", params.status);

  const queryStr = queryParams.toString();
  const data = await apiGet(`/learning-paths${queryStr ? "?" + queryStr : ""}`);
  return {
    paths: data.paths || [],
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 6,
    totalPages: data.totalPages || 1,
  };
};

// ==================== GET BY ID ====================
// GET /learning-paths/:id
// Returns { message, data: { id, title, description, ... } }
export const fetchLearningPathById = async (id) => {
  return await apiGet(`/learning-paths/${id}`);
};

// ==================== CREATE ====================
// POST /learning-paths
// Body: { title, description, category, difficulty, estimatedDuration, status, tags, color, courses: [{courseId, order}] }
// Returns { message, data: { id, title, ... } }
export const createLearningPath = async (data) => {
  const body = {
    title: data.title,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty || "",
    estimatedDuration: data.estimatedDuration || "",
    status: data.status || "draft",
    tags: data.tags || [],
    color: data.color || "#6366F1",
    courses: (data.courses || []).map((c, i) => ({
      courseId: c.courseId || c.id,
      order: c.order || i + 1,
    })),
  };
  return await apiPost("/learning-paths", body);
};

// ==================== UPDATE ====================
// PUT /learning-paths/:id
// Body: { title?, description?, category?, difficulty?, estimatedDuration?, status?, tags?, color?, courses? }
// Returns { message, data: { id, title, ... } }
export const updateLearningPath = async (id, data) => {
  const body = {};
  if (data.title !== undefined) body.title = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (data.category !== undefined) body.category = data.category;
  if (data.difficulty !== undefined) body.difficulty = data.difficulty;
  if (data.estimatedDuration !== undefined) body.estimatedDuration = data.estimatedDuration;
  if (data.status !== undefined) body.status = data.status;
  if (data.tags !== undefined) body.tags = data.tags;
  if (data.color !== undefined) body.color = data.color;
  if (data.courses !== undefined) {
    body.courses = data.courses.map((c, i) => ({
      courseId: c.courseId || c.id,
      order: c.order || i + 1,
    }));
  }
  return await apiPut(`/learning-paths/${id}`, body);
};

// ==================== DELETE ====================
// DELETE /learning-paths/:id
// Returns { message: "Learning path deleted successfully" }
export const deleteLearningPath = async (id) => {
  return await apiDelete(`/learning-paths/${id}`);
};

// ==================== CATEGORIES ====================
// GET /learning-paths/categories
// Returns { message, data: ["Programming", "Data Science", ...] }
export const getLearningPathCategories = async () => {
  const data = await apiGet("/learning-paths/categories");
  return ["All Categories", ...(data || [])];
};

// ==================== STAT ====================
// GET /learning-paths/stat
// Returns { message, data: { count: N } }
export const fetchLearningPathStat = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.category) queryParams.set("category", params.category);
  if (params.status) queryParams.set("status", params.status);

  const queryStr = queryParams.toString();
  const data = await apiGet(`/learning-paths/stat${queryStr ? "?" + queryStr : ""}`);
  return data?.count || 0;
};

// ==================== REORDER COURSES ====================
// PUT /learning-paths/:id/reorder
// Body: { courses: [{courseId, order}] }
// Returns { message, data: { id, courses, updatedAt } }
export const reorderLearningPathCourses = async (id, courses) => {
  const body = {
    courses: courses.map((c, i) => ({
      courseId: c.courseId || c.id,
      order: c.order || i + 1,
    })),
  };
  return await apiPut(`/learning-paths/${id}/reorder`, body);
};

// ==================== ENROLL ====================
// POST /learning-paths/:id/enroll
// Returns { message, data: { enrollmentId, learningPathId, userId, status, progress, ... } }
export const enrollInLearningPath = async (id) => {
  return await apiPost(`/learning-paths/${id}/enroll`, {});
};

// ==================== PROGRESS ====================
// GET /learning-paths/:id/progress
// Returns { message, data: { enrollmentId, progress, currentCourseId, ... } }
export const fetchLearningPathProgress = async (id) => {
  return await apiGet(`/learning-paths/${id}/progress`);
};
