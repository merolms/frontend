import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Users, BookOpen, TrendingUp, Award, Filter, ChevronRight, BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { fetchEnrollments } from '@/app/services/enrollmentService';

const AdminProgressTracking = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const courseFilter = searchParams.get('course') || '';
  const statusFilter = searchParams.get('status') || '';
  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEnrollments({ sort: 'recent' });
      let filtered = data || [];

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((e) =>
          (e.userName || '').toLowerCase().includes(q) ||
          (e.courseTitle || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q)
        );
      }
      if (courseFilter) filtered = filtered.filter((e) => e.courseId === parseInt(courseFilter));
      if (statusFilter) filtered = filtered.filter((e) => e.status === statusFilter);

      const totalCount = filtered.length;
      const pages = Math.ceil(totalCount / 10) || 1;
      const start = (page - 1) * 10;
      setEnrollments(filtered.slice(start, start + 10));
      setTotalPages(pages);
      setTotal(totalCount);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, courseFilter, statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => { if (!v) p.delete(k); else p.set(k, v); });
    if (!updates.page) p.delete('page');
    setSearchParams(p);
  };

  // Aggregate stats
  const allEnrollments = enrollments;
  const totalLearners = new Set(allEnrollments.map(e => e.userId)).size;
  const completedCount = allEnrollments.filter(e => e.status === 'completed').length;
  const activeCount = allEnrollments.filter(e => e.status === 'active').length;
  const avgProgress = allEnrollments.length > 0 ? Math.round(allEnrollments.reduce((s, e) => s + (e.progress || 0), 0) / allEnrollments.length) : 0;

  // Unique courses
  const courses = [...new Map(allEnrollments.map(e => [e.courseId, { id: e.courseId, title: e.courseTitle }])).values()];

  const handleSearch = (e) => { e.preventDefault(); updateParams({ search: searchInput, page: 1 }); };
  const handleClear = () => { setSearchInput(''); updateParams({ search: '', course: '', status: '', page: 1 }); };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#22C55E';
    if (progress >= 50) return '#6366F1';
    if (progress >= 25) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <DashboardLayout title="Progress Tracking" subtitle={`Monitor learner progress across all courses · ${total} enrollments`}>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10"><Users size={18} className="text-primary" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{total}</p><p className="text-[11px] text-text-muted">Total Enrollments</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-success/10"><TrendingUp size={18} className="text-success" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{activeCount}</p><p className="text-[11px] text-text-muted">Active Learners</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10"><Award size={18} className="text-accent" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{completedCount}</p><p className="text-[11px] text-text-muted">Completed</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-warning/10"><BarChart3 size={18} className="text-warning" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{avgProgress}%</p><p className="text-[11px] text-text-muted">Avg Progress</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-bg-surface p-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <form className="flex items-center gap-2 flex-1" onSubmit={handleSearch}>
            <div className="relative flex-1"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" /><Input placeholder="Search learners, courses..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-8" /></div>
          </form>
          <Select value={courseFilter} onValueChange={(v) => updateParams({ course: v || '', page: 1 })}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Courses" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Courses</SelectItem>{courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => updateParams({ status: v || '', page: 1 })}>
            <SelectTrigger className="w-32"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="dropped">Dropped</SelectItem></SelectContent>
          </Select>
          {(search || courseFilter || statusFilter) && <Button variant="default" size="sm" onClick={handleClear}>Clear</Button>}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-surface-hover/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Learner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Lessons</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Last Active</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-10 bg-bg-surface-active rounded animate-pulse" /></td></tr>
                ))
              ) : enrollments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No enrollments found</td></tr>
              ) : (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-bold text-white" style={{ background: '#6366F1' }}>
                          {(enrollment.userName || 'U')[0]}
                        </div>
                        <span className="text-xs font-medium text-text-primary">{enrollment.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary line-clamp-1">{enrollment.courseTitle}</p>
                        <p className="text-[10px] text-text-muted">{enrollment.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={enrollment.status === 'completed' ? 'green' : enrollment.status === 'dropped' ? 'red' : 'blue'} className="text-[10px]">{enrollment.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 rounded-full bg-bg-surface-active overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${enrollment.progress || 0}%`, background: getProgressColor(enrollment.progress || 0) }} />
                        </div>
                        <span className="text-[11px] font-semibold w-8 text-right" style={{ color: getProgressColor(enrollment.progress || 0) }}>{enrollment.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{enrollment.completedLessons?.length || 0}/{enrollment.totalLessons || 0}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{enrollment.lastAccessed}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => navigate(`/courses/${enrollment.courseId}`)} className="text-[11px] text-primary hover:underline cursor-pointer">View →</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center py-3 border-t border-border bg-bg-surface-hover/30">
            <Pagination total={totalPages} value={page} onChange={(p) => updateParams({ page: p })} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProgressTracking;
