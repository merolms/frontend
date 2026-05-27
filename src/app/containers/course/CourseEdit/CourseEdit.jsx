import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Header, Icon, Breadcrumb, Divider, Button, Grid, Segment, Image, Form, Input, TextArea, Dropdown, Message, Label } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchCourseById, updateCourse } from '@/app/services/courseService';
import '../CourseForm/CourseForm.scss';

const tagOptions = [
  'javascript', 'react', 'python', 'css', 'html', 'nodejs', 'typescript',
  'machine-learning', 'data-science', 'design', 'ui', 'ux', 'devops',
  'cloud', 'aws', 'docker', 'api', 'database', 'security',
].map((tag) => ({ key: tag, text: tag, value: tag }));

const categoryOptions = [
  { key: 'cat_prog', text: 'Programming', value: 1 },
  { key: 'cat_des', text: 'Design', value: 2 },
  { key: 'cat_ds', text: 'Data Science', value: 3 },
  { key: 'cat_ops', text: 'DevOps', value: 4 },
  { key: 'cat_bus', text: 'Business', value: 5 },
];

const CourseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', tags: [], coverImage: '' });
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourseById(id);
        setCourse(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.categoryID || data.category || '',
          categoryID: data.categoryID || null,
          tags: data.tags || [],
          coverImage: data.coverImage || data.imageURL || '',
          status: data.status || 'DRAFT',
        });
      } catch (err) {
        setApiError(err.message || 'Failed to load course data.');
      } finally {
        setFetching(false);
      }
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
      await updateCourse(id, form);
      navigate(`/courses/${id}`);
    } catch (err) {
      setApiError(err.message || 'Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, { name, value }) => {
    setForm((p) => {
      const next = { ...p, [name]: value };
      // When category dropdown changes, also store the numeric ID
      if (name === 'category') {
        const opt = categoryOptions.find((o) => o.value === value || o.value === Number(value));
        if (opt) next.categoryID = opt.value;
      }
      return next;
    });
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  if (fetching) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <Segment loading style={{ marginTop: 40 }}>
            <Header as='h2'>Loading course data...</Header>
          </Segment>
        </div>
      </div>
    );
  }

  if (apiError && !course) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <Segment placeholder style={{ marginTop: 40 }}>
            <Header icon><Icon name='warning circle' /> {apiError}</Header>
            <Button primary onClick={() => navigate('/courses')}>Back to Courses</Button>
          </Segment>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>

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

                <Form onSubmit={handleSubmit} loading={loading} error={!!apiError || Object.keys(errors).length > 0}>
                  {apiError && (
                    <Message error size='small'><p>{apiError}</p></Message>
                  )}
                  {Object.keys(errors).length > 0 && !apiError && (
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
                    <Button type='button' onClick={() => navigate(`/courses/${id}`)} disabled={loading}>Cancel</Button>
                    <Button type='submit' primary loading={loading}><Icon name='save' /> Save Changes</Button>
                  </div>
                </Form>
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
              {form.coverImage && (
                <Segment className='course-form-tips'>
                  <Header as='h4'><Icon name='image' /> Current Cover</Header>
                  <Image src={form.coverImage} fluid rounded />
                </Segment>
              )}
            </Grid.Column>
          </Grid>
        </div>

      </div>
    </div>
  );
};

export default CourseEdit;
