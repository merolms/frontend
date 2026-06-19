import { BarChart3, BookOpen, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useDashboardStats } from "@/hooks/queries/useEntities";
import LoadingState from "@/components/common/LoadingState";
import StatCard from "@/components/common/StatCard";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { usePageTitle } from "@/hooks";

/**
 * AdminDashboard — Main dashboard for Administrator role.
 * Shows system stats, recent activity, and quick actions.
 */
const AdminDashboard = () => {
  usePageTitle("Admin Dashboard");
  const navigate = useNavigate();

  // ─── TanStack Query: replaces useEffect + manual state ───
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="System overview and management">
      {isLoading ? (
        <LoadingState count={4} height="h-24" />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <StatCard
              title="Total Courses"
              value={stats.courseCount || 0}
              icon={BookOpen}
              color="primary"
            />
            <StatCard
              title="Total Users"
              value={stats.userCount || 0}
              icon={Users}
              color="success"
            />
            <StatCard
              title="Teams"
              value={stats.teamCount || 0}
              icon={TrendingUp}
              color="accent"
            />
            <StatCard
              title="Categories"
              value={stats.categoryCount || 0}
              icon={BarChart3}
              color="warning"
            />
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
