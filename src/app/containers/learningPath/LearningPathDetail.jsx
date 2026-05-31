import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Users, Star, Check, Circle, Play, ChevronRight, Layers, Trash2, Edit, Eye } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchLearningPathById, deleteLearningPath } from '@/app/services/learningPathService';
import { useToast } from '@/app/context/ToastContext';

const difficultyColors = {
  'Beginner': 'green',
  'Intermediate': 'blue',
  'Advanced': 'orange',
  'Beginner to Advanced': 'purple',
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLearningPathById(id);
      if (!data) { setError('Learning path not found.'); return; }
      setPath(data);
    } catch (err) {
      setError('Failed to load learning path.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    try {
      await deleteLearningPath(id);
      addToast('Learning path deleted', 'success');
      navigate('/learning-paths');
    } catch (err) {
      setError('Failed to delete learning path.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Learning Path" subtitle="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-surface-active rounded w-1/3" />
          <div className="h-4 bg-bg-surface-active rounded w-2/3" />
          <div className="h-64 bg-bg-surface-active rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !path) {
    return (
      <DashboardLayout title="Learning Path" subtitle="Not found">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-text-secondary">{error || 'Learning path not found.'}</p>
          <Button size="sm" className="mt-4" onClick={() => navigate('/learning-paths')}>
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
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/learning-paths')} className="text-primary hover:underline">Learning Paths</button>
        <ChevronRight size={12} />
        <span className="text-text-primary">{path.title}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border overflow-hidden mb-6" style={{ borderLeft: `4px solid ${path.color}` }}>
        <div className="p-6" style={{ background: `linear-gradient(135deg, ${path.color}11 0%, ${path.color}22 100%)` }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge>{path.category}</Badge>
                <Badge variant={difficultyColors[path.difficulty] || 'gray'}>{path.difficulty}</Badge>
                {path.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs text-text-muted"><Star size={12} className="text-warning" /> {path.rating}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1"><Layers size={14} /> {path.totalCourses} courses</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {path.estimatedDuration}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {path.enrolledCount} enrolled</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => navigate(`/learning-paths/${id}/edit`)}>
                <Edit size={14} /> Edit
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 bg-bg-surface-hover/50 border-t border-border">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>Learning Journey Progress</span>
            <span>{path.totalCourses} steps</span>
          </div>
          <div className="flex items-center gap-1">
            {path.courses.map((course, idx) => (
              <div key={course.id} className="flex-1 flex items-center gap-1">
                <div
                  className={`h-2 flex-1 rounded-full transition-colors ${idx <= activeStep ? '' : 'bg-bg-surface-active'}`}
                  style={idx <= activeStep ? { background: path.color } : {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Step sidebar */}
        <div className="col-span-2">
          <div className="rounded-xl border border-border bg-bg-surface shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-bg-surface-hover/50">
              <h3 className="text-sm font-semibold text-text-primary">Course Steps</h3>
            </div>
            <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
              {path.courses.map((course, idx) => {
                const isActive = idx === activeStep;
                const isPast = idx < activeStep;
                return (
                  <button
                    key={course.id}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-bg-surface-hover border border-transparent'
                    }`}
                  >
                    {/* Step indicator */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isPast ? (
                        <div className="flex items-center justify-center h-7 w-7 rounded-full" style={{ background: path.color }}>
                          <Check size={14} className="text-white" />
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-center h-7 w-7 rounded-full border-2"
                          style={{
                            borderColor: isActive ? path.color : 'var(--border-primary)',
                            background: isActive ? `${path.color}20` : 'transparent',
                          }}
                        >
                          <span className="text-xs font-bold" style={{ color: isActive ? path.color : 'var(--text-muted)' }}>{idx + 1}</span>
                        </div>
                      )}
                    </div>
                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold line-clamp-1 ${isActive ? 'text-primary' : 'text-text-primary'}`}>{course.title}</p>
                      <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">{course.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
                        <span className="flex items-center gap-0.5"><BookOpen size={9} /> {course.lessons} lessons</span>
                        <span className="flex items-center gap-0.5"><Clock size={9} /> {course.duration}</span>
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
            <div className="rounded-xl border border-border bg-bg-surface shadow-sm overflow-hidden">
              {/* Course cover */}
              {activeCourse.coverImage ? (
                <img src={activeCourse.coverImage} alt={activeCourse.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-bg-surface-active">
                  <BookOpen size={48} className="text-text-muted" />
                </div>
              )}

              <div className="p-5">
                {/* Step badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full text-white text-[10px] font-bold" style={{ background: path.color }}>
                    {activeStep + 1}
                  </div>
                  <span className="text-xs text-text-muted">Step {activeStep + 1} of {path.totalCourses}</span>
                </div>

                <h2 className="text-lg font-bold text-text-primary mb-2">{activeCourse.title}</h2>
                <p className="text-sm text-text-muted mb-4">{activeCourse.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <BookOpen size={13} /> {activeCourse.lessons} lessons
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
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
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Previous
                  </button>
                  <button
                    onClick={() => setActiveStep(Math.min(path.totalCourses - 1, activeStep + 1))}
                    disabled={activeStep === path.totalCourses - 1}
                    className="flex items-center gap-1 text-xs font-medium hover:underline disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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
          <div className="rounded-xl border border-border bg-bg-surface p-6 shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-text-primary mb-2">Delete Learning Path</h3>
            <p className="text-sm text-text-muted mb-4">Are you sure you want to delete "{path.title}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button size="sm" onClick={handleDelete} className="bg-error text-white hover:bg-error/90">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearningPathDetail;
