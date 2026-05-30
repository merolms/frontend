import React, { useState, useEffect } from 'react';
import { t } from '@/styles/theme';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle, Pencil, Plus, Network, Image, Loader, X, Lightbulb } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';

const tagOptions = [
  'javascript', 'react', 'python', 'css', 'html', 'nodejs', 'typescript',
  'machine-learning', 'data-science', 'design', 'ui', 'ux', 'devops',
  'cloud', 'aws', 'docker', 'api', 'database', 'security',
].map((tag) => ({ value: tag, label: tag }));

const categoryOptions = [
  { value: 1, label: 'Programming' },
  { value: 2, label: 'Design' },
  { value: 3, label: 'Data Science' },
  { value: 4, label: 'DevOps' },
  { value: 5, label: 'Business' },
];

const CourseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: null, tags: [], coverImage: '' });
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { fetchCourseById } = await import('@/app/services/courseService');
        const data = await fetchCourseById(id);
        setCourse(data);
        setForm({
          title: data.title || '', description: data.description || '',
          category: data.categoryID || data.category || null,
          tags: data.tags || [], coverImage: data.coverImage || data.imageURL || '',
          status: data.status || 'DRAFT',
        });
      } catch (err) { setApiError(err.message || 'Failed to load course data.'); }
      finally { setFetching(false); }
    };
    load();
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Course title is required';
    if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const { updateCourse } = await import('@/app/services/courseService');
      await updateCourse(id, form);
      navigate(`/courses/${id}`);
    } catch (err) {
      setApiError(err.message || 'Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-8 px-3 rounded-md border border-border bg-bg-surface text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-1";

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-text-muted" size={20} />
          <span className="ml-2 text-sm text-text-muted">Loading course data...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (apiError && !course) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 text-error py-4">
          <AlertCircle size={14} /> {apiError}
        </div>
        <button onClick={() => navigate('/courses')} className="text-sm text-primary hover:underline">Back to Courses</button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Course" subtitle="Update the course metadata and settings">
      <div className="flex items-center gap-1 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/courses')} className="text-primary hover:underline">Courses</button>
        <span>/</span>
        <button onClick={() => navigate(`/courses/${id}`)} className="text-primary hover:underline">{course?.title}</button>
        <span>/</span>
        <span>Edit</span>
      </div>

      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7">
          <div className="rounded-lg border border-border bg-bg-surface p-6 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-text-primary">
              <Pencil size={16} className="inline mr-1" style={{ color: t('accent') }} />
              Edit Course
            </h2>
            <p className="text-xs text-text-muted">Update the course metadata and settings.</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {apiError && <p className="text-xs text-error">{apiError}</p>}
              {Object.keys(errors).length > 0 && !apiError && <p className="text-xs text-error">Please fix the errors below.</p>}

              <div>
                <label className="text-xs font-semibold text-text-primary">Course Title *</label>
                <input name="title" value={form.title}
                  onChange={(e) => { setForm(p => ({ ...p, title: e.target.value })); if (errors.title) setErrors(p => ({ ...p, title: null })); }}
                  className={inputCls} />
                {errors.title && <p className="text-[11px] text-error mt-0.5">{errors.title}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary">Description *</label>
                <textarea name="description"
                  className={`${inputCls} min-h-[110px] py-1.5`}
                  value={form.description}
                  onChange={(e) => { setForm(p => ({ ...p, description: e.target.value })); if (errors.description) setErrors(p => ({ ...p, description: null })); }} />
                {errors.description && <p className="text-[11px] text-error mt-0.5">{errors.description}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary">Category *</label>
                <select name="category" value={form.category || ''}
                  onChange={(e) => { setForm(p => ({ ...p, category: e.target.value ? parseInt(e.target.value) : null })); if (errors.category) setErrors(p => ({ ...p, category: null })); }}
                  className={inputCls}>
                  <option value="">Select a category</option>
                  {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.category && <p className="text-[11px] text-error mt-0.5">{errors.category}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary">Tags</label>
                <select multiple name="tags" value={form.tags}
                  onChange={(e) => setForm(p => ({ ...p, tags: Array.from(e.target.selectedOptions, o => o.value) }))}
                  className={`${inputCls} min-h-[100px]`}>
                  {tagOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary">Cover Image</label>
                <div className="flex gap-2 mt-1">
                  <input name="coverImage" placeholder="https://example.com/cover.jpg" value={form.coverImage}
                    onChange={(e) => setForm(p => ({ ...p, coverImage: e.target.value }))}
                    className={`${inputCls} flex-1`} />
                  <button type="button" onClick={() => setUnsplashOpen(true)} disabled={loading}
                    className="h-8 px-3 rounded-md border border-border text-xs text-text-secondary hover:bg-bg-surface-active cursor-pointer">
                    Unsplash
                  </button>
                </div>
                {form.coverImage && (
                  <div className="relative mt-2 inline-block">
                    <img src={form.coverImage} alt="Cover" className="max-h-40 rounded-md object-cover" />
                    <button type="button" onClick={() => setForm(p => ({ ...p, coverImage: '' }))}
                      className="absolute top-1 right-1 h-5 w-5 rounded bg-error text-white flex items-center justify-center cursor-pointer hover:opacity-80">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => navigate(`/courses/${id}`)} disabled={loading}
                  className="h-8 px-4 rounded-md border border-border text-xs text-text-secondary hover:bg-bg-surface-active cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="h-8 px-4 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-hover cursor-pointer disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="rounded-lg border border-border bg-bg-surface p-6 shadow-sm space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">
              <Plus size={14} className="inline mr-1" style={{ color: t('warning') }} />
              Quick Actions
            </h3>
            <a href={`/courses/${id}/builder`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Network size={12} /> Open Course Builder
            </a>
          </div>
          {form.coverImage && (
            <div className="rounded-lg border border-border bg-bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Current Cover</h3>
              <img src={form.coverImage} alt="Cover" className="w-full rounded-md" />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseEdit;
