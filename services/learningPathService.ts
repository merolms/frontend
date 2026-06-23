// Learning Path API Service - Reduced
// Only contains helper functions that aren't available in orval or need special handling
// Learning path CRUD operations are NOT implemented in backend yet

import { apiPost, apiPut } from "@/services/http";

// ==================== CATEGORIES ====================
// GET /learning-paths/categories
// Returns { message, data: ["Programming", "Data Science", ...] }
export const getLearningPathCategories = async () => {
  try {
    const data = await apiGet("/learning-paths/categories");
    return ["All Categories", ...(data || [])];
  } catch (error) {
    console.error("Error fetching learning path categories:", error);
    throw error;
  }
};

// ==================== REORDER COURSES ====================
// PUT /learning-paths/:id/reorder
// Body: { courses: [{courseId, order}] }
// Returns { message, data: { id, courses, updatedAt } }
export const reorderLearningPathCourses = async (id, courses) => {
  try {
    const body = {
      courses: courses.map((c, i) => ({
        courseId: c.courseId || c.id,
        order: c.order || i + 1,
      })),
    };
    return await apiPut(`/learning-paths/${id}/reorder`, body);
  } catch (error) {
    console.error("Error reordering learning path courses:", error);
    throw error;
  }
};

// ==================== ADMIN ENROLLMENTS ====================
// POST /learning-paths/:id/admin/enroll-user body: { userId }
export const adminEnrollUserInLearningPath = async (learningPathId, userId) => {
  try {
    return await apiPost(`/learning-paths/${learningPathId}/admin/enroll-user`, { userId });
  } catch (error) {
    console.error("Error enrolling user in learning path:", error);
    throw error;
  }
};

// POST /learning-paths/:id/admin/enroll-team body: { teamId }
export const adminEnrollTeamInLearningPath = async (learningPathId, teamId) => {
  try {
    return await apiPost(`/learning-paths/${learningPathId}/admin/enroll-team`, { teamId });
  } catch (error) {
    console.error("Error enrolling team in learning path:", error);
    throw error;
  }
};

// GET /learning-paths/:id/admin/enrollments returns Response { data: LearningPathEnrollment[] }
export const getLearningPathEnrollments = async (learningPathId) => {
  try {
    return await apiGet(`/learning-paths/${learningPathId}/admin/enrollments`);
  } catch (error) {
    console.error("Error fetching learning path enrollments:", error);
    return [];
  }
};
