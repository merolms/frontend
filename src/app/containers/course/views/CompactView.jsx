import React from 'react';
import { Icon, Label, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const CompactView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className='course-compact'>
        <div className='course-compact-header'>
          <span className='compact-col-title'>Course</span>
          <span>Category</span>
          <span>Status</span>
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className='course-compact-row'>
            <span className='compact-col-title'><div className='skeleton-line' /></span>
            <span><div className='skeleton-line short' /></span>
            <span><div className='skeleton-line shorter' /></span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='course-compact'>
      <div className='course-compact-header'>
        <span className='compact-col-title'>Course</span>
        <span>Category</span>
        <span>Status</span>
        <span className='compact-col-num'>Lessons</span>
        <span className='compact-col-num'>Enrolled</span>
        <span className='compact-col-actions'>Actions</span>
      </div>
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <div
            key={course.id}
            className='course-compact-row'
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <span className='compact-col-title'>
              <Icon name='book' size='mini' className='compact-icon' />
              {course.title}
            </span>
            <span>
              <Label color={getCategoryColor(course.category)} size='tiny'>
                {course.category}
              </Label>
            </span>
            <span>
              {status && <Label color={status.color} size='tiny'>{status.text}</Label>}
            </span>
            <span className='compact-col-num'><Icon name='list' size='mini' /> {course.totalLessons}</span>
            <span className='compact-col-num'><Icon name='users' size='mini' /> {course.enrolledUsers}</span>
            <span className='compact-col-actions'>
              <Button icon size='mini' as={Link} to={`/courses/${course.id}/builder`} title='Builder'>
                <Icon name='sitemap' />
              </Button>
              <Button icon size='mini' as={Link} to={`/courses/${course.id}/edit`} title='Edit'>
                <Icon name='pencil' />
              </Button>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CompactView;
