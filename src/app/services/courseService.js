// Course API Service
// Handles all API calls related to courses and lessons

import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from "@/app/services/http";

// ==================== FIELD MAPPING ====================
// Backend sends: created_at, updated_at (integer unix timestamps)
// Backend sends: imageUrl, authorId, categoryId, lessonCount (camelCase)
// Backend sends: duration as integer (minutes)
// Backend sends: status as integer enum (0=DRAFT, 1=PUBLISHED, 2=ARCHIVED)
// Backend lesson fields: displayOrder, durationMinutes, lessonType, contentFormat, isFreePreview

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop";

// Convert unix timestamp (integer) to ISO date string, handling both seconds and milliseconds
const tsToIso = (ts) => {
  if (!ts) return "";
  // Backend sends seconds since epoch
  const ms = ts > 1e12 ? ts : ts * 1000;
  return new Date(ms).toISOString().split("T")[0];
};

const normalizeCourse = (c) => ({
  id: c.id,
  title: c.title || "",
  description: c.description || "",
  imageURL: c.imageUrl || DEFAULT_COURSE_IMAGE,
  coverImage: c.imageUrl || DEFAULT_COURSE_IMAGE,
  duration: c.duration != null ? String(c.duration) : "",
  // Backend sends status as lowercase string: "draft", "published", "archived"
  status: (c.status || "draft").toLowerCase(),
  categoryID: c.categoryId != null ? Number(c.categoryId) : null,
  category: c.category?.name || c.categories?.name || "",
  authorID: c.authorId,
  author: c.author ? `${c.author.firstName || ""} ${c.author.lastName || ""}`.trim() : "",
  authorEmail: c.author?.email || "",
  tags: c.tags || [],
  totalLessons: c.lessonCount || 0,
  enrolledUsers: c.enrolledUsers || 0,
  createdAt: tsToIso(c.created_at || c.createdAt),
  updatedAt: tsToIso(c.updated_at || c.updatedAt),
  lessons: c.lessons || [],
  attachments: c.attachments || [],
});

// ==================== COURSES ====================

/**
 * Fetch paginated courses. Frontend uses page/limit; backend uses start/limit.
 * Returns { courses, total, page, limit, totalPages } for the frontend.
 */
// GET /courses returns Summaries { total, data: Course[] }
// apiGet unwraps to data, so we get the array directly.
// For total, we need the raw envelope — use a separate fetch for that.
const CLIENT_FILTER_FETCH_LIMIT = 500;

export const fetchCourses = async (params = {}) => {
  try {
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 8;
    const search = params.search || "";
    const status = params.status && params.status !== "all" ? params.status : "";
    const category = params.category && params.category !== "all" ? params.category : "";
    const sort = params.sort && params.sort !== "all" ? params.sort : "";

    const searchQS = search ? `&search=${encodeURIComponent(search)}` : "";
    const needsClientFiltering = Boolean(status || category || sort);

    if (!needsClientFiltering) {
      const start = (page - 1) * limit;
      const [list, stat] = await Promise.all([
        apiGet(`/courses?start=${start}&limit=${limit}${searchQS}`),
        apiGet(`/courses/stat${search ? `?search=${encodeURIComponent(search)}` : ""}`).catch(
          () => null
        ),
      ]);
      const total =
        typeof stat?.count === "number" ? stat.count : Array.isArray(list) ? list.length : 0;
      return {
        courses: (Array.isArray(list) ? list : []).map(normalizeCourse),
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    }

    const list = await apiGet(`/courses?start=0&limit=${CLIENT_FILTER_FETCH_LIMIT}${searchQS}`);
    let courses = (Array.isArray(list) ? list : []).map(normalizeCourse);
    if (status) courses = courses.filter((c) => c.status === status);
    if (category) courses = courses.filter((c) => c.category === category);
    if (sort === "title") {
      courses = [...courses].sort((a, b) => a.title.localeCompare(b.title));
    }

    const total = courses.length;
    return {
      courses: courses.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

/**
 * Fetch a single course by ID
 * GET /courses/{id} returns Response { data: Course }
 */
export const fetchCourseById = async (id) => {
  try {
    const data = await apiGet(`/courses/${id}`);
    return normalizeCourse(data);
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

// Upload a course cover image; returns the public URL string.
export const uploadCourseImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", "course");
  formData.append("content_type", "image");
  const result = await apiUpload("/media/upload", formData);
  return result?.presignUrl || result?.url || "";
};

/**
 * Create a new course
 * POST /courses returns Response { data: Course }
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
      status: courseData.status || "Draft",
    };
    const data = await apiPost("/courses", payload);
    return normalizeCourse(data);
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

/**
 * Update an existing course
 * PUT /courses/{id} returns Response { data: Course }
 */
export const updateCourse = async (id, courseData) => {
  try {
    const payload = {
      title: courseData.title,
      description: courseData.description,
      imageUrl: courseData.coverImage || courseData.imageURL || "",
      categoryId: courseData.category || null,
      duration: parseInt(courseData.duration, 10) || 0,
      status: courseData.status || "Draft",
    };
    const data = await apiPut(`/courses/${id}`, payload);
    return normalizeCourse(data);
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

/**
 * Delete a course
 * DELETE /courses/{id} returns 204 No Content
 */
export const deleteCourse = async (id) => {
  try {
    return await apiDelete(`/courses/${id}`);
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

/**
 * Publish a course
 * PUT /courses/{id}/publish returns Response { data: Course }
 */
export const publishCourse = async (id) => {
  try {
    const data = await apiPut(`/courses/${id}/publish`);
    return normalizeCourse(data);
  } catch (error) {
    console.error("Error publishing course:", error);
    throw error;
  }
};

/**
 * Archive a course
 * PUT /courses/{id}/archive returns Response { data: Course }
 */
export const archiveCourse = async (id) => {
  try {
    const data = await apiPut(`/courses/${id}/archive`);
    return normalizeCourse(data);
  } catch (error) {
    console.error("Error archiving course:", error);
    throw error;
  }
};

/**
 * Mark course as important
 * PUT /courses/{id}/important returns Response { data: Course }
 */
export const markCourseImportant = async (id) => {
  try {
    const data = await apiPut(`/courses/${id}/important`);
    return normalizeCourse(data);
  } catch (error) {
    console.error("Error marking course important:", error);
    throw error;
  }
};

// Restore an archived course back to Draft so it can be edited/republished.
export const restoreCourse = async (id) => {
  try {
    const data = await apiPut(`/courses/${id}`, { status: "Draft" });
    return normalizeCourse(data);
  } catch (error) {
    console.error("Error restoring course:", error);
    throw error;
  }
};

// Map frontend lesson type to backend enum values
// DB enum: 'video','text','quiz','assignment','live','mixed'
const VALID_LESSON_TYPES = new Set(["video", "text", "quiz", "assignment", "live", "mixed"]);
const lessonTypeFromFrontend = (type) => {
  const t = (type || "text").toLowerCase();
  return VALID_LESSON_TYPES.has(t) ? t : "text";
};

// Map frontend content format to backend enum values
// DB enum: 'rich_text','blocks','markdown','scorm'
const VALID_CONTENT_FORMATS = new Set(["rich_text", "blocks", "markdown", "scorm"]);
const contentFormatFromFrontend = (format) => {
  const f = (format || "rich_text").toLowerCase();
  return VALID_CONTENT_FORMATS.has(f) ? f : "rich_text";
};

// ==================== LESSONS ====================

// Backend Lesson fields from swagger:
// { id, courseId, title, contentFormat, displayOrder, durationMinutes, lessonType, status, isFreePreview, createdAt, updatedAt }
const normalizeLesson = (l) => {
  return {
    id: l.id,
    courseId: l.courseId,
    title: l.title || "",
    duration: l.durationMinutes != null ? String(l.durationMinutes) : (l.duration || ""),
    contentFormat: l.contentFormat || "",
    type: l.lessonType || l.type || "text",
    status: l.status !== undefined && l.status !== null ? String(l.status) : "0",
    sort_order: l.displayOrder || l.orderNumber || l.order || 0,
    isFreePreview: l.isFreePreview || false,
    points: l.points || 0,
    updatedAt: tsToIso(l.updatedAt || l.updated_at),
    createdAt: tsToIso(l.createdAt || l.created_at),
    tags: l.tags || [],
  };
};

/**
 * Get lessons for a course
 * GET /courses/{id}/lessons returns Response { data: Lesson[] }
 * apiGet unwraps to data array
 */
export const fetchLessons = async (courseId) => {
  try {
    const data = await apiGet(`/courses/${courseId}/lessons`);
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeLesson);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
};

/**
 * Create a lesson
 * POST /courses/{id}/lessons returns Response { data: Lesson }
 */
export const createLesson = async (courseId, lessonData) => {
  try {
    const payload = {
      courseId: parseInt(courseId, 10),
      title: lessonData.title,
      displayOrder: lessonData.sort_order || 0,
      lessonType: lessonTypeFromFrontend(lessonData.type),
      contentFormat: contentFormatFromFrontend(lessonData.contentFormat),
      durationMinutes: lessonData.durationMinutes || 0,
      isFreePreview: lessonData.isFreePreview || false,
    };
    const data = await apiPost(`/courses/${courseId}/lessons`, payload);
    return normalizeLesson(data);
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
};

/**
 * Update a lesson
 * PUT /lessons/{id} returns Response { data: Lesson }
 */
export const updateLesson = async (courseId, lessonId, lessonData) => {
  try {
    const payload = {
      courseId: parseInt(courseId, 10),
      title: lessonData.title,
      lessonType: lessonTypeFromFrontend(lessonData.type),
      contentFormat: contentFormatFromFrontend(lessonData.contentFormat),
      displayOrder: lessonData.sort_order || 0,
      durationMinutes: lessonData.durationMinutes || 0,
      isFreePreview: lessonData.isFreePreview || false,
    };
    const data = await apiPut(`/lessons/${lessonId}`, payload);
    return normalizeLesson(data);
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
};

/**
 * Delete a lesson
 * DELETE /lessons/{id} returns 204 No Content
 */
export const deleteLesson = async (courseId, lessonId) => {
  try {
    return await apiDelete(`/lessons/${lessonId}`);
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};

/**
 * Reorder lessons within a course
 * PUT /courses/{id}/lessons/reorder body: ReorderRequest[] = [{ id, orderNumber }]
 */
export const reorderLessons = async (courseId, lessons) => {
  try {
    const payload = lessons.map((l, i) => ({ id: l.id, orderNumber: i + 1 }));
    const data = await apiPut(`/courses/${courseId}/lessons/reorder`, payload);
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
