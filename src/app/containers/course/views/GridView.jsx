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
            {/* Cover Image */}
            {course.coverImage ? (
              <Image src={course.coverImage} wrapped ui={false} className='course-card-image' />
            ) : (
              <div className='course-card-image course-card-no-image'>
                <Icon name='book' size='huge' color='grey' />
              </div>
            )}

            <div className='course-card-body'>
              {/* Meta Row */}
              <div className='course-card-meta-row'>
                <span className='course-card-category'>
                  <Label color={getCategoryColor(course.category)} size='tiny' basic>{course.category}</Label>
                </span>
                <span className='course-card-author'>
                  <Icon name='user' size='mini' /> {course.author}
                </span>
              </div>

              {/* Title */}
              <h3 className='course-card-title'>{course.title}</h3>

              {/* Description */}
              <p className='course-card-description'>{course.description}</p>

              {/* Stats & Rating */}
              <div className='course-card-info-row'>
                <div className='course-card-stats'>
                  <span><Icon name='list' size='mini' /> {course.totalLessons} Lessons</span>
                  <span><Icon name='users' size='mini' /> {course.enrolledUsers}</span>
                  <span><Icon name='clock outline' size='mini' /> {course.duration}</span>
                </div>
              </div>

              {/* Tags */}
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

              {/* Status */}
              {status && (
                <div className='course-card-status'>
                  <Label color={status.color} size='tiny' basic>{status.text}</Label>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GridView;
