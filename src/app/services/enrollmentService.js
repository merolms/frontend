// Enrollment Service
// Manages user enrollments in courses. Replace API calls with real backend later.

const ENROLLMENT_KEY = 'meroedu_enrollments';

const getStored = () => {
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENT_KEY) || '[]');
  } catch {
    return [];
  }
};

const store = (data) => {
  try {
    localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors etc
  }
};

const SEED_DATA = [
  { id: 'en1', userId: 1, courseId: 1, status: 'active', progress: 45, enrolledAt: '2025-02-01', lastAccessed: '2025-03-25', completedLessons: ['l1', 'l2'] },
  { id: 'en2', userId: 1, courseId: 2, status: 'active', progress: 72, enrolledAt: '2025-01-15', lastAccessed: '2025-03-24', completedLessons: ['l1', 'l2', 'l3'] },
  { id: 'en3', userId: 1, courseId: 4, status: 'completed', progress: 100, enrolledAt: '2025-01-20', lastAccessed: '2025-03-10', completedLessons: ['l1', 'l2', 'l3'] },
  { id: 'en4', userId: 2, courseId: 1, status: 'active', progress: 30, enrolledAt: '2025-03-01', lastAccessed: '2025-03-20', completedLessons: ['l1'] },
  { id: 'en5', userId: 3, courseId: 3, status: 'active', progress: 15, enrolledAt: '2025-03-10', lastAccessed: '2025-03-22', completedLessons: [] },
  { id: 'en6', userId: 4, courseId: 1, status: 'dropped', progress: 10, enrolledAt: '2025-02-05', lastAccessed: '2025-02-20', completedLessons: ['l1'] },
  { id: 'en7', userId: 6, courseId: 1, status: 'active', progress: 85, enrolledAt: '2025-01-20', lastAccessed: '2025-03-25', completedLessons: ['l1', 'l2', 'l3', 'l4'] },
  { id: 'en8', userId: 6, courseId: 4, status: 'completed', progress: 100, enrolledAt: '2025-01-20', lastAccessed: '2025-03-05', completedLessons: ['l1', 'l2', 'l3'] },
  { id: 'en9', userId: 6, courseId: 6, status: 'active', progress: 50, enrolledAt: '2025-02-15', lastAccessed: '2025-03-24', completedLessons: ['l1', 'l2'] },
];

let enrollments = getStored();
if (enrollments.length === 0) {
  enrollments = [...SEED_DATA];
  store(enrollments);
}

// ==================== ENROLLMENT CRUD ====================

export const fetchEnrollments = async (params = {}) => {
  await new Promise((r) => setTimeout(r, 200));
  let results = [...enrollments];

  if (params.userId) {
    results = results.filter((e) => e.userId === parseInt(params.userId));
  }
  if (params.courseId) {
    results = results.filter((e) => e.courseId === parseInt(params.courseId));
  }
  if (params.status) {
    results = results.filter((e) => e.status === params.status);
  }
  if (params.sort === 'recent') {
    results.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
  } else if (params.sort === 'progress') {
    results.sort((a, b) => b.progress - a.progress);
  }

  return Promise.resolve(results);
};

export const enrollInCourse = async (userId, courseId) => {
  await new Promise((r) => setTimeout(r, 300));
  const existing = enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId
  );
  if (existing) {
    if (existing.status === 'dropped') {
      existing.status = 'active';
      existing.lastAccessed = new Date().toISOString().split('T')[0];
      store(enrollments);
      return Promise.resolve(existing);
    }
    return Promise.reject(new Error('You are already enrolled in this course.'));
  }

  const newEnrollment = {
    id: `en_${Date.now()}`,
    userId,
    courseId,
    status: 'active',
    progress: 0,
    enrolledAt: new Date().toISOString().split('T')[0],
    lastAccessed: new Date().toISOString().split('T')[0],
    completedLessons: [],
  };
  enrollments.push(newEnrollment);
  store(enrollments);
  return Promise.resolve(newEnrollment);
};

export const unenrollFromCourse = async (userId, courseId) => {
  await new Promise((r) => setTimeout(r, 300));
  enrollments = enrollments.filter(
    (e) => !(e.userId === userId && e.courseId === courseId)
  );
  store(enrollments);
  return Promise.resolve();
};

export const dropCourse = async (userId, courseId) => {
  await new Promise((r) => setTimeout(r, 200));
  const enrollment = enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId
  );
  if (!enrollment) return Promise.reject(new Error('Enrollment not found.'));
  enrollment.status = 'dropped';
  store(enrollments);
  return Promise.resolve(enrollment);
};

export const markLessonComplete = async (userId, courseId, lessonId, totalLessons) => {
  await new Promise((r) => setTimeout(r, 200));
  const enrollment = enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId
  );
  if (!enrollment) return Promise.reject(new Error('Enrollment not found.'));

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
  }
  enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
  enrollment.lastAccessed = new Date().toISOString().split('T')[0];

  if (enrollment.progress >= 100) {
    enrollment.status = 'completed';
  }

  store(enrollments);
  return Promise.resolve(enrollment);
};

export const isEnrolled = (userId, courseId) => {
  const enrollment = enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId
  );
  return enrollment ? enrollment : null;
};

export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
};
