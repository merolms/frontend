import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, Play, TrendingUp, Calendar, CheckCircle, BarChart3, Filter } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEnrollments } from '@/app/services/enrollmentService';
import { useSelector } from 'react-redux';

const statusConfig = {
  active: { label: 'In Progress', color: 'blue', icon: Play },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle },
  dropped: { label: 'Dropped', color: 'red', icon: BookOpen },
};

const ProgressBar = ({ progress, color = '#6366F1', size = 'md' }) => {
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  return (
    <div className={`w-full ${h} rounded-full bg-bg-surface-active overflow-hidden`}>
      <div className={`${h} rounded-full transition-all duration-500`} style={{ width: `${progress}%`, background: color }} />
    </div>
  );
};

const MyLearning = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => { loadEnrollments(); }, [user, sortBy]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await fetchEnrollments({ userId: user?.id, sort: sortBy });
      setEnrollments(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = statusFilter === 'all' ? enrollments : enrollments.filter((e) => e.status === statusFilter);

  // Stats
  const totalCourses = enrollments.length;
  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const inProgress = enrollments.filter((e) => e.status === 'active').length;
  const avgProgress = totalCourses > 0 ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses) : 0;

  return (
    <DashboardLayout title="My Learning" subtitle="Track your learning progress and achievements">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{totalCourses}</p>
              <p className="text-[11px] text-text-muted">Total Enrolled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-success/10">
              <TrendingUp size={18} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{inProgress}</p>
              <p className="text-[11px] text-text-muted">In Progress</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
              <Award size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{completed}</p>
              <p className="text-[11px] text-text-muted">Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-warning/10">
              <BarChart3 size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{avgProgress}%</p>
              <p className="text-[11px] text-text-muted">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-primary">Overall Learning Progress</h3>
          <span className="text-sm font-bold text-primary">{avgProgress}%</span>
        </div>
        <ProgressBar progress={avgProgress} size="lg" />
        <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> {completed} completed</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> {inProgress} in progress</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-error" /> {enrollments.filter(e => e.status === 'dropped').length} dropped</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">My Courses</h3>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); }}>
            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
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
          {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl border border-border bg-bg-surface h-32 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={48} className="text-text-muted mb-3" />
          <p className="text-sm font-medium text-text-primary">No courses found</p>
          <p className="text-xs text-text-muted mt-1">Browse courses to start learning.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((enrollment) => {
            const cfg = statusConfig[enrollment.status] || statusConfig.active;
            const StatusIcon = cfg.icon;
            return (
              <div key={enrollment.id} className="rounded-xl border border-border bg-bg-surface shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Course image */}
                  {enrollment.coverImage ? (
                    <img src={enrollment.coverImage} alt={enrollment.courseTitle} className="w-28 h-20 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-28 h-20 rounded-lg bg-bg-surface-active flex items-center justify-center flex-shrink-0">
                      <BookOpen size={24} className="text-text-muted" />
                    </div>
                  )}

                  {/* Course info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-text-primary line-clamp-1">{enrollment.courseTitle}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
                          <span>{enrollment.category}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {enrollment.duration}</span>
                          <span className="flex items-center gap-1"><Calendar size={10} /> {enrollment.lastAccessed}</span>
                          {enrollment.instructor && <span>By {enrollment.instructor}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.color === 'green' ? 'bg-success/10 text-success' : cfg.color === 'red' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                          <StatusIcon size={10} /> {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-text-muted">
                          {enrollment.completedLessons?.length || 0} of {enrollment.totalLessons || 0} lessons
                        </span>
                        <span className="text-xs font-bold" style={{ color: enrollment.status === 'completed' ? '#22C55E' : '#6366F1' }}>
                          {enrollment.progress || 0}%
                        </span>
                      </div>
                      <ProgressBar progress={enrollment.progress || 0} color={enrollment.status === 'completed' ? '#22C55E' : '#6366F1'} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {enrollment.status === 'completed' && (
                          <button className="flex items-center gap-1 text-[11px] text-accent hover:underline cursor-pointer">
                            <Award size={11} /> View Certificate
                          </button>
                        )}
                      </div>
                      <Button size="sm" variant="default" onClick={() => navigate(`/courses/${enrollment.courseId}`)}>
                        {enrollment.status === 'completed' ? 'Review' : 'Continue'} →
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
