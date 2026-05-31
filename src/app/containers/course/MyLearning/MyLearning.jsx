import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  TrendingUp,
  Calendar,
  CheckCircle,
  BarChart3,
  Filter,
} from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchEnrollments } from "@/app/services/enrollmentService";
import { useSelector } from "react-redux";

const statusConfig = {
  active: { label: "In Progress", color: "blue", icon: Play },
  completed: { label: "Completed", color: "green", icon: CheckCircle },
  dropped: { label: "Dropped", color: "red", icon: BookOpen },
};

const ProgressBar = ({ progress, color = "#6366F1", size = "md" }) => {
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div className={`w-full ${h} bg-bg-surface-active overflow-hidden rounded-full`}>
      <div
        className={`${h} rounded-full transition-all duration-500`}
        style={{ width: `${progress}%`, background: color }}
      />
    </div>
  );
};

const MyLearning = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    loadEnrollments();
  }, [user, sortBy]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await fetchEnrollments({ userId: user?.id, sort: sortBy });
      setEnrollments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    statusFilter === "all" ? enrollments : enrollments.filter((e) => e.status === statusFilter);

  // Stats
  const totalCourses = enrollments.length;
  const completed = enrollments.filter((e) => e.status === "completed").length;
  const inProgress = enrollments.filter((e) => e.status === "active").length;
  const avgProgress =
    totalCourses > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses)
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
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border-border bg-bg-surface h-32 animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={48} className="text-text-muted mb-3" />
          <p className="text-text-primary text-sm font-medium">No courses found</p>
          <p className="text-text-muted mt-1 text-xs">Browse courses to start learning.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/courses")}>
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((enrollment) => {
            const cfg = statusConfig[enrollment.status] || statusConfig.active;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={enrollment.id}
                className="border-border bg-bg-surface overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex gap-4 p-4">
                  {/* Course image */}
                  {enrollment.coverImage ? (
                    <img
                      src={enrollment.coverImage}
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
                          <span>{enrollment.category}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {enrollment.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {enrollment.lastAccessed}
                          </span>
                          {enrollment.instructor && <span>By {enrollment.instructor}</span>}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color === "green" ? "bg-success/10 text-success" : cfg.color === "red" ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}
                        >
                          <StatusIcon size={10} /> {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-text-muted text-[11px]">
                          {enrollment.completedLessons?.length || 0} of{" "}
                          {enrollment.totalLessons || 0} lessons
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: enrollment.status === "completed" ? "#22C55E" : "#6366F1",
                          }}
                        >
                          {enrollment.progress || 0}%
                        </span>
                      </div>
                      <ProgressBar
                        progress={enrollment.progress || 0}
                        color={enrollment.status === "completed" ? "#22C55E" : "#6366F1"}
                      />
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {enrollment.status === "completed" && (
                          <button className="text-accent flex cursor-pointer items-center gap-1 text-[11px] hover:underline">
                            <Award size={11} /> View Certificate
                          </button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                      >
                        {enrollment.status === "completed" ? "Review" : "Continue"} →
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
