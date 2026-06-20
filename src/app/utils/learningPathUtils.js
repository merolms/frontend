// Learning Path utility functions
// Non-API related helper functions for learning path management

/**
 * Prepare learning path data for API submission
 * @param {object} data - Form data from LearningPathForm
 * @returns {object} API-ready learning path data
 */
export const prepareLearningPathData = (data) => ({
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
});

/**
 * Prepare learning path update data (only include changed fields)
 * @param {object} data - Form data from LearningPathForm
 * @returns {object} API-ready learning path update data
 */
export const prepareLearningPathUpdateData = (data) => {
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
  return body;
};

/**
 * Prepare courses for reordering
 * @param {Array} courses - Array of courses
 * @returns {object} API-ready courses array
 */
export const prepareCoursesForReorder = (courses) => ({
  courses: courses.map((c, i) => ({
    courseId: c.courseId || c.id,
    order: c.order || i + 1,
  })),
});
