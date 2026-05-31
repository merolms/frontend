import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Plus, Search, Clock, Users, Star, ChevronRight, Layers, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Paper } from '@/components/ui/card';
import { fetchLearningPaths, getLearningPathCategories } from '@/app/services/learningPathService';

const difficultyColors = {
  'Beginner': 'green',
  'Intermediate': 'blue',
  'Advanced': 'orange',
  'Beginner to Advanced': 'purple',
};

const LearningPathCard = ({ path, navigate }) => {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${path.color}22 0%, ${path.color}44 100%)`,
    borderLeft: `4px solid ${path.color}`,
  };

  return (
    <div
      className="rounded-xl border border-border bg-bg-surface shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/learning-paths/${path.id}`)}
    >
      {/* Header with gradient */}
      <div className="relative p-5 pb-3" style={gradientStyle}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg" style={{ background: `${path.color}30` }}>
                <Layers size={16} style={{ color: path.color }} />
              </div>
              <Badge variant="default" className="text-[10px]">{path.category}</Badge>
              <Badge variant={difficultyColors[path.difficulty] || 'gray'} className="text-[10px]">{path.difficulty}</Badge>
            </div>
            <h3 className="text-base font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">{path.title}</h3>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2 line-clamp-2">{path.description}</p>
      </div>

      {/* Course preview strip */}
      <div className="px-5 py-3 border-t border-border bg-bg-surface-hover/50">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[11px] font-semibold text-text-secondary">{path.totalCourses} Courses</span>
          <span className="text-[11px] text-text-muted">·</span>
          <span className="text-[11px] text-text-muted">{path.estimatedDuration}</span>
        </div>
        {/* Course strip */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {path.courses.slice(0, 4).map((course, idx) => (
            <div key={course.id} className="flex items-center gap-1.5 flex-shrink-0">
              <div className="flex items-center justify-center h-7 w-7 rounded-md bg-bg-surface border border-border shadow-sm">
                <span className="text-[10px] font-bold text-text-secondary">{idx + 1}</span>
              </div>
              {idx < Math.min(path.courses.length, 4) - 1 && (
                <ChevronRight size={10} className="text-text-muted flex-shrink-0" />
              )}
            </div>
          ))}
          {path.courses.length > 4 && (
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-bg-surface-active border border-border">
              <span className="text-[10px] font-bold text-text-muted">+{path.courses.length - 4}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><Users size={11} /> {path.enrolledCount}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {path.estimatedDuration}</span>
          {path.rating > 0 && (
            <span className="flex items-center gap-1"><Star size={11} className="text-warning" /> {path.rating}</span>
          )}
        </div>
        <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
};

const LearningPathList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const [searchInput, setSearchInput] = useState(search);

  const categories = getLearningPathCategories();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLearningPaths({ search, category, page, limit: 6 });
      setPaths(data.paths);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load learning paths.');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value && value !== 0) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page && !newParams.has('page')) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => { e.preventDefault(); updateParams({ search: searchInput, page: 1 }); };
  const handleClear = () => { setSearchInput(''); setSearchParams(new URLSearchParams()); };

  return (
    <DashboardLayout
      title="Learning Paths"
      subtitle={`${total} learning path${total !== 1 ? 's' : ''} to guide your journey`}
    >
      {/* Action bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm text-text-muted">Curated learning journeys</span>
        </div>
        <Button size="sm" onClick={() => navigate('/learning-paths/create')}>
          <Plus size={14} /> Create Learning Path
        </Button>
      </div>

      {/* Filters */}
      <Paper className="p-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <form className="flex items-center gap-2 flex-1" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input placeholder="Search learning paths..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-8" />
            </div>
          </form>
          <Select value={category || 'all'} onValueChange={(v) => updateParams({ category: v === 'all' ? '' : v, page: 1 })}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c === 'All Categories' ? 'all' : c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          {(search || category) && <Button variant="default" size="sm" onClick={handleClear}>Clear</Button>}
        </div>
      </Paper>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-surface p-5 h-56 animate-pulse">
              <div className="h-4 bg-bg-surface-active rounded w-3/4 mb-3" />
              <div className="h-3 bg-bg-surface-active rounded w-full mb-2" />
              <div className="h-3 bg-bg-surface-active rounded w-2/3 mb-4" />
              <div className="h-8 bg-bg-surface-active rounded w-full mt-auto" />
            </div>
          ))}
        </div>
      ) : paths.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers size={48} className="text-text-muted mb-3" />
          <p className="text-text-secondary text-sm">No learning paths found.</p>
          <p className="text-xs text-text-muted mt-1">Try adjusting your filters or create a new learning path.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate('/learning-paths/create')}>
            <Plus size={14} /> Create Learning Path
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paths.map((path) => (
              <LearningPathCard key={path.id} path={path} navigate={navigate} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination total={totalPages} value={page} onChange={(p) => updateParams({ page: p })} />
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default LearningPathList;
