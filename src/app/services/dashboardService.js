// Dashboard API Service
// GET /stats returns Response { data: StatsResponse }
// StatsResponse = { course_count, user_count, team_count, category_count }

import { apiGet } from "@/app/services/http";

export const fetchDashboardStats = async () => {
  try {
    const data = await apiGet("/stats");
    return {
      totalCourses: data?.course_count || data?.courseCount || 0,
      totalUsers: data?.user_count || data?.userCount || 0,
      totalTeams: data?.team_count || data?.teamCount || 0,
      totalCategories: data?.category_count || data?.categoryCount || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
