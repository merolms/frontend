import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Play,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchLearningPathById, fetchLearningPathProgress } from "@/app/services/learningPathService";
import DashboardLayout from "@/components/ui/dashboard-layout";

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

const LearningPathProgressPage = () => {
  const navigate = useNavigate();
  const { learningPathId } = useParams();

  const [path, setPath] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [remainingCourses, setRemainingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pathData, progressData] = await Promise.all([
        fetchLearningPathById(learningPathId),
        fetchLearningPathProgress(learningPathId),
      ]);

      if (!pathData) {
        setError("Learning path not found.");
        return;
      }

      setPath(pathData);
      setEnrollment(progressData?.enrollment || progressData || null);
      setCompletedCourses(progressData?.completedCourses || []);
      setRemainingCourses(progressData?.remainingCourses || []);
    } catch (err) {
      setError(err.message || "Failed to load progress.");
    } finally {
      setLoading(false);
    }
  }, [learningPathId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.status === "completed" || progress >= 100;

  if (loading) {
    return (
      <DashboardLayout title="Loading…" subtitle="Fetching your progress">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-border bg-bg-surface h-24 animate-pulse rounded-xl border" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error" subtitle={error}>
        <button
          onClick={() => navigate("/my-learning")}
          className="text-primary text-sm hover:underline"
        >
          ← Back to My Learning
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={path?.title || "Learning Path Progress"}
      subtitle={`${progress}% complete • ${completedCourses.length} of ${path?.totalCourses || 0} courses done`}
    >
      {/* Back button */}
      <button
        onClick={() => navigate("/my-learning")}
        className="text-text-muted hover:text-text-primary mb-4 flex items-center gap-1 text-sm"
      >
        <ArrowLeft size={14} /> Back to My Learning
      </button>

      {/* Progress overview */}
      <div className="border-border bg-bg-surface mb-6 rounded-xl border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-primary text-sm font-semibold">Overall Progress</h3>
          <span className="text-primary text-lg font-bold">{progress}%</span>
        </div>
        <ProgressBar progress={progress} size="lg" color={isCompleted ? "#22C55E" : "#6366F1"} />
        <div className="text-text-muted mt-3 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <CheckCircle size={12} className="text-success" /> {completedCourses.length} completed
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} className="text-primary" /> {remainingCourses.length} remaining
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-success">
              <Trophy size={12} /> Completed!
            </span>
          )}
        </div>
      </div>

      {/* Completed courses */}
      {completedCourses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-text-primary mb-3 text-sm font-semibold">Completed Courses</h3>
          <div className="space-y-2">
            {completedCourses.map((course) => (
              <div
                key={course.courseId}
                className="border-border bg-bg-surface flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle size={16} className="text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-text-primary text-sm font-medium">{course.title}</div>
                  {course.completedAt && (
                    <div className="text-text-muted text-[11px]">
                      Completed {new Date(course.completedAt * 1000).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/courses/${course.courseId}`)}
                  className="text-primary text-xs hover:underline"
                >
                  Review →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remaining courses */}
      {remainingCourses.length > 0 && (
        <div>
          <h3 className="text-text-primary mb-3 text-sm font-semibold">Up Next</h3>
          <div className="space-y-2">
            {remainingCourses.map((course, idx) => (
              <div
                key={course.courseId}
                className="border-border bg-bg-surface flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {idx === 0 ? (
                    <Play size={14} className="text-primary" />
                  ) : (
                    <span className="text-primary text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-text-primary text-sm font-medium">{course.title}</div>
                </div>
                <button
                  onClick={() => navigate(`/courses/${course.courseId}`)}
                  className="bg-primary hover:bg-primary-hover rounded-md px-3 py-1 text-xs text-white"
                >
                  {idx === 0 ? "Start" : "View"} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && completedCourses.length === 0 && remainingCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={48} className="text-text-muted mb-3" />
          <p className="text-text-primary text-sm font-medium">No courses in this learning path yet.</p>
          <p className="text-text-muted mt-1 text-xs">Courses will appear here once they are added.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearningPathProgressPage;
