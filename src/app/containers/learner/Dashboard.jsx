import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchEnrollments } from "@/app/services/enrollmentService";
import LoadingState from "@/components/common/LoadingState";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { usePageTitle } from "@/hooks";

/**
 * LearnerDashboard — Main dashboard for Student role.
 * Shows enrolled courses, progress, and quick actions.
 */
const LearnerDashboard = () => {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, [user?.id]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await fetchEnrollments({ userId: user?.id, sort: "recent" });
      setEnrollments(data || []);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const completedEnrollments = enrollments.filter((e) => e.status === "completed");
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0;

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.firstName || "Learner"}!`}
      subtitle="Track your learning progress and continue where you left off"
    >
      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard title="Enrolled" value={enrollments.length} icon={BookOpen} color="primary" />
        <StatCard
          title="In Progress"
          value={activeEnrollments.length}
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="Completed"
          value={completedEnrollments.length}
          icon={CheckCircle}
          color="success"
        />
        <StatCard title="Avg Progress" value={`${avgProgress}%`} icon={Clock} color="warning" />
      </div>

      {/* Continue Learning */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-text-primary text-sm font-semibold">Continue Learning</h3>
      </div>

      {loading ? (
        <LoadingState count={3} height="h-32" />
      ) : activeEnrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} className="text-text-muted" />}
          title="No courses in progress"
          description="Browse courses to start learning."
          action={
            <Button size="sm" onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="border-border bg-bg-surface cursor-pointer rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
              onClick={() => navigate(`/courses/${enrollment.courseId}/learn`)}
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-text-primary truncate text-sm font-semibold">
                  {enrollment.courseTitle}
                </h4>
                <p className="text-text-muted text-[11px]">{enrollment.category}</p>
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">
                      {enrollment.progress || 0}% complete
                    </span>
                  </div>
                  <ProgressBar progress={enrollment.progress || 0} size="sm" />
                </div>
              </div>
              <button className="bg-primary hover:bg-primary-hover text-secondary mt-3 flex-shrink-0 rounded-md px-3 py-1.5 text-xs">
                Continue
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearnerDashboard;
