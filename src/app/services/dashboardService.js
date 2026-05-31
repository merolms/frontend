// Dashboard API Service
import { apiGet } from "@/app/services/http";

export const fetchDashboardStats = async () => {
  try {
    const body = await fetchStatsEnvelope();
    return {
      totalCourses: body.course_count || 0,
      totalUsers: body.user_count || 0,
      totalTeams: body.team_count || 0,
      totalCategories: body.category_count || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

async function fetchStatsEnvelope() {
  const token = localStorage.getItem("auth_token");
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}/stats`, { headers });
  if (!res.ok) throw new Error("Failed to fetch stats: " + res.status);
  const body = await res.json();
  return body.data || body;
}
