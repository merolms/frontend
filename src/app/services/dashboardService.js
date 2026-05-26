// Dashboard API Service
// This service handles all API calls related to the dashboard

import { apiGet } from '@/app/services/http';

/**
 * Fetch dashboard statistics (KPIs)
 * @returns {Promise<Object>} Dashboard statistics data
 */
export const fetchDashboardStats = async () => {
  try {
    return await apiGet('/dashboard/stats');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch recent activities for the dashboard
 * @param {Object} [options] - Filter options (e.g., limit, type, dateRange)
 * @returns {Promise<Array>} Recent activities data
 */
export const fetchDashboardActivity = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams(options);
    return await apiGet(`/dashboard/activity?${queryParams}`);
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    throw error;
  }
};

/**
 * Fetch enrollment charts data
 * @param {Object} [options] - Filter options (e.g., timeRange, courseId, teamId)
 * @returns {Promise<Object>} Enrollment charts data
 */
export const fetchEnrollmentCharts = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams(options);
    return await apiGet(`/dashboard/enrollment?${queryParams}`);
  } catch (error) {
    console.error('Error fetching enrollment charts:', error);
    throw error;
  }
};

/**
 * Fetch team statistics
 * @returns {Promise<Object>} Team statistics data
 */
export const fetchTeamStats = async () => {
  try {
    return await apiGet('/dashboard/teams');
  } catch (error) {
    console.error('Error fetching team stats:', error);
    throw error;
  }
};

// Mock data for development when API is not available
export const mockDashboardStats = {
  totalCourses: 24,
  totalUsers: 450,
  totalTeams: 18,
  activeTeams: 15,
  completedLessons: 156,
  avgCompletion: '78%',
  courseGrowth: '+3 this month',
  userGrowth: '+28 this month',
  teamGrowth: '+3 this month',
  completionTrend: '+5% vs last month',
  totalEnrollments: 342,
  activeEnrollments: 289,
  completedEnrollments: 53,
  recentCourses: [
    { id: 1, title: 'Introduction to React', users: 45, progress: 72, status: 'published' },
    { id: 2, title: 'Advanced CSS Techniques', users: 32, progress: 58, status: 'published' },
    { id: 4, title: 'JavaScript Fundamentals', users: 78, progress: 85, status: 'published' },
    { id: 6, title: 'UI/UX Design Principles', users: 56, progress: 41, status: 'published' },
  ],
  teamPerformance: [
    { name: 'Team Alpha', progress: 85, color: '#33a163' },
    { name: 'Team Beta', progress: 72, color: '#2185d0' },
    { name: 'Team Gamma', progress: 63, color: '#f2711c' },
    { name: 'Team Delta', progress: 91, color: '#6435c9' },
  ],
};

export const mockDashboardActivity = [
  {
    id: 1,
    title: 'React Quiz - Chapter 5',
    type: 'quiz',
    date: 'Today, 2:00 PM',
    course: 'Introduction to React',
    user: 'John Doe'
  },
  {
    id: 2,
    title: 'Live Session: CSS Grid',
    type: 'live',
    date: 'Tomorrow, 10:00 AM',
    course: 'Advanced CSS Techniques',
    user: 'Jane Smith'
  },
  {
    id: 3,
    title: 'Assignment: Data Visualization',
    type: 'assignment',
    date: 'Next Week',
    course: 'Python for Data Science',
    user: 'Bob Wilson'
  },
  {
    id: 4,
    title: 'New course published: JavaScript Fundamentals',
    type: 'course',
    date: 'Yesterday',
    course: 'JavaScript Fundamentals',
    user: 'Admin'
  },
  {
    id: 5,
    title: 'Team Alpha completed the onboarding course',
    type: 'team',
    date: '2 days ago',
    course: 'Onboarding 101',
    user: 'Team Alpha'
  }
];

export const mockEnrollmentCharts = {
  monthlyEnrollment: [
    { month: 'Jan', enrollments: 45 },
    { month: 'Feb', enrollments: 52 },
    { month: 'Mar', enrollments: 38 },
    { month: 'Apr', enrollments: 61 },
    { month: 'May', enrollments: 49 },
    { month: 'Jun', enrollments: 58 }
  ],
  coursePopularity: [
    { name: 'React', value: 45 },
    { name: 'CSS', value: 32 },
    { name: 'Python', value: 67 },
    { name: 'Machine Learning', value: 28 },
    { name: 'JavaScript', value: 41 }
  ]
};

export const mockTeamStats = {
  totalTeams: 18,
  activeTeams: 15,
  teamGrowth: '+3 this month',
  teamPerformance: [
    { name: 'Team Alpha', progress: 85, color: 'green' },
    { name: 'Team Beta', progress: 72, color: 'blue' },
    { name: 'Team Gamma', progress: 63, color: 'orange' },
    { name: 'Team Delta', progress: 91, color: 'purple' }
  ]
};
