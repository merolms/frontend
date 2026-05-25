import React from 'react';
import { Icon, Label, Image } from 'semantic-ui-react';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const GridView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className='courses-view-grid'>
        {[...Array(8)].map((_, i) => (
          <div key={i} className='course-card-skeleton'>
            <div className='skeleton-image' />
            <div className='skeleton-content'>
              <div className='skeleton-line' />
              <div className='skeleton-line short' />
              <div className='skeleton-line shorter' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='courses-view-grid'>
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <div
            key={course.id}
            className='course-card'
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            {course.coverImage ? (
              <Image src={course.coverImage} wrapped ui={false} className='course-card-image' />
            ) : (
              <div className='course-card-image course-card-no-image'>
                <Icon name='book' size='huge' color='grey' />
              </div>
            )}

            <div className='course-card-body'>
              <h3 className='course-card-title'>{course.title}</h3>
              <p className='course-card-meta'>
                <Icon name='user' size='mini' /> {course.author}
              </p>
              <p className='course-card-description'>{course.description}</p>
            </div>

            <div className='course-card-footer'>
              <Label color={getCategoryColor(course.category)} size='tiny' basic>
                {course.category}
              </Label>
              <div className='course-card-stats'>
                <span><Icon name='list' size='mini' /> {course.totalLessons}</span>
                <span><Icon name='users' size='mini' /> {course.enrolledUsers}</span>
              </div>
              {status && (
                <Label color={status.color} size='tiny' basic>
                  {status.text}
                </Label>
              )}
            </div>

            {course.tags?.length > 0 && (
              <div className='course-card-tags'>
                {course.tags.slice(0, 3).map((tag) => (
                  <Label key={tag} size='mini' basic>{tag}</Label>
                ))}
                {course.tags.length > 3 && (
                  <Label size='mini' basic>+{course.tags.length - 3}</Label>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GridView;
