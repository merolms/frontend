import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle, Clock, TrendingUp, Loader } from "lucide-react";

import { fetchEnrollments } from "@/app/services/enrollmentService";
import DashboardLayout from "@/components/ui/dashboard-layout";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";

/**
 * LearnerDashboard — Main dashboard for Student role.
 * Shows enrolled courses, progress, and quick actions.
 */
const LearnerDashboard = () => {
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
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{enrollments.length}</p>
              <p className="text-text-muted text-[11px]">Enrolled</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <TrendingUp size={18} className="text-success" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{activeEnrollments.length}</p>
              <p className="text-text-muted text-[11px]">In Progress</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <CheckCircle size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{completedEnrollments.length}</p>
              <p className="text-text-muted text-[11px]">Completed</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Clock size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{avgProgress}%</p>
              <p className="text-text-muted text-[11px]">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-text-primary text-sm font-semibold">Continue Learning</h3>
      </div>

      {loading ? (
        <LoadingState count={3} height="h-32" />
      ) : activeEnrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No courses in progress"
          description="Browse courses to start learning."
          action={
            <button
              onClick={() => navigate("/courses")}
              className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-sm text-white"
            >
              Browse Courses
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeEnrollments.slice(0, 3).map((enrollment) => (
            <div
              key={enrollment.id}
              className="border-border bg-bg-surface flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
              onClick={() => navigate(`/courses/${enrollment.courseId}/learn`)}
            >
              {enrollment.coverImage ? (
                <img
                  src={enrollment.coverImage}
                  alt={enrollment.courseTitle}
                  className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="bg-bg-surface-active flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-lg">
                  <BookOpen size={20} className="text-text-muted" />
                </div>
              )}
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
              <button className="bg-primary hover:bg-primary-hover flex-shrink-0 rounded-md px-3 py-1.5 text-xs text-white">
                Continue →
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearnerDashboard;
