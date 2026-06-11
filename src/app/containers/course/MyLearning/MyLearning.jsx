import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getMyEnrollments } from "@/app/services/enrollmentService";
import EmptyState from "@/components/common/EmptyState";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import LoadingState from "@/components/common/LoadingState";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/ui/dashboard-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageTitle } from "@/hooks";
import { getStatusColor, getStatusLabel } from "@/utils";

const MyLearning = () => {
  usePageTitle("My Learning");
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    loadEnrollments();
  }, [user?.id]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      setError(err.message || "Failed to load your courses.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = (
    statusFilter === "all" ? enrollments : enrollments.filter((e) => e.status === statusFilter)
  )
    .slice()
    .sort((a, b) =>
      sortBy === "progress"
        ? (b.progressPercent ?? 0) - (a.progressPercent ?? 0)
        : (b.lastAccessedAt ?? 0) - (a.lastAccessedAt ?? 0)
    );

  // Stats
  const totalCourses = enrollments.length;
  const completed = enrollments.filter((e) => e.status === "completed").length;
  const inProgress = enrollments.filter((e) => e.status === "active").length;
  const avgProgress =
    totalCourses > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercent || 0), 0) / totalCourses)
      : 0;

  return (
    <DashboardLayout title="My Learning" subtitle="Track your learning progress and achievements">
      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{totalCourses}</p>
              <p className="text-text-muted text-[11px]">Total Enrolled</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <TrendingUp size={18} className="text-success" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{inProgress}</p>
              <p className="text-text-muted text-[11px]">In Progress</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Award size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{completed}</p>
              <p className="text-text-muted text-[11px]">Completed</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BarChart3 size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{avgProgress}%</p>
              <p className="text-text-muted text-[11px]">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="border-border bg-bg-surface mb-6 rounded-xl border p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-semibold">Overall Learning Progress</h3>
          <span className="text-primary text-sm font-bold">{avgProgress}%</span>
        </div>
        <ProgressBar progress={avgProgress} size="lg" />
        <div className="text-text-muted mt-2 flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="bg-success h-2 w-2 rounded-full" /> {completed} completed
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-primary h-2 w-2 rounded-full" /> {inProgress} in progress
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-error h-2 w-2 rounded-full" />{" "}
            {enrollments.filter((e) => e.status === "dropped").length} dropped
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-text-primary text-sm font-semibold">My Courses</h3>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v);
            }}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course list */}
      {loading ? (
        <LoadingState count={4} height="h-32" />
      ) : error ? (
        <div className="space-y-3">
          <FormErrorBanner message={error} />
          <Button size="sm" onClick={loadEnrollments}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No courses found"
          description="Browse courses to start learning."
          action={
            <Button size="sm" onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((enrollment) => {
            const statusColor = getStatusColor(enrollment.status);
            const statusLabel = getStatusLabel(enrollment.status);
            const StatusIcon =
              enrollment.status === "completed"
                ? CheckCircle
                : enrollment.status === "dropped"
                  ? BookOpen
                  : Play;
            return (
              <div
                key={enrollment.id}
                className="border-border bg-bg-surface overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex gap-4 p-4">
                  {/* Course image */}
                  {enrollment.courseImageUrl ? (
                    <img
                      src={enrollment.courseImageUrl}
                      alt={enrollment.courseTitle}
                      className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="bg-bg-surface-active flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg">
                      <BookOpen size={24} className="text-text-muted" />
                    </div>
                  )}

                  {/* Course info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="text-text-primary line-clamp-1 text-sm font-semibold">
                            {enrollment.courseTitle}
                          </h4>
                        </div>
                        <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                          {enrollment.courseDuration > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {enrollment.courseDuration}
                            </span>
                          )}
                          {enrollment.lastAccessedAt > 0 && (
                            <span className="flex items-center gap-1">
                              <Calendar size={10} /> Last visited{" "}
                              {new Date(enrollment.lastAccessedAt * 1000).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor === "green" ? "bg-success/10 text-success" : statusColor === "red" ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}
                        >
                          <StatusIcon size={10} /> {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-text-muted text-[11px]">
                          {enrollment.completedLessons || 0} of {enrollment.totalLessons || 0}{" "}
                          lessons
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: enrollment.status === "completed" ? "hsl(var(--success))" : "hsl(var(--primary))",
                          }}
                        >
                          {enrollment.progressPercent || 0}%
                        </span>
                      </div>
                      <ProgressBar
                        progress={enrollment.progressPercent || 0}
                        color={enrollment.status === "completed" ? "hsl(var(--success))" : "hsl(var(--primary))"}
                      />
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center justify-end">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          navigate(
                            enrollment.status === "active"
                              ? `/courses/${enrollment.courseId}/learn`
                              : `/courses/${enrollment.courseId}`
                          )
                        }
                      >
                        {enrollment.status === "completed"
                          ? "Review"
                          : enrollment.status === "dropped"
                            ? "View Course"
                            : "Continue"}{" "}
                        →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyLearning;
