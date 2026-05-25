import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Segment, Icon, Breadcrumb, Divider } from 'semantic-ui-react';
import CourseForm from '../CourseForm/CourseForm';
import { mockCreateCourse } from '../../../services/courseService';

const CourseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const course = await mockCreateCourse(formData);
      navigate(`/courses/${course.id}`);
    } catch (err) {
      setError('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/courses');
  };

  return (
    <div className='content-center course-page'>
      <Breadcrumb>
        <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>Create Course</Breadcrumb.Section>
      </Breadcrumb>
      <Divider hidden />

      <Segment className='course-form-segment'>
        <Header as='h1'>
          <Icon name='plus circle' color='green' />
          Create New Course
        </Header>
        <p className='course-form-subtitle'>Fill in the details below to create a new course.</p>

        {error && (
          <div className='course-form-error'>
            <Icon name='warning circle' /> {error}
          </div>
        )}

        <CourseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          submitLabel='Create Course'
        />
      </Segment>
    </div>
  );
};

export default CourseCreate;
