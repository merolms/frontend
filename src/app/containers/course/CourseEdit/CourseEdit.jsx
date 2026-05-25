import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import CourseForm from '@/app/containers/course/CourseForm/CourseForm';
import { mockFetchCourseById, mockUpdateCourse } from '@/app/services/courseService';

const CourseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setFetching(true);
        const data = await mockFetchCourseById(id);
        setCourse(data);
      } catch (err) {
        setError('Failed to load course data.');
      } finally {
        setFetching(false);
      }
    };
    loadCourse();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await mockUpdateCourse(id, formData);
      navigate(`/courses/${updated.id}`);
    } catch (err) {
      setError('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/courses/${id}`);
  };

  if (fetching) {
    return (
      <div className='content-center course-page'>
        <Segment loading className='course-form-segment'>
          <Header as='h1'>Loading...</Header>
        </Segment>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className='content-center course-page'>
        <Segment className='course-form-segment'>
          <Header as='h1' color='red'>
            <Icon name='warning circle' /> Error
          </Header>
          <p>{error}</p>
        </Segment>
      </div>
    );
  }

  return (
    <div className='content-center course-page'>
      <Breadcrumb>
        <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section link onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>Edit</Breadcrumb.Section>
      </Breadcrumb>
      <Divider hidden />

      <Segment className='course-form-segment'>
        <Header as='h1'>
          <Icon name='pencil' color='blue' />
          Edit Course
        </Header>
        <p className='course-form-subtitle'>Update the course details below.</p>

        {error && (
          <div className='course-form-error'>
            <Icon name='warning circle' /> {error}
          </div>
        )}

        <CourseForm
          initialData={course}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          submitLabel='Save Changes'
        />
      </Segment>
    </div>
  );
};

export default CourseEdit;
