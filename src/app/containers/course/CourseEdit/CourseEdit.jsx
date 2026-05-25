import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Header, Icon, Breadcrumb, Divider, Button, Grid, Segment, Image } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { mockFetchCourseById, mockUpdateCourse } from '@/app/services/courseService';
import '../CourseForm/CourseForm.scss';

const CourseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    mockFetchCourseById(id).then(setCourse).catch(() => setError('Failed to load course data.')).finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    const updated = await mockUpdateCourse(id, formData);
    navigate(`/courses/${updated.id}`);
  };

  if (fetching) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='course-form-page'><Segment loading><Header as='h2'>Loading...</Header></Segment></div>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        <div className='course-form-page'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section link onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Edit</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Grid stackable>
            <Grid.Column width={10}>
              <Segment className='course-form-card'>
                <Header as='h2'>
                  <Icon name='pencil' color='blue' />
                  Edit Course
                </Header>
                <p className='course-form-subtitle'>Update the course metadata and settings.</p>
                {error && <div className='course-form-error'><Icon name='warning circle' /> {error}</div>}
                <EditCourseForm course={course} onSubmit={handleSubmit} onCancel={() => navigate(`/courses/${id}`)} />
              </Segment>
            </Grid.Column>

            <Grid.Column width={6}>
              <Segment className='course-form-tips'>
                <Header as='h4'><Icon name='lightbulb' color='yellow' /> Quick Actions</Header>
                <div className='quick-actions'>
                  <Button fluid as={Link} to={`/courses/${id}/builder`}>
                    <Icon name='sitemap' /> Open Course Builder
                  </Button>
                  <Button fluid as={Link} to={`/courses/${id}/lessons`}>
                    <Icon name='list' /> Manage Lessons
                  </Button>
                </div>
              </Segment>
              {course?.coverImage && (
                <Segment className='course-form-tips'>
                  <Header as='h4'><Icon name='image' /> Current Cover</Header>
                  <Image src={course.coverImage} fluid rounded />
                </Segment>
              )}
            </Grid.Column>
          </Grid>
        </div>

      </div>
    </div>
  );
};

// ─── Edit form ──────────────────────────────────────────────

import { Form, Input, TextArea, Dropdown, Message, Label } from 'semantic-ui-react';

const tagOptions = [
  'javascript', 'react', 'python', 'css', 'html', 'nodejs', 'typescript',
  'machine-learning', 'data-science', 'design', 'ui', 'ux', 'devops',
  'cloud', 'aws', 'docker', 'api', 'database', 'security',
].map((tag) => ({ key: tag, text: tag, value: tag }));

const categoryOptions = [
  { key: 'Programming', text: 'Programming', value: 'Programming' },
  { key: 'Design', text: 'Design', value: 'Design' },
  { key: 'Data Science', text: 'Data Science', value: 'Data Science' },
  { key: 'DevOps', text: 'DevOps', value: 'DevOps' },
  { key: 'Business', text: 'Business', value: 'Business' },
];

const EditCourseForm = ({ course, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ title: '', description: '', category: '', tags: [], coverImage: '', ...course });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (course) setForm({ ...course }); }, [course]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Course title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(form); }
    finally { setLoading(false); }
  };

  const handleChange = (e, { name, value }) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  return (
    <Form onSubmit={handleSubmit} loading={loading} error={Object.keys(errors).length > 0}>
      {Object.keys(errors).length > 0 && (
        <Message error size='small'><p>Please fix the errors below.</p></Message>
      )}

      <Form.Field required error={!!errors.title}>
        <label>Course Title</label>
        <Input name='title' value={form.title} onChange={handleChange} />
        {errors.title && <Label basic color='red' pointing='left'>{errors.title}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.description}>
        <label>Description</label>
        <TextArea name='description' style={{ minHeight: 110 }} value={form.description} onChange={handleChange} />
        {errors.description && <Label basic color='red' pointing='left'>{errors.description}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.category}>
        <label>Category</label>
        <Dropdown name='category' placeholder='Select a category' fluid search selection options={categoryOptions} value={form.category} onChange={handleChange} />
        {errors.category && <Label basic color='red' pointing='left'>{errors.category}</Label>}
      </Form.Field>

      <Form.Field>
        <label>Tags</label>
        <Dropdown name='tags' placeholder='Add tags to help discovery' fluid multiple search selection options={tagOptions} value={form.tags} onChange={handleChange} />
      </Form.Field>

      <Form.Field>
        <label>Cover Image URL</label>
        <Input name='coverImage' placeholder='https://example.com/cover.jpg' value={form.coverImage} onChange={handleChange} />
        {form.coverImage && (
          <div className='cover-preview'>
            <Image src={form.coverImage} fluid rounded />
          </div>
        )}
      </Form.Field>

      <div className='course-form-actions'>
        <Button type='button' onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type='submit' primary loading={loading}><Icon name='save' /> Save Changes</Button>
      </div>
    </Form>
  );
};

export default CourseEdit;
