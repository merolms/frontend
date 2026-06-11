import { ArrowLeft, BookOpen, CheckCircle, Clock, Flame, Play, Target, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchLearningPathById,
  fetchLearningPathProgress,
} from "@/app/services/learningPathService";
import EmptyState from "@/components/common/EmptyState";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import DashboardLayout from "@/components/ui/dashboard-layout";

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
  
  // Calculate additional metrics
  const totalDuration = path?.courses?.reduce((acc, c) => {
    const duration = parseInt(c.duration) || 0;
    return acc + duration;
  }, 0) || 0;
  const completedDuration = completedCourses.reduce((acc, c) => {
    const duration = parseInt(c.duration) || 0;
    return acc + duration;
  }, 0);
  const remainingDuration = totalDuration - completedDuration;
  const streak = completedCourses.length >= 3 ? Math.floor(completedCourses.length / 3) : 0;

  if (loading) {
    return (
      <DashboardLayout title="Loading…" subtitle="Fetching your progress">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border-border bg-bg-surface h-24 animate-pulse rounded-xl border"
            />
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
      <button
        onClick={() => navigate("/my-learning")}
        className="text-text-muted hover:text-text-primary mb-4 flex items-center gap-1 text-sm"
      >
        <ArrowLeft size={14} /> Back to My Learning
      </button>

      {/* Progress overview */}
      <div className="border-border bg-bg-surface mb-6 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-semibold">Overall Progress</h3>
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg font-bold">{progress}%</span>
            {isCompleted && (
              <div className="bg-success/10 text-success flex h-8 w-8 items-center justify-center rounded-full">
                <Trophy size={16} />
              </div>
            )}
          </div>
        </div>
        <ProgressBar progress={progress} size="lg" color={isCompleted ? "#22C55E" : "#6366F1"} />
        
        {/* Milestone markers */}
        <div className="mt-4 flex items-center justify-between text-[10px]">
          <div className="flex flex-col items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${progress >= 25 ? "bg-primary" : "bg-bg-surface-active"}`} />
            <span className="text-text-muted">25%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${progress >= 50 ? "bg-primary" : "bg-bg-surface-active"}`} />
            <span className="text-text-muted">50%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${progress >= 75 ? "bg-primary" : "bg-bg-surface-active"}`} />
            <span className="text-text-muted">75%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${progress >= 100 ? "bg-success" : "bg-bg-surface-active"}`} />
            <span className="text-text-muted">100%</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-bg-surface-hover rounded-lg p-3">
            <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
              <CheckCircle size={10} className="text-success" /> Completed
            </div>
            <p className="text-text-primary text-base font-bold">{completedCourses.length}</p>
            <p className="text-text-muted text-[10px]">courses</p>
          </div>
          <div className="bg-bg-surface-hover rounded-lg p-3">
            <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
              <BookOpen size={10} className="text-primary" /> Remaining
            </div>
            <p className="text-text-primary text-base font-bold">{remainingCourses.length}</p>
            <p className="text-text-muted text-[10px]">courses</p>
          </div>
          <div className="bg-bg-surface-hover rounded-lg p-3">
            <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
              <Clock size={10} className="text-warning" /> Time Left
            </div>
            <p className="text-text-primary text-base font-bold">{remainingDuration}h</p>
            <p className="text-text-muted text-[10px]">estimated</p>
          </div>
          <div className="bg-bg-surface-hover rounded-lg p-3">
            <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
              <Flame size={10} className="text-error" /> Streak
            </div>
            <p className="text-text-primary text-base font-bold">{streak}</p>
            <p className="text-text-muted text-[10px]">milestones</p>
          </div>
        </div>

        {/* Achievement badges */}
        {streak > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-text-muted text-[10px]">Achievements:</span>
            {streak >= 1 && (
              <div className="bg-warning/10 text-warning flex h-6 w-6 items-center justify-center rounded-full" title="First Milestone">
                <Target size={12} />
              </div>
            )}
            {streak >= 2 && (
              <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full" title="Halfway There">
                <Target size={12} />
              </div>
            )}
            {streak >= 3 && (
              <div className="bg-success/10 text-success flex h-6 w-6 items-center justify-center rounded-full" title="Almost There">
                <Target size={12} />
              </div>
            )}
          </div>
        )}
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
                <div className="bg-success/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
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
                <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
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
                  className="bg-primary hover:bg-primary-hover rounded-md px-3 py-1 text-xs text-secondary"
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
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No courses in this learning path yet"
          description="Courses will appear here once they are added."
        />
      )}
    </DashboardLayout>
  );
};

export default LearningPathProgressPage;
