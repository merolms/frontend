import { BookOpen, Plus, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchCourses } from "@/app/services/courseService";
import { fetchDashboardStats } from "@/app/services/dashboardService";
import Can from "@/components/auth/Can";
import LoadingState from "@/components/common/LoadingState";
import StatCard from "@/components/common/StatCard";
import DashboardLayout from "@/components/ui/dashboard-layout";

/**
 * InstructorDashboard — Main dashboard for Instructor role.
 * Shows created courses, student count, and quick actions.
 */
const InstructorDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, statsData] = await Promise.all([
        fetchCourses({ search: "", page: 1, limit: 10 }),
        fetchDashboardStats().catch(() => null),
      ]);
      setCourses(coursesData?.courses || []);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const publishedCourses = courses.filter((c) => c.status === "Published");
  const draftCourses = courses.filter((c) => c.status === "DRAFT");

  return (
    <DashboardLayout
      title={`Welcome, ${user?.firstName || "Instructor"}!`}
      subtitle="Manage your courses and track student progress"
    >
      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{courses.length}</p>
              <p className="text-text-muted text-[11px]">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <TrendingUp size={18} className="text-success" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{publishedCourses.length}</p>
              <p className="text-text-muted text-[11px]">Published</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{draftCourses.length}</p>
              <p className="text-text-muted text-[11px]">Drafts</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-bg-surface rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Users size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-2xl font-bold">{stats?.totalUsers || 0}</p>
              <p className="text-text-muted text-[11px]">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-text-primary text-sm font-semibold">My Courses</h3>
        <Can permission="courses.create">
          <button
            onClick={() => navigate("/courses/create")}
            className="bg-primary hover:bg-primary-hover flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-white"
          >
            <Plus size={14} /> New Course
          </button>
        </Can>
      </div>

      {loading ? (
        <LoadingState count={3} height="h-32" />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <StatCard
              title="Total Courses"
              value={courses.length}
              icon={BookOpen}
              color="primary"
            />
            <StatCard
              title="Published"
              value={publishedCourses.length}
              icon={TrendingUp}
              color="success"
            />
            <StatCard title="Drafts" value={draftCourses.length} icon={BookOpen} color="warning" />
            <StatCard title="Students" value={stats?.totalUsers || 0} icon={Users} color="accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-text-primary truncate text-sm font-semibold">{course.title}</h4>
            <p className="text-text-muted text-[11px]">
              {course.category} • {course.totalLessons} lessons
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${course.status === "Published" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
            >
              {course.status}
            </span>
            <Can permission="courses.edit">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${course.id}/edit`);
                }}
                className="text-text-muted hover:text-primary text-xs"
              >
                Edit
              </button>
            </Can>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default InstructorDashboard;
