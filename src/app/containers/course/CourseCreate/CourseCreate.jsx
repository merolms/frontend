import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Stack, Title, Text } from '@mantine/core';
import { IconHome, IconPlus } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { createCourse } from '@/app/services/courseService';
import UnsplashPicker from '@/app/containers/course/components/UnsplashPicker';
import '../CourseForm/CourseForm.scss';

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

const CourseCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: null, tags: [], coverImage: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [unsplashOpen, setUnsplashOpen] = useState(false);

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
      const course = await createCourse(form);
      navigate(`/courses/${course.id}`);
    } catch (err) {
      setApiError(err.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md">
          <Anchor onClick={() => navigate('/courses')}>Courses</Anchor>
          <span>Create Course</span>
        </Breadcrumbs>

        <div className='course-form-page'>
          <div style={{ display: 'grid', gridTemplateColumns: '10fr 6fr', gap: 16 }}>
            <Paper className='course-form-card' p="lg" radius="md" withBorder>
              <Title order={3} mb={4}><IconPlus size={20} color="#33a163" /> Create New Course</Title>
              <Text c="dimmed" size="sm" mb="md">Fill in the course details below. You can add lessons later from the Course Builder.</Text>

              <form onSubmit={handleSubmit}>
                <Stack gap="sm">
                  {apiError && <Text size="sm" c="red">{apiError}</Text>}
                  {Object.keys(errors).length > 0 && !apiError && <Text size="sm" c="red">Please fix the errors below.</Text>}

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Course Title *</label>
                    <input name='title' placeholder='e.g., Advanced React Patterns' value={form.title} onChange={(e) => { setForm(p => ({ ...p, title: e.target.value })); if (errors.title) setErrors(p => ({ ...p, title: null })); }} style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }} />
                    {errors.title && <Text size="xs" c="red">{errors.title}</Text>}
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Description *</label>
                    <textarea name='description' placeholder='What will students learn? What are the prerequisites?' style={{ width: '100%', minHeight: 110, padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }} value={form.description} onChange={(e) => { setForm(p => ({ ...p, description: e.target.value })); if (errors.description) setErrors(p => ({ ...p, description: null })); }} />
                    {errors.description && <Text size="xs" c="red">{errors.description}</Text>}
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Category *</label>
                    <select name='category' value={form.category || ''} onChange={(e) => { setForm(p => ({ ...p, category: e.target.value ? parseInt(e.target.value) : null })); if (errors.category) setErrors(p => ({ ...p, category: null })); }} style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4 }}>
                      <option value="">Select a category</option>
                      {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.category && <Text size="xs" c="red">{errors.category}</Text>}
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Tags</label>
                    <select multiple name='tags' value={form.tags} onChange={(e) => setForm(p => ({ ...p, tags: Array.from(e.target.selectedOptions, o => o.value) }))} style={{ width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4, minHeight: 100 }}>
                      {tagOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Cover Image</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <input name='coverImage' placeholder='https://example.com/cover.jpg' value={form.coverImage} onChange={(e) => setForm(p => ({ ...p, coverImage: e.target.value }))} style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
                      <button type='button' className='mantine-Button-root mantine-Button-variant-default' onClick={() => setUnsplashOpen(true)} disabled={loading} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }}>Unsplash</button>
                    </div>
                    {form.coverImage && (
                      <div style={{ position: 'relative', marginTop: 8, display: 'inline-block' }}>
                        <img src={form.coverImage} alt="Cover" style={{ maxHeight: 180, borderRadius: 4, objectFit: 'cover' }} />
                        <button type='button' className='cover-remove-btn' onClick={() => setForm(p => ({ ...p, coverImage: '' }))} style={{ position: 'absolute', top: 4, right: 4, padding: 2, border: 'none', background: '#c53030', color: '#fff', borderRadius: 2, cursor: 'pointer' }}>✕</button>
                      </div>
                    )}
                  </div>

                  <UnsplashPicker open={unsplashOpen} onClose={() => setUnsplashOpen(false)} onSelect={(url) => { setForm(p => ({ ...p, coverImage: url })); setUnsplashOpen(false); }} initialQuery={form.title || 'education'} />

                  <div className='course-form-actions' style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                    <button type='button' className='mantine-Button-root mantine-Button-variant-default' onClick={() => navigate('/courses')} disabled={loading} style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type='submit' className='mantine-Button-root mantine-Button-variant-filled' disabled={loading} style={{ padding: '8px 16px', background: '#33a163', color: '#fff', border: 'none', borderRadius: 4 }}>{loading ? 'Creating...' : 'Create Course'}</button>
                  </div>
                </Stack>
              </form>
            </Paper>

            <Paper className='course-form-tips' p="lg" radius="md" withBorder>
              <Title order={5}><span role="img" aria-label="lightbulb">💡</span> Tips</Title>
              <ul className='tips-list'>
                <li>Choose a descriptive, specific title</li>
                <li>Write a compelling description (100-200 words)</li>
                <li>Select the most relevant category</li>
                <li>Add relevant tags to improve discoverability</li>
                <li>Use a high-quality cover image (16:9 ratio)</li>
              </ul>
            </Paper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
