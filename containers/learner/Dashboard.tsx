// @ts-nocheck
import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import StatCard from "@/components/common/StatCard";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import { Button } from "@/components/ui/Button";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { usePageTitle } from "@/hooks";
import { useMyEnrollments } from "@/hooks/queries/useEnrollments";

/**
 * LearnerDashboard — Main dashboard for Student role.
 * Shows enrolled courses, progress, and quick actions.
 */
const LearnerDashboard = () => {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  // TanStack Query hook for fetching user's enrollments
  const { data: enrollments = [], isLoading } = useMyEnrollments(100);

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
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-foreground text-xl font-bold tracking-tight">Continue Learning</h3>
      </div>

      {isLoading ? (
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
              className="group border-border bg-card hover:border-primary/20 cursor-pointer rounded-xl border p-5 shadow-sm transition-all hover:shadow-md"
              onClick={() => navigate(`/courses/${enrollment.courseId}/learn`)}
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-foreground group-hover:text-primary truncate text-base font-bold transition-colors">
                  {enrollment.courseTitle}
                </h4>
                <p className="text-muted-foreground text-xs font-medium">{enrollment.category}</p>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">
                      {enrollment.progress || 0}% complete
                    </span>
                  </div>
                  <ProgressBar progress={enrollment.progress || 0} size="sm" />
                </div>
              </div>
              <Button className="mt-5 w-full" variant="primary" size="sm">
                Continue Learning
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearnerDashboard;
