// Course API Service
// Handles all API calls related to courses and lessons

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// ==================== COURSES ====================

/**
 * Fetch all courses with optional filters
 * @param {Object} [params] - Query params (search, status, category, page, limit, sort)
 * @returns {Promise<Object>} Courses list with pagination
 */
export const fetchCourses = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/courses?${queryParams}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Fetch a single course by ID
 * @param {string|number} id - Course ID
 * @returns {Promise<Object>} Course data
 */
export const fetchCourseById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

/**
 * Create a new course
 * @param {Object} courseData - Course data
 * @returns {Promise<Object>} Created course
 */
export const createCourse = async (courseData) => {
  try {
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Update an existing course
 * @param {string|number} id - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Updated course
 */
export const updateCourse = async (id, courseData) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

/**
 * Delete a course
 * @param {string|number} id - Course ID
 * @returns {Promise<void>}
 */
export const deleteCourse = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

/**
 * Publish a course
 * @param {string|number} id - Course ID
 * @returns {Promise<Object>} Updated course
 */
export const publishCourse = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}/publish`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error publishing course:', error);
    throw error;
  }
};

/**
 * Archive a course
 * @param {string|number} id - Course ID
 * @returns {Promise<Object>} Updated course
 */
export const archiveCourse = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}/archive`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error archiving course:', error);
    throw error;
  }
};

// ==================== LESSONS ====================

/**
 * Fetch lessons for a course
 * @param {string|number} courseId - Course ID
 * @returns {Promise<Array>} Lessons list
 */
export const fetchLessons = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/lessons`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

/**
 * Create a lesson for a course
 * @param {string|number} courseId - Course ID
 * @param {Object} lessonData - Lesson data
 * @returns {Promise<Object>} Created lesson
 */
export const createLesson = async (courseId, lessonData) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

/**
 * Update a lesson
 * @param {string|number} courseId - Course ID
 * @param {string|number} lessonId - Lesson ID
 * @param {Object} lessonData - Updated lesson data
 * @returns {Promise<Object>} Updated lesson
 */
export const updateLesson = async (courseId, lessonId, lessonData) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

/**
 * Delete a lesson
 * @param {string|number} courseId - Course ID
 * @param {string|number} lessonId - Lesson ID
 * @returns {Promise<void>}
 */
export const deleteLesson = async (courseId, lessonId) => {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

// ==================== MOCK DATA ====================

let mockCourses = [
  {
    id: 1,
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React including components, state, hooks, and building modern web applications.',
    category: 'Programming',
    tags: ['react', 'javascript', 'frontend'],
    status: 'published',
    author: 'John Doe',
    coverImage: 'https://picsum.photos/seed/react/400/250',
    totalLessons: 12,
    enrolledUsers: 45,
    duration: '8 hours',
    createdAt: '2025-01-15',
    updatedAt: '2025-03-20',
  },
  {
    id: 2,
    title: 'Advanced CSS Techniques',
    description: 'Master CSS Grid, Flexbox, animations, and modern layout techniques for responsive web design.',
    category: 'Design',
    tags: ['css', 'design', 'frontend'],
    status: 'published',
    author: 'Jane Smith',
    coverImage: 'https://picsum.photos/seed/css/400/250',
    totalLessons: 8,
    enrolledUsers: 32,
    duration: '5 hours',
    createdAt: '2025-02-01',
    updatedAt: '2025-03-15',
  },
  {
    id: 3,
    title: 'Python for Data Science',
    description: 'Comprehensive introduction to Python for data analysis, visualization, and machine learning.',
    category: 'Data Science',
    tags: ['python', 'data', 'machine-learning'],
    status: 'draft',
    author: 'Bob Wilson',
    coverImage: 'https://picsum.photos/seed/python/400/250',
    totalLessons: 20,
    enrolledUsers: 0,
    duration: '15 hours',
    createdAt: '2025-03-01',
    updatedAt: '2025-03-25',
  },
  {
    id: 4,
    title: 'JavaScript Fundamentals',
    description: 'From variables to async/await — a complete guide to modern JavaScript.',
    category: 'Programming',
    tags: ['javascript', 'programming', 'web'],
    status: 'published',
    author: 'Alice Johnson',
    coverImage: 'https://picsum.photos/seed/js/400/250',
    totalLessons: 15,
    enrolledUsers: 78,
    duration: '10 hours',
    createdAt: '2025-01-20',
    updatedAt: '2025-03-10',
  },
  {
    id: 5,
    title: 'Machine Learning Basics',
    description: 'Introduction to ML concepts, algorithms, and practical applications with real-world examples.',
    category: 'Data Science',
    tags: ['machine-learning', 'ai', 'python'],
    status: 'archived',
    author: 'Charlie Brown',
    coverImage: 'https://picsum.photos/seed/ml/400/250',
    totalLessons: 18,
    enrolledUsers: 120,
    duration: '12 hours',
    createdAt: '2024-11-01',
    updatedAt: '2025-01-15',
  },
  {
    id: 6,
    title: 'UI/UX Design Principles',
    description: 'Learn the core principles of user interface and user experience design.',
    category: 'Design',
    tags: ['ui', 'ux', 'design'],
    status: 'published',
    author: 'Diana Prince',
    coverImage: 'https://picsum.photos/seed/uiux/400/250',
    totalLessons: 10,
    enrolledUsers: 56,
    duration: '7 hours',
    createdAt: '2025-02-15',
    updatedAt: '2025-03-18',
  },
  {
    id: 7,
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
    category: 'Programming',
    tags: ['nodejs', 'backend', 'javascript'],
    status: 'draft',
    author: 'Eve Adams',
    coverImage: 'https://picsum.photos/seed/nodejs/400/250',
    totalLessons: 14,
    enrolledUsers: 0,
    duration: '11 hours',
    createdAt: '2025-03-10',
    updatedAt: '2025-03-22',
  },
  {
    id: 8,
    title: 'Cloud Computing with AWS',
    description: 'Master AWS services including EC2, S3, Lambda, and deployment strategies.',
    category: 'DevOps',
    tags: ['aws', 'cloud', 'devops'],
    status: 'published',
    author: 'Frank Miller',
    coverImage: 'https://picsum.photos/seed/aws/400/250',
    totalLessons: 16,
    enrolledUsers: 34,
    duration: '13 hours',
    createdAt: '2025-01-05',
    updatedAt: '2025-03-05',
  },
];

export { mockCourses };

const mockLessons = {
  1: [
    { id: 1, title: 'Getting Started with React', description: 'Introduction to React and its ecosystem', duration: '30 mins', order: 1 },
    { id: 2, title: 'Components and Props', description: 'Understanding React components', duration: '45 mins', order: 2 },
    { id: 3, title: 'State and Lifecycle', description: 'Managing state in React', duration: '40 mins', order: 3 },
    { id: 4, title: 'Hooks in Depth', description: 'useState, useEffect, and custom hooks', duration: '50 mins', order: 4 },
    { id: 5, title: 'Building a Real App', description: 'Putting it all together', duration: '60 mins', order: 5 },
  ],
  2: [
    { id: 1, title: 'CSS Grid Fundamentals', description: 'Understanding grid layout', duration: '35 mins', order: 1 },
    { id: 2, title: 'Flexbox Deep Dive', description: 'Mastering flexbox', duration: '40 mins', order: 2 },
    { id: 3, title: 'Animations and Transitions', description: 'Adding motion to your designs', duration: '45 mins', order: 3 },
  ],
};

// Mock API functions that work without a backend
export const mockFetchCourses = (params = {}) => {
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

  // Sort
  if (params.sort === 'title') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (params.sort === 'date') {
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (params.sort === 'enrolled') {
    results.sort((a, b) => b.enrolledUsers - a.enrolledUsers);
  }

  // Pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 6;
  const total = results.length;
  const start = (page - 1) * limit;
  const paginatedResults = results.slice(start, start + limit);

  return Promise.resolve({
    courses: paginatedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const mockFetchCourseById = (id) => {
  const course = mockCourses.find((c) => c.id === parseInt(id));
  if (!course) return Promise.reject(new Error('Course not found'));
  return Promise.resolve(course);
};

export const mockCreateCourse = (courseData) => {
  const newCourse = {
    ...courseData,
    id: Date.now(),
    status: 'draft',
    enrolledUsers: 0,
    totalLessons: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  mockCourses.push(newCourse);
  return Promise.resolve(newCourse);
};

export const mockUpdateCourse = (id, courseData) => {
  const index = mockCourses.findIndex((c) => c.id === parseInt(id));
  if (index === -1) return Promise.reject(new Error('Course not found'));
  mockCourses[index] = {
    ...mockCourses[index],
    ...courseData,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  return Promise.resolve(mockCourses[index]);
};

export const mockDeleteCourse = (id) => {
  mockCourses = mockCourses.filter((c) => c.id !== parseInt(id));
  return Promise.resolve();
};

export const mockPublishCourse = (id) => {
  const course = mockCourses.find((c) => c.id === parseInt(id));
  if (!course) return Promise.reject(new Error('Course not found'));
  course.status = 'published';
  course.updatedAt = new Date().toISOString().split('T')[0];
  return Promise.resolve(course);
};

export const mockArchiveCourse = (id) => {
  const course = mockCourses.find((c) => c.id === parseInt(id));
  if (!course) return Promise.reject(new Error('Course not found'));
  course.status = 'archived';
  course.updatedAt = new Date().toISOString().split('T')[0];
  return Promise.resolve(course);
};

export const mockFetchLessons = (courseId) => {
  const lessons = mockLessons[courseId] || [];
  return Promise.resolve(lessons);
};

export const mockCreateLesson = (courseId, lessonData) => {
  if (!mockLessons[courseId]) mockLessons[courseId] = [];
  const newLesson = {
    ...lessonData,
    id: Date.now(),
    order: mockLessons[courseId].length + 1,
  };
  mockLessons[courseId].push(newLesson);

  // Update course lesson count
  const course = mockCourses.find((c) => c.id === parseInt(courseId));
  if (course) course.totalLessons = mockLessons[courseId].length;

  return Promise.resolve(newLesson);
};

export const mockUpdateLesson = (courseId, lessonId, lessonData) => {
  const lessons = mockLessons[courseId];
  if (!lessons) return Promise.reject(new Error('Course not found'));
  const index = lessons.findIndex((l) => l.id === parseInt(lessonId));
  if (index === -1) return Promise.reject(new Error('Lesson not found'));
  lessons[index] = { ...lessons[index], ...lessonData };
  return Promise.resolve(lessons[index]);
};

export const mockDeleteLesson = (courseId, lessonId) => {
  if (!mockLessons[courseId]) return Promise.resolve();
  mockLessons[courseId] = mockLessons[courseId].filter((l) => l.id !== parseInt(lessonId));

  // Update course lesson count
  const course = mockCourses.find((c) => c.id === parseInt(courseId));
  if (course) course.totalLessons = mockLessons[courseId]?.length || 0;

  return Promise.resolve();
};

export const mockCategories = ['Programming', 'Design', 'Data Science', 'DevOps', 'Business'];
