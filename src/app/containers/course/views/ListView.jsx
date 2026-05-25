import React from 'react';
import { List, Card, Icon, Image, Label, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const ListView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <List divided relaxed>
        {[...Array(3)].map((_, i) => (
          <List.Item key={i}>
            <div className='skeleton-list-item'>
              <div className='skeleton-list-image' />
              <div className='skeleton-list-content'>
                <div className='skeleton-line' />
                <div className='skeleton-line short' />
                <div className='skeleton-line shorter' />
              </div>
            </div>
          </List.Item>
        ))}
      </List>
    );
  }

  return (
    <List divided relaxed className='course-list'>
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <List.Item
            key={course.id}
            className={`course-list-item course-status-${course.status}`}
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <Image
              avatar
              src={course.coverImage}
              style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 8 }}
            />
            <List.Content style={{ flex: 1 }}>
              <List.Header className='course-list-title'>
                {course.title}
                {status && (
                  <Label
                    color={status.color}
                    size='tiny'
                    basic
                    style={{ marginLeft: 8 }}
                  >
                    {status.text}
                  </Label>
                )}
              </List.Header>
              <List.Description className='course-list-description'>
                {course.description}
              </List.Description>
              <div className='course-list-meta'>
                <span>
                  <Label color={getCategoryColor(course.category)} size='tiny' basic>
                    <Icon name='folder' /> {course.category}
                  </Label>
                </span>
                <span><Icon name='user' size='mini' /> {course.author}</span>
                <span><Icon name='list' size='mini' /> {course.totalLessons} lessons</span>
                <span><Icon name='users' size='mini' /> {course.enrolledUsers}</span>
                <span><Icon name='clock outline' size='mini' /> {course.duration}</span>
              </div>
              {course.tags?.length > 0 && (
                <div className='course-list-tags'>
                  {course.tags.map((tag) => (
                    <Label key={tag} size='mini' basic>{tag}</Label>
                  ))}
                </div>
              )}
            </List.Content>
            <List.Content floated='right'>
              <Button.Group size='small'>
                <Button icon as={Link} to={`/courses/${course.id}/builder`} title='Open Builder'>
                  <Icon name='sitemap' />
                </Button>
                <Button icon as={Link} to={`/courses/${course.id}/edit`} title='Edit'>
                  <Icon name='pencil' />
                </Button>
                <Button icon as={Link} to={`/courses/${course.id}`} title='View'>
                  <Icon name='arrow right' />
                </Button>
              </Button.Group>
            </List.Content>
          </List.Item>
        );
      })}
    </List>
  );
};

export default ListView;
