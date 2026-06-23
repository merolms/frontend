// Learning Path utility functions
// Non-API related helper functions for learning path management

export interface LearningPathFormData {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  estimatedDuration?: string;
  status?: string;
  tags?: string[];
  color?: string;
  courses?: CourseOrder[];
}

export interface CourseOrder {
  courseId?: number;
  id?: number;
  order?: number;
}

/**
 * Prepare learning path data for API submission
 * @param data - Form data from LearningPathForm
 * @returns API-ready learning path data
 */
export const prepareLearningPathData = (data: LearningPathFormData): any => ({
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
 * @param data - Form data from LearningPathForm
 * @returns API-ready learning path update data
 */
export const prepareLearningPathUpdateData = (data: LearningPathFormData): any => {
  const body: any = {};
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
 * @param courses - Array of courses
 * @returns API-ready courses array
 */
export const prepareCoursesForReorder = (courses: CourseOrder[]): any => ({
  courses: courses.map((c, i) => ({
    courseId: c.courseId || c.id,
    order: c.order || i + 1,
  })),
});
