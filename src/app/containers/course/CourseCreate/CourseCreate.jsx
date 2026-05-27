import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Icon, Breadcrumb, Divider, Button, Grid, Segment, Image, Form, Input, TextArea, Dropdown, Message, Label } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { createCourse } from '@/app/services/courseService';
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

const CourseCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', tags: [], coverImage: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

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

  const handleChange = (e, { name, value }) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>

        <div className='course-form-page'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Create Course</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Grid stackable>
            <Grid.Column width={10}>
              <Segment className='course-form-card'>
                <Header as='h2'>
                  <Icon name='plus circle' color='green' />
                  Create New Course
                </Header>
                <p className='course-form-subtitle'>Fill in the course details below. You can add lessons later from the Course Builder.</p>

                <Form onSubmit={handleSubmit} loading={loading} error={!!apiError || Object.keys(errors).length > 0}>
                  {apiError && (
                    <Message error size='small'><p>{apiError}</p></Message>
                  )}
                  {Object.keys(errors).length > 0 && !apiError && (
                    <Message error size='small'><p>Please fix the errors below.</p></Message>
                  )}

                  <Form.Field required error={!!errors.title}>
                    <label>Course Title</label>
                    <Input name='title' placeholder='e.g., Advanced React Patterns' value={form.title} onChange={handleChange} />
                    {errors.title && <Label basic color='red' pointing='left'>{errors.title}</Label>}
                  </Form.Field>

                  <Form.Field required error={!!errors.description}>
                    <label>Description</label>
                    <TextArea name='description' placeholder='What will students learn? What are the prerequisites?' style={{ minHeight: 110 }} value={form.description} onChange={handleChange} />
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
                    <Input name='coverImage' placeholder='https://example.com/cover.jpg (16:9 ratio recommended)' value={form.coverImage} onChange={handleChange} />
                    {form.coverImage && (
                      <div className='cover-preview'>
                        <Image src={form.coverImage} fluid rounded />
                      </div>
                    )}
                  </Form.Field>

                  <div className='course-form-actions'>
                    <Button type='button' onClick={() => navigate('/courses')} disabled={loading}>Cancel</Button>
                    <Button type='submit' primary loading={loading}><Icon name='plus circle' /> Create Course</Button>
                  </div>
                </Form>
              </Segment>
            </Grid.Column>

            <Grid.Column width={6}>
              <Segment className='course-form-tips'>
                <Header as='h4'><Icon name='lightbulb' color='yellow' /> Tips</Header>
                <ul className='tips-list'>
                  <li>Choose a descriptive, specific title</li>
                  <li>Write a compelling description (100-200 words)</li>
                  <li>Select the most relevant category</li>
                  <li>Add relevant tags to improve discoverability</li>
                  <li>Use a high-quality cover image (16:9 ratio)</li>
                </ul>
              </Segment>
            </Grid.Column>
          </Grid>
        </div>

      </div>
    </div>
  );
};

export default CourseCreate;
