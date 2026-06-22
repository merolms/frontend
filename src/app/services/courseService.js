// Course API Service
// Handles all API calls related to courses and lessons
// Migrated to use orval-generated functions where available
// Returns backend data directly without normalization

import {
  courseCreate,
  courseDelete,
  courseGetAll,
  courseGetByID,
  courseUpdate,
  createLessonForCourse,
  lessonDelete,
  lessonGetAll,
  lessonUpdate,
  reorderLessons as orvalReorderLessons,
} from "@/app/api/orval";

// ==================== COURSES ====================

/**
 * Fetch paginated courses. Frontend uses page/limit; backend uses start/limit.
 * Returns { courses, total, page, limit, totalPages } for the frontend.
 */
export const fetchCourses = async (params = {}) => {
  try {
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 8;
    const search = params.search || "";
    const status = params.status && params.status !== "all" ? params.status : undefined;
    const category = params.category && params.category !== "all" ? params.category : undefined;
    const sort = params.sort && params.sort !== "all" ? params.sort : undefined;

    const response = await courseGetAll({
      page,
      limit,
      search: search || undefined,
      status,
      category,
      sort,
    });

    // Assuming backend now returns an object like:
    // { data: courses[], total: number, page: number, limit: number }
    // We'll just return the response as is; the consumer can rely on totalPages if provided.
    // If totalPages is not provided, we could compute it, but to "what backend has sent" we leave as is.
    return response;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

/**
 * Fetch a single course by ID
 */
export const fetchCourseById = async (id) => {
  try {
    const data = await courseGetByID(id);
    return data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

// Upload a course cover image; returns the public URL string.
// Uses custom FormData upload - orval mediaUpload uses JSON body
export const uploadCourseImage = async (file) => {
  const { apiUpload } = await import("@/app/services/http");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", "course");
  formData.append("content_type", "image");
  const result = await apiUpload("/media/upload", formData);
  return result?.presignUrl || result?.url || "";
};

/**
 * Create a new course
 */
export const createCourse = async (courseData) => {
  try {
    const payload = {
      title: courseData.title,
      description: courseData.description,
      imageUrl: courseData.coverImage || courseData.imageURL || "",
      categoryId: courseData.category || null,
      authorId: courseData.authorID || null,
      duration: parseInt(courseData.duration, 10) || 0,
      status: courseData.status || "draft",
    };
    const data = await courseCreate(payload);
    return data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

/**
 * Update an existing course
 */
export const updateCourse = async (id, courseData) => {
  try {
    const payload = {
      title: courseData.title,
      description: courseData.description,
      imageUrl: courseData.coverImage || courseData.imageURL || "",
      categoryId: courseData.category || null,
      duration: parseInt(courseData.duration, 10) || 0,
      status: courseData.status || "draft",
    };
    const data = await courseUpdate(parseInt(id, 10), payload);
    return data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (id) => {
  try {
    return await courseDelete(id);
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

/**
 * Mark course as important
 * PUT /courses/{id}/important returns Response { data: Course }
 */
export const markCourseImportant = async (id) => {
  try {
    const { apiPut } = await import("@/app/services/http");
    const data = await apiPut(`/courses/${id}/important`);
    return data;
  } catch (error) {
    console.error("Error marking course important:", error);
    throw error;
  }
};

// ==================== LESSONS ====================

/**
 * Get lessons for a course
 */
export const fetchLessons = async (courseId) => {
  try {
    const data = await lessonGetAll({ courseId: parseInt(courseId, 10) });
    const list = data?.data || [];
    return list;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
};

/**
 * Create a lesson for a course
 * @param {number} courseId - The course ID to create the lesson for
 * @param {object} lessonData - The lesson data (title, displayOrder, etc.)
 */
export const createLesson = async (courseId, lessonData) => {
  try {
    const data = await createLessonForCourse(parseInt(courseId, 10), lessonData);
    return data;
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
};

/**
 * Update a lesson
 */
export const updateLesson = async (courseId, lessonId, lessonData) => {
  try {
    const data = await lessonUpdate(lessonId, lessonData);
    return data;
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (courseId, lessonId) => {
  try {
    return await lessonDelete(lessonId);
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};

/**
 * Reorder lessons within a course
 */
export const reorderLessons = async (courseId, lessons) => {
  try {
    const payload = lessons.map((l, i) => ({ 
      id: l.id, 
      displayOrder: i + 1 
    }));
    const data = await orvalReorderLessons(parseInt(courseId, 10), payload);
    return data;
  } catch (error) {
    console.error("Error reordering lessons:", error);
    throw error;
  }
};

// ==================== MOCK DATA (fallback for dev) ====================

let mockCourses = [
  {
    id: 1,
    title: "Introduction to React",
    description:
      "Learn the fundamentals of React including components, state, hooks, and building modern web applications.",
    category: "Programming",
    tags: ["react", "javascript", "frontend"],
    status: "published",
    author: "John Doe",
    coverImage: "https://picsum.photos/seed/react/400/250",
    images: [
      "https://picsum.photos/seed/react1/400/250",
      "https://picsum.photos/seed/react2/400/250",
      "https://picsum.photos/seed/react3/400/250",
    ],
    totalLessons: 12,
    enrolledUsers: 45,
    duration: "8 hours",
    createdAt: "2025-01-15",
    updatedAt: "2025-03-20",
  },
  {
    id: 2,
    title: "Advanced CSS Techniques",
    description:
      "Master CSS Grid, Flexbox, animations, and modern layout techniques for responsive web design.",
    category: "Design",
    tags: ["css", "design", "frontend"],
    status: "published",
    author: "Jane Smith",
    coverImage: "https://picsum.photos/seed/css/400/250",
    images: ["https://picsum.photos/seed/css1/400/250", "https://picsum.photos/seed/css2/400/250"],
    totalLessons: 8,
    enrolledUsers: 32,
    duration: "5 hours",
    createdAt: "2025-02-01",
    updatedAt: "2025-03-15",
  },
  {
    id: 3,
    title: "Python for Data Science",
    description:
      "Comprehensive introduction to Python for data analysis, visualization, and machine learning.",
    category: "Data Science",
    tags: ["python", "data", "machine-learning"],
    status: "draft",
    author: "Bob Wilson",
    coverImage: "https://picsum.photos/seed/python/400/250",
    images: [
      "https://picsum.photos/seed/py1/400/250",
      "https://picsum.photos/seed/py2/400/250",
      "https://picsum.photos/seed/py3/400/250",
      "https://picsum.photos/seed/py4/400/250",
    ],
    totalLessons: 20,
    enrolledUsers: 0,
    duration: "15 hours",
    createdAt: "2025-03-01",
    updatedAt: "2025-03-25",
  },
];

export { mockCourses };

const mockLessons = {
  1: [
    { id: 1, title: "Getting Started with React", duration: "30 mins", order: 1 },
    { id: 2, title: "Components and Props", duration: "45 mins", order: 2 },
    { id: 3, title: "State and Lifecycle", duration: "40 mins", order: 3 },
    { id: 4, title: "Hooks in Depth", duration: "50 mins", order: 4 },
    { id: 5, title: "Building a Real App", duration: "60 mins", order: 5 },
  ],
};

// Mock API functions — used as fallback when backend is unreachable
export const mockFetchCourses = async (params = {}) => {
  let results = [...mockCourses];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }
  if (params.status) {
    results = results.filter((c) => c.status === params.status);
  }
  if (params.category) {
    results = results.filter((c) => c.category === params.category);
  }
  if (params.sort === "title") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (params.sort === "date") {
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (params.sort === "enrolled") {
    results.sort((a, b) => b.enrolledUsers - a.enrolledUsers);
  }

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 6;
  const total = results.length;
  const start = (page - 1) * limit;
  const paginatedResults = results.slice(start, start + limit);

  return {
    courses: paginatedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const mockFetchCourseById = (id) => {
  const course = mockCourses.find((c) => c.id === parseInt(id));
  if (!course) return Promise.reject(new Error("Course not found"));
  return Promise.resolve(course);
};

export const mockCreateCourse = (courseData) => {
  const newCourse = {
    ...courseData,
    id: Date.now(),
    status: "draft",
    enrolledUsers: 0,
    totalLessons: 0,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };
  mockCourses.push(newCourse);
  return Promise.resolve(newCourse);
};

export const mockUpdateCourse = (id, courseData) => {
  const index = mockCourses.findIndex((c) => c.id === parseInt(id));
  if (index === -1) return Promise.reject(new Error("Course not found"));
  mockCourses[index] = {
    ...mockCourses[index],
    ...courseData,
    updatedAt: new Date().toISOString().split("T")[0],
  };
  return Promise.resolve(mockCourses[index]);
};

export const mockDeleteCourse = (id) => {
  mockCourses = mockCourses.filter((c) => c.id !== parseInt(id));
  return Promise.resolve();
};

export const mockPublishCourse = (id) => {
  const course = mockCourses.find((c) => c.id === parseInt(id));
  if (!course) return Promise.reject(new Error("Course not found"));
  course.status = "published";
  course.updatedAt = new Date().toISOString().split("T")[0];
  return Promise.resolve(course);
};

export const mockArchiveCourse = (id) => {
  const course = mockCourses.find((c) => c.id === parseInt(id));
  if (!course) return Promise.reject(new Error("Course not found"));
  course.status = "archived";
  course.updatedAt = new Date().toISOString().split("T")[0];
  return Promise.resolve(course);
};

export const mockFetchLessons = (courseId) => {
  const lessons = mockLessons[courseId] || [];
  return Promise.resolve(lessons);
};

export const mockCreateLesson = (courseId, lessonData) => {
  if (!mockLessons[courseId]) mockLessons[courseId] = [];
  const newLesson = { ...lessonData, id: Date.now(), order: mockLessons[courseId].length + 1 };
  mockLessons[courseId].push(newLesson);
  const course = mockCourses.find((c) => c.id === parseInt(courseId));
  if (course) course.totalLessons = mockLessons[courseId].length;
  return Promise.resolve(newLesson);
};

export const mockUpdateLesson = (courseId, lessonId, lessonData) => {
  const lessons = mockLessons[courseId];
  if (!lessons) return Promise.reject(new Error("Course not found"));
  const index = lessons.findIndex((l) => l.id === parseInt(lessonId));
  if (index === -1) return Promise.reject(new Error("Lesson not found"));
  lessons[index] = { ...lessons[index], ...lessonData };
  return Promise.resolve(lessons[index]);
};

export const mockDeleteLesson = (courseId, lessonId) => {
  if (!mockLessons[courseId]) return Promise.resolve();
  mockLessons[courseId] = mockLessons[courseId].filter((l) => l.id !== parseInt(lessonId));
  const course = mockCourses.find((c) => c.id === parseInt(courseId));
  if (course) course.totalLessons = mockLessons[courseId]?.length || 0;
  return Promise.resolve();
};

export const mockCategories = ["Programming", "Design", "Data Science", "DevOps", "Business"];
