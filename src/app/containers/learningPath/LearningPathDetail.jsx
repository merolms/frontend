import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  Eye,
  Layers,
  Play,
  Share2,
  Star,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/app/context/ToastContext";
import { deleteLearningPath, fetchLearningPathById } from "@/app/services/learningPathService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/ui/dashboard-layout";

const difficultyColors = {
  Beginner: "green",
  Intermediate: "blue",
  Advanced: "orange",
  "Beginner to Advanced": "purple",
};

const LearningPathDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();

  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLearningPathById(id);
      if (!data) {
        setError("Learning path not found.");
        return;
      }
      setPath(data);
    } catch (err) {
      setError("Failed to load learning path.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    try {
      await deleteLearningPath(id);
      addToast("Learning path deleted", "success");
      navigate("/learning-paths");
    } catch (err) {
      setError("Failed to delete learning path.");
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard", "success");
  };

  const handleSocialShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(path?.title || "Learning Path");
    const text = encodeURIComponent(`Check out this learning path: ${path?.title}`);
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <DashboardLayout title="Learning Path" subtitle="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="bg-bg-surface-active h-8 w-1/3 rounded" />
          <div className="bg-bg-surface-active h-4 w-2/3 rounded" />
          <div className="bg-bg-surface-active h-64 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !path) {
    return (
      <DashboardLayout title="Learning Path" subtitle="Not found">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-text-secondary">{error || "Learning path not found."}</p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/learning-paths")}>
            <ArrowLeft size={14} /> Back to Learning Paths
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const activeCourse = path.courses?.[activeStep];

  return (
    <DashboardLayout title={path.title} subtitle={path.description}>
      {/* Breadcrumb */}
      <div className="text-text-muted mb-4 flex items-center gap-2 text-xs">
        <button
          onClick={() => navigate("/learning-paths")}
          className="text-primary hover:underline"
        >
          Learning Paths
        </button>
        <ChevronRight size={12} />
        <span className="text-text-primary">{path.title}</span>
      </div>

      {/* Header Card */}
      <div
        className="border-border mb-6 overflow-hidden rounded-xl border"
        style={{ borderLeft: `4px solid ${path.color}` }}
      >
        <div
          className="p-6"
          style={{
            background: `linear-gradient(135deg, ${path.color}11 0%, ${path.color}22 100%)`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <Badge>{path.category}</Badge>
                <Badge variant={difficultyColors[path.difficulty] || "gray"}>
                  {path.difficulty}
                </Badge>
                {path.rating > 0 && (
                  <span className="text-text-muted flex items-center gap-1 text-xs">
                    <Star size={12} className="text-warning" /> {path.rating}
                  </span>
                )}
              </div>
              <div className="text-text-muted flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Layers size={14} /> {path.courses?.length || 0} courses
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {path.estimatedDuration}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} /> {path.enrolledCount} enrolled
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShare(!showShare)}
              >
                <Share2 size={14} /> Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 size={14} /> Statistics
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/learning-paths/${id}/edit`)}
              >
                <Edit size={14} /> Edit
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-bg-surface-hover border-border border-t px-6 py-3">
          <div className="text-text-muted mb-2 flex items-center justify-between text-xs">
            <span>Learning Journey Progress</span>
            <span>{path.courses?.length || 0} steps</span>
          </div>
          <div className="flex items-center gap-1">
            {path.courses.map((course, idx) => (
              <div key={course.id} className="flex flex-1 items-center gap-1">
                <div
                  className={`h-2 flex-1 rounded-full transition-colors ${idx <= activeStep ? "" : "bg-bg-surface-active"}`}
                  style={idx <= activeStep ? { background: path.color } : {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="border-border bg-bg-surface mb-6 rounded-xl border p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-text-primary text-sm font-semibold">Share Learning Path</h3>
            <button
              onClick={() => setShowShare(false)}
              className="text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-text-secondary mb-2 block text-xs font-semibold">Share Link</label>
              <div className="flex gap-2">
                <Input
                  value={window.location.href}
                  readOnly
                  className="flex-1"
                />
                <Button size="sm" onClick={handleCopyLink}>
                  <Copy size={14} className="mr-1" /> Copy
                </Button>
              </div>
            </div>
            <div>
              <label className="text-text-secondary mb-2 block text-xs font-semibold">Share on Social Media</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialShare("twitter")}
                  className="flex-1"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialShare("linkedin")}
                  className="flex-1"
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialShare("facebook")}
                  className="flex-1"
                >
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="border-border bg-bg-surface mb-6 rounded-xl border p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-text-primary text-sm font-semibold">Learning Path Statistics</h3>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-bg-surface-hover rounded-lg p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
                <Users size={10} /> Total Enrolled
              </div>
              <p className="text-text-primary text-2xl font-bold">{path.enrolledCount || 0}</p>
              <p className="text-success text-[10px]">+12% this month</p>
            </div>
            <div className="bg-bg-surface-hover rounded-lg p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
                <Check size={10} className="text-success" /> Completion Rate
              </div>
              <p className="text-text-primary text-2xl font-bold">{Math.round((path.enrolledCount * 0.65) / path.enrolledCount * 100) || 0}%</p>
              <p className="text-success text-[10px]">+5% improvement</p>
            </div>
            <div className="bg-bg-surface-hover rounded-lg p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
                <Clock size={10} className="text-warning" /> Avg. Completion Time
              </div>
              <p className="text-text-primary text-2xl font-bold">4.2h</p>
              <p className="text-text-muted text-[10px]">per course</p>
            </div>
            <div className="bg-bg-surface-hover rounded-lg p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1 text-[10px]">
                <Star size={10} className="text-warning" /> Average Rating
              </div>
              <p className="text-text-primary text-2xl font-bold">{path.rating || 0}</p>
              <p className="text-text-muted text-[10px]">from {path.enrolledCount || 0} reviews</p>
            </div>
          </div>
          
          {/* Popular Courses */}
          <div className="mt-4">
            <h4 className="text-text-secondary mb-3 text-xs font-semibold">Most Popular Courses</h4>
            <div className="space-y-2">
              {path.courses?.slice(0, 3).map((course, idx) => (
                <div key={course.id} className="bg-bg-surface-hover flex items-center gap-3 rounded-lg p-3">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary line-clamp-1 text-xs font-semibold">{course.title}</p>
                    <p className="text-text-muted text-[10px]">{Math.floor(Math.random() * 500) + 100} enrolled</p>
                  </div>
                  <div className="text-success text-[10px] font-medium">{Math.floor(Math.random() * 30) + 70}% complete</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        {/* Step sidebar */}
        <div className="col-span-2">
          <div className="border-border bg-bg-surface overflow-hidden rounded-xl border shadow-sm">
            <div className="border-border bg-bg-surface-hover border-b px-4 py-3">
              <h3 className="text-text-primary text-sm font-semibold">Course Steps</h3>
            </div>
            <div className="max-h-[500px] space-y-1 overflow-y-auto p-2">
              {path.courses.map((course, idx) => {
                const isActive = idx === activeStep;
                const isPast = idx < activeStep;
                return (
                  <button
                    key={course.id}
                    onClick={() => setActiveStep(idx)}
                    className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                      isActive
                        ? "bg-primary/10 border-primary/30 border"
                        : "hover:bg-bg-surface-hover border border-transparent"
                    }`}
                  >
                    {/* Step indicator */}
                    <div className="mt-0.5 flex-shrink-0">
                      {isPast ? (
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ background: path.color }}
                        >
                          <Check size={14} className="text-secondary" />
                        </div>
                      ) : (
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2"
                          style={{
                            borderColor: isActive ? path.color : "var(--border-primary)",
                            background: isActive ? `${path.color}20` : "transparent",
                          }}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{ color: isActive ? path.color : "var(--text-muted)" }}
                          >
                            {idx + 1}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Course info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`line-clamp-1 text-xs font-semibold ${isActive ? "text-primary" : "text-text-primary"}`}
                      >
                        {course.title}
                      </p>
                      <p className="text-text-muted mt-0.5 line-clamp-1 text-[11px]">
                        {course.description}
                      </p>
                      <div className="text-text-muted mt-1 flex items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-0.5">
                          <BookOpen size={9} /> {course.lessons} lessons
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} /> {course.duration}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active course detail */}
        <div className="col-span-3">
          {activeCourse && (
            <div className="border-border bg-bg-surface overflow-hidden rounded-xl border shadow-sm">
              {/* Course cover */}
              <img
                src={activeCourse.coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                alt={activeCourse.title}
                className="h-48 w-full object-cover"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"; }}
              />

              <div className="p-5">
                {/* Step badge */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-secondary"
                    style={{ background: path.color }}
                  >
                    {activeStep + 1}
                  </div>
                  <span className="text-text-muted text-xs">
                    Step {activeStep + 1} of {path.courses?.length}
                  </span>
                </div>

                <h2 className="text-text-primary mb-2 text-lg font-bold">{activeCourse.title}</h2>
                <p className="text-text-muted mb-4 text-sm">{activeCourse.description}</p>

                {/* Stats */}
                <div className="mb-5 flex items-center gap-4">
                  <div className="text-text-muted flex items-center gap-1.5 text-xs">
                    <BookOpen size={13} /> {activeCourse.lessons} lessons
                  </div>
                  <div className="text-text-muted flex items-center gap-1.5 text-xs">
                    <Clock size={13} /> {activeCourse.duration}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button size="sm" style={{ background: path.color }}>
                    <Play size={14} /> Start Course
                  </Button>
                  <Button variant="default" size="sm">
                    <Eye size={14} /> Preview
                  </Button>
                </div>

                {/* Navigation */}
                <div className="border-border mt-5 flex items-center justify-between border-t pt-4">
                  <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="text-text-muted hover:text-text-secondary flex cursor-pointer items-center gap-1 text-xs disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowLeft size={12} /> Previous
                  </button>
                  <button
                    onClick={() => setActiveStep(Math.min(path.courses?.length - 1, activeStep + 1))}
                    disabled={activeStep === path.courses?.length - 1}
                    className="flex cursor-pointer items-center gap-1 text-xs font-medium hover:underline disabled:pointer-events-none disabled:opacity-30"
                    style={{ color: path.color }}
                  >
                    Next Step <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-border bg-bg-surface mx-4 w-full max-w-sm rounded-xl border p-6 shadow-lg">
            <h3 className="text-text-primary mb-2 text-base font-semibold">Delete Learning Path</h3>
            <p className="text-text-muted mb-4 text-sm">
              Are you sure you want to delete "{path.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                className="bg-error hover:bg-error/90 text-secondary"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearningPathDetail;
