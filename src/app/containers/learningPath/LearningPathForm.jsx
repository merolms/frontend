import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Sparkles, BookOpen, Clock } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Paper } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createLearningPath, updateLearningPath, fetchLearningPathById } from '@/app/services/learningPathService';
import { fetchCourses } from '@/app/services/courseService';
import { getLearningPathCategories } from '@/app/services/learningPathService';

const colorOptions = [
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#EF4444', label: 'Red' },
  { value: '#3B82F6', label: 'Blue' },
];

const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced', 'Beginner to Advanced'];

const LearningPathForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    estimatedDuration: '',
    color: '#6366F1',
    courses: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCoursePicker, setShowCoursePicker] = useState(false);

  const categories = getLearningPathCategories().filter((c) => c !== 'All Categories');

  useEffect(() => {
    loadCourses();
    if (isEdit) loadPath();
  }, [id]);

  const loadCourses = async () => {
    try {
      const data = await fetchCourses({ limit: 100 });
      setAvailableCourses(data.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPath = async () => {
    try {
      setLoading(true);
      const data = await fetchLearningPathById(id);
      if (data) {
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty || 'Beginner',
          estimatedDuration: data.estimatedDuration || '',
          color: data.color || '#6366F1',
          courses: data.courses || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const addCourse = (course) => {
    if (form.courses.find((c) => c.id === course.id)) return;
    setForm((p) => ({
      ...p,
      courses: [...p.courses, { ...course, order: p.courses.length + 1 }],
    }));
    setShowCoursePicker(false);
    setCourseSearch('');
  };

  const removeCourse = (courseId) => {
    setForm((p) => ({
      ...p,
      courses: p.courses.filter((c) => c.id !== courseId).map((c, i) => ({ ...c, order: i + 1 })),
    }));
  };

  const moveCourse = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.courses.length) return;
    const updated = [...form.courses];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setForm((p) => ({ ...p, courses: updated.map((c, i) => ({ ...c, order: i + 1 })) }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    if (form.courses.length === 0) e.courses = 'Add at least one course';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateLearningPath(id, form);
      } else {
        await createLearningPath(form);
      }
      navigate('/learning-paths');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = courseSearch.trim()
    ? availableCourses.filter((c) => {
        const q = courseSearch.toLowerCase();
        return c.title.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
      })
    : availableCourses;

  const selectedIds = new Set(form.courses.map((c) => c.id));

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-surface-active rounded w-1/3" />
          <div className="h-64 bg-bg-surface-active rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isEdit ? 'Edit Learning Path' : 'Create Learning Path'}
      subtitle={isEdit ? 'Update your learning path details' : 'Arrange existing courses into a step-by-step learning journey'}
    >
      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Basic Info */}
        <Paper className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: form.color }} />
            <h3 className="text-sm font-semibold text-text-primary">Basic Information</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-text-primary">Title *</label>
              <Input name="title" placeholder="e.g., Full-Stack Web Development" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className={errors.title ? 'border-error' : ''} />
              {errors.title && <p className="text-[11px] text-error mt-0.5">{errors.title}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary">Description *</label>
              <textarea name="description" placeholder="Describe what learners will achieve in this path..." className={`w-full min-h-[80px] px-3 py-2 rounded-md border border-border bg-bg-surface text-sm text-text-primary outline-none resize-y mt-1 ${errors.description ? 'border-error' : ''}`} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
              {errors.description && <p className="text-[11px] text-error mt-0.5">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-text-primary">Category *</label>
                <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                {errors.category && <p className="text-[11px] text-error mt-0.5">{errors.category}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary">Difficulty</label>
                <Select value={form.difficulty} onValueChange={(v) => handleChange('difficulty', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{difficultyOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary">Est. Duration</label>
                <Input placeholder="e.g., 6 months" value={form.estimatedDuration} onChange={(e) => handleChange('estimatedDuration', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary">Theme Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <Select value={form.color} onValueChange={(v) => handleChange('color', v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{colorOptions.map((c) => <SelectItem key={c.value} value={c.value}><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: c.value }} />{c.label}</span></SelectItem>)}</SelectContent>
                  </Select>
                  <div className="h-8 w-8 rounded-lg flex-shrink-0 border border-border" style={{ background: form.color }} />
                </div>
              </div>
            </div>
          </div>
        </Paper>

        {/* Course Sequence */}
        <Paper className="p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: form.color }} />
              <h3 className="text-sm font-semibold text-text-primary">Course Steps ({form.courses.length})</h3>
            </div>
            <Button type="button" variant="default" size="sm" onClick={() => setShowCoursePicker(!showCoursePicker)}>
              <Plus size={14} /> Add Course
            </Button>
          </div>
          {errors.courses && <p className="text-[11px] text-error mb-2">{errors.courses}</p>}

          {/* Course picker dropdown */}
          {showCoursePicker && (
            <div className="mb-4 rounded-lg border border-border bg-bg-surface-hover p-3">
              <div className="relative mb-2">
                <Input placeholder="Search courses..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="pl-3" />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredCourses.filter((c) => !selectedIds.has(c.id)).slice(0, 10).map((course) => (
                  <button key={course.id} type="button" onClick={() => addCourse(course)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-bg-surface-active text-left">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-bg-surface border border-border flex-shrink-0">
                      <BookOpen size={14} className="text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary line-clamp-1">{course.title}</p>
                      <p className="text-[10px] text-text-muted">{course.totalLessons} lessons · {course.duration}</p>
                    </div>
                    <Plus size={14} className="text-text-muted flex-shrink-0" />
                  </button>
                ))}
                {filteredCourses.filter((c) => !selectedIds.has(c.id)).length === 0 && (
                  <p className="text-xs text-text-muted text-center py-4">No courses available</p>
                )}
              </div>
            </div>
          )}

          {/* Selected courses list */}
          {form.courses.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              No courses added yet. Click "Add Course" to start building your learning path.
            </div>
          ) : (
            <div className="space-y-2">
              {form.courses.map((course, idx) => (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-surface-hover/50" style={{ borderLeft: `3px solid ${form.color}` }}>
                  {/* Step number */}
                  <div className="flex items-center justify-center h-8 w-8 rounded-full text-white text-xs font-bold flex-shrink-0" style={{ background: form.color }}>
                    {idx + 1}
                  </div>

                  {/* Course info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary line-clamp-1">{course.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                      <span className="flex items-center gap-0.5"><BookOpen size={9} /> {course.lessons || course.totalLessons || 0}</span>
                      <span className="flex items-center gap-0.5"><Clock size={9} /> {course.duration || '—'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => moveCourse(idx, 'up')} disabled={idx === 0} className="h-7 w-7 flex items-center justify-center rounded hover:bg-bg-surface disabled:opacity-30 cursor-pointer">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveCourse(idx, 'down')} disabled={idx === form.courses.length - 1} className="h-7 w-7 flex items-center justify-center rounded hover:bg-bg-surface disabled:opacity-30 cursor-pointer">
                      <ChevronDown size={14} />
                    </button>
                    <button type="button" onClick={() => removeCourse(course.id)} className="h-7 w-7 flex items-center justify-center rounded text-error hover:bg-error/10 cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Path preview */}
          {form.courses.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-bg-surface-active/50">
              <p className="text-[11px] font-semibold text-text-secondary mb-2">Path Preview</p>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {form.courses.map((course, idx) => (
                  <React.Fragment key={course.id}>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-surface border border-border flex-shrink-0">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: form.color }}>{idx + 1}</div>
                      <span className="text-[10px] font-medium text-text-primary whitespace-nowrap">{course.title}</span>
                    </div>
                    {idx < form.courses.length - 1 && <div className="h-0.5 w-4 flex-shrink-0" style={{ background: form.color }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </Paper>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="default" onClick={() => navigate('/learning-paths')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Learning Path' : 'Create Learning Path'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default LearningPathForm;
