// Enrollment Service
// Manages user enrollments in courses via real backend API.

import { apiGet, apiPost } from "@/app/services/http";

// ==================== REAL API CALLS ====================

export const enrollInCourseAPI = async (courseId) => {
  try {
    return await apiPost(`/courses/${courseId}/enroll`, {});
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
};

export const getEnrollmentStatus = async (courseId) => {
  try {
    return await apiGet(`/courses/${courseId}/enrollment`);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return null;
  }
};

export const getCourseProgress = async (courseId) => {
  try {
    return await apiGet(`/courses/${courseId}/progress`);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return null;
  }
};

export const markLessonCompleteAPI = async (lessonId, timeSpentSeconds = 0) => {
  try {
    return await apiPost(`/lessons/${lessonId}/complete`, { timeSpentSeconds });
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    throw error;
  }
};

export const dropCourseAPI = async (courseId) => {
  try {
    return await apiPost(`/courses/${courseId}/drop`, {});
  } catch (error) {
    console.error("Error dropping course:", error);
    throw error;
  }
};

// ─── ADMIN ENROLLMENT API CALLS ───────────────────────────────────

export const adminEnrollUserInCourse = async (courseId, userId) => {
  try {
    return await apiPost(`/courses/${courseId}/admin/enroll-user`, { userId });
  } catch (error) {
    console.error("Error enrolling user in course:", error);
    throw error;
  }
};

export const adminEnrollTeamInCourse = async (courseId, teamId) => {
  try {
    return await apiPost(`/courses/${courseId}/admin/enroll-team`, { teamId });
  } catch (error) {
    console.error("Error enrolling team in course:", error);
    throw error;
  }
};

export const getCourseEnrollments = async (courseId) => {
  try {
    return await apiGet(`/courses/${courseId}/admin/enrollments`);
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    return [];
  }
};

// Get per-lesson completion counts for a course (admin)
export const getLessonCompletionCounts = async (courseId) => {
  try {
    // apiGet already unwraps the { message, data } envelope
    const counts = await apiGet(`/courses/${courseId}/admin/lesson-completion-counts`);
    return counts || {};
  } catch (error) {
    console.error("Error fetching lesson completion counts:", error);
    return {};
  }
};

export const enrollInLearningPathAPI = async (learningPathId) => {
  try {
    return await apiPost(`/learning-paths/${learningPathId}/enroll`, {});
  } catch (error) {
    console.error("Error enrolling in learning path:", error);
    throw error;
  }
};

export const adminEnrollUserInLearningPath = async (learningPathId, userId) => {
  try {
    return await apiPost(`/learning-paths/${learningPathId}/admin/enroll-user`, { userId });
  } catch (error) {
    console.error("Error enrolling user in learning path:", error);
    throw error;
  }
};

export const adminEnrollTeamInLearningPath = async (learningPathId, teamId) => {
  try {
    return await apiPost(`/learning-paths/${learningPathId}/admin/enroll-team`, { teamId });
  } catch (error) {
    console.error("Error enrolling team in learning path:", error);
    throw error;
  }
};

export const getLearningPathEnrollments = async (learningPathId) => {
  try {
    return await apiGet(`/learning-paths/${learningPathId}/admin/enrollments`);
  } catch (error) {
    console.error("Error fetching learning path enrollments:", error);
    return [];
  }
};

const ENROLLMENT_KEY = "meroedu_enrollments";

const getStored = () => {
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENT_KEY) || "[]");
  } catch {
    return [];
  }
};
const store = (data) => {
  try {
    localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

const SEED_DATA = [
  {
    id: "en1",
    userId: 1,
    userName: "John Doe",
    courseId: 1,
    courseTitle: "Introduction to React",
    category: "Programming",
    coverImage: "https://picsum.photos/seed/react/400/250",
    status: "active",
    progress: 45,
    enrolledAt: "2025-02-01",
    lastAccessed: "2025-03-25",
    completedLessons: ["l1", "l2"],
    totalLessons: 12,
    instructor: "Jane Smith",
    duration: "8 hours",
  },
  {
    id: "en2",
    userId: 1,
    userName: "John Doe",
    courseId: 2,
    courseTitle: "Advanced CSS Techniques",
    category: "Design",
    coverImage: "https://picsum.photos/seed/css/400/250",
    status: "active",
    progress: 72,
    enrolledAt: "2025-01-15",
    lastAccessed: "2025-03-24",
    completedLessons: ["l1", "l2", "l3"],
    totalLessons: 8,
    instructor: "Bob Wilson",
    duration: "5 hours",
  },
  {
    id: "en3",
    userId: 1,
    userName: "John Doe",
    courseId: 4,
    courseTitle: "JavaScript Fundamentals",
    category: "Programming",
    coverImage: "https://picsum.photos/seed/js2/400/250",
    status: "completed",
    progress: 100,
    enrolledAt: "2025-01-20",
    lastAccessed: "2025-03-10",
    completedLessons: ["l1", "l2", "l3"],
    totalLessons: 3,
    instructor: "Jane Smith",
    duration: "6 hours",
    completedAt: "2025-03-10",
  },
  {
    id: "en4",
    userId: 2,
    userName: "Jane Smith",
    courseId: 1,
    courseTitle: "Introduction to React",
    category: "Programming",
    coverImage: "https://picsum.photos/seed/react/400/250",
    status: "active",
    progress: 30,
    enrolledAt: "2025-03-01",
    lastAccessed: "2025-03-20",
    completedLessons: ["l1"],
    totalLessons: 12,
    instructor: "Jane Smith",
    duration: "8 hours",
  },
  {
    id: "en5",
    userId: 3,
    userName: "Diana Prince",
    courseId: 3,
    courseTitle: "Python for Data Science",
    category: "Data Science",
    coverImage: "https://picsum.photos/seed/python/400/250",
    status: "active",
    progress: 15,
    enrolledAt: "2025-03-10",
    lastAccessed: "2025-03-22",
    completedLessons: [],
    totalLessons: 20,
    instructor: "Bob Wilson",
    duration: "15 hours",
  },
  {
    id: "en6",
    userId: 4,
    userName: "Bob Wilson",
    courseId: 1,
    courseTitle: "Introduction to React",
    category: "Programming",
    coverImage: "https://picsum.photos/seed/react/400/250",
    status: "dropped",
    progress: 10,
    enrolledAt: "2025-02-05",
    lastAccessed: "2025-02-20",
    completedLessons: ["l1"],
    totalLessons: 12,
    instructor: "Jane Smith",
    duration: "8 hours",
  },
  {
    id: "en7",
    userId: 6,
    userName: "Alice Brown",
    courseId: 1,
    courseTitle: "Introduction to React",
    category: "Programming",
    coverImage: "https://picsum.photos/seed/react/400/250",
    status: "active",
    progress: 85,
    enrolledAt: "2025-01-20",
    lastAccessed: "2025-03-25",
    completedLessons: ["l1", "l2", "l3", "l4"],
    totalLessons: 5,
    instructor: "Jane Smith",
    duration: "8 hours",
  },
  {
    id: "en8",
    userId: 6,
    userName: "Alice Brown",
    courseId: 4,
    courseTitle: "JavaScript Fundamentals",
    category: "Programming",
    coverImage: "https://picsum.photos/seed/js2/400/250",
    status: "completed",
    progress: 100,
    enrolledAt: "2025-01-20",
    lastAccessed: "2025-03-05",
    completedLessons: ["l1", "l2", "l3"],
    totalLessons: 3,
    instructor: "Jane Smith",
    duration: "6 hours",
    completedAt: "2025-03-05",
  },
  {
    id: "en9",
    userId: 6,
    userName: "Alice Brown",
    courseId: 6,
    courseTitle: "UI/UX Design Principles",
    category: "Design",
    coverImage: "https://picsum.photos/seed/uiux/400/250",
    status: "active",
    progress: 50,
    enrolledAt: "2025-02-15",
    lastAccessed: "2025-03-24",
    completedLessons: ["l1", "l2"],
    totalLessons: 4,
    instructor: "Diana Prince",
    duration: "10 hours",
  },
  {
    id: "en10",
    userId: 2,
    userName: "Jane Smith",
    courseId: 5,
    courseTitle: "Machine Learning Fundamentals",
    category: "Data Science",
    coverImage: "https://picsum.photos/seed/ml/400/250",
    status: "active",
    progress: 60,
    enrolledAt: "2025-02-20",
    lastAccessed: "2025-03-26",
    completedLessons: ["l1", "l2", "l3", "l4", "l5", "l6"],
    totalLessons: 10,
    instructor: "Bob Wilson",
    duration: "12 hours",
  },
  {
    id: "en11",
    userId: 3,
    userName: "Diana Prince",
    courseId: 7,
    courseTitle: "Cloud Architecture with AWS",
    category: "DevOps",
    coverImage: "https://picsum.photos/seed/aws/400/250",
    status: "active",
    progress: 25,
    enrolledAt: "2025-03-05",
    lastAccessed: "2025-03-23",
    completedLessons: ["l1"],
    totalLessons: 15,
    instructor: "John Doe",
    duration: "10 hours",
  },
  {
    id: "en12",
    userId: 1,
    userName: "John Doe",
    courseId: 8,
    courseTitle: "Mobile App Development",
    category: "Programming",
    coverImage: "https://picsum.photos/seed/mobile/400/250",
    status: "active",
    progress: 10,
    enrolledAt: "2025-03-20",
    lastAccessed: "2025-03-26",
    completedLessons: [],
    totalLessons: 18,
    instructor: "Jane Smith",
    duration: "8 hours",
  },
];

let enrollments = getStored();
if (enrollments.length === 0) {
  enrollments = [...SEED_DATA];
  store(enrollments);
}

export const fetchEnrollments = async (params = {}) => {
  await new Promise((r) => setTimeout(r, 200));
  let results = [...enrollments];
  if (params.userId) results = results.filter((e) => e.userId === parseInt(params.userId));
  if (params.courseId) results = results.filter((e) => e.courseId === parseInt(params.courseId));
  if (params.status) results = results.filter((e) => e.status === params.status);
  if (params.sort === "recent")
    results.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
  else if (params.sort === "progress") results.sort((a, b) => b.progress - a.progress);
  return Promise.resolve(results);
};

export const enrollInCourse = async (userId, courseId) => {
  await new Promise((r) => setTimeout(r, 300));
  const existing = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  if (existing) {
    if (existing.status === "dropped") {
      existing.status = "active";
      existing.lastAccessed = new Date().toISOString().split("T")[0];
      store(enrollments);
      return Promise.resolve(existing);
    }
    return Promise.reject(new Error("You are already enrolled in this course."));
  }
  const newEnrollment = {
    id: `en_${Date.now()}`,
    userId,
    courseId,
    status: "active",
    progress: 0,
    enrolledAt: new Date().toISOString().split("T")[0],
    lastAccessed: new Date().toISOString().split("T")[0],
    completedLessons: [],
    totalLessons: 0,
  };
  enrollments.push(newEnrollment);
  store(enrollments);
  return Promise.resolve(newEnrollment);
};

export const dropCourse = async (userId, courseId) => {
  await new Promise((r) => setTimeout(r, 200));
  const enrollment = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  if (!enrollment) return Promise.reject(new Error("Enrollment not found."));
  enrollment.status = "dropped";
  store(enrollments);
  return Promise.resolve(enrollment);
};

export const markLessonComplete = async (userId, courseId, lessonId, totalLessons) => {
  await new Promise((r) => setTimeout(r, 200));
  const enrollment = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  if (!enrollment) return Promise.reject(new Error("Enrollment not found."));
  if (!enrollment.completedLessons.includes(lessonId)) enrollment.completedLessons.push(lessonId);
  enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
  enrollment.lastAccessed = new Date().toISOString().split("T")[0];
  if (enrollment.progress >= 100) {
    enrollment.status = "completed";
    enrollment.completedAt = new Date().toISOString().split("T")[0];
  }
  store(enrollments);
  return Promise.resolve(enrollment);
};

export const isEnrolled = (userId, courseId) => {
  const e = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  return e || null;
};
