import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, TrendingUp, BarChart3, Loader } from "lucide-react";

import { fetchDashboardStats } from "@/app/services/dashboardService";
import DashboardLayout from "@/components/ui/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";

/**
 * AdminDashboard — Main dashboard for Administrator role.
 * Shows system stats, recent activity, and quick actions.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="System overview and management">
      {loading ? (
        <LoadingState count={4} height="h-24" />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <BookOpen size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-text-primary text-2xl font-bold">{stats?.totalCourses || 0}</p>
                  <p className="text-text-muted text-[11px]">Total Courses</p>
                </div>
              </div>
            </div>
            <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Users size={18} className="text-success" />
                </div>
                <div>
                  <p className="text-text-primary text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-text-muted text-[11px]">Total Users</p>
                </div>
              </div>
            </div>
            <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <TrendingUp size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-primary text-2xl font-bold">{stats?.totalTeams || 0}</p>
                  <p className="text-text-muted text-[11px]">Teams</p>
                </div>
              </div>
            </div>
            <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <BarChart3 size={18} className="text-warning" />
                </div>
                <div>
                  <p className="text-text-primary text-2xl font-bold">
                    {stats?.totalCategories || 0}
                  </p>
                  <p className="text-text-muted text-[11px]">Categories</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h3 className="text-text-primary text-sm font-semibold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Create Course", path: "/courses/create", icon: BookOpen, color: "primary" },
              { label: "Add User", path: "/users/create", icon: Users, color: "success" },
              { label: "Create Team", path: "/teams/create", icon: TrendingUp, color: "accent" },
              { label: "View Reports", path: "/progress", icon: BarChart3, color: "warning" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="border-border bg-bg-surface flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`bg-${action.color}/10 flex h-10 w-10 items-center justify-center rounded-lg`}
                >
                  <action.icon size={18} className={`text-${action.color}`} />
                </div>
                <span className="text-text-primary text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
