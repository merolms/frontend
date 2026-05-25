import React from 'react';
import { Grid, Card, Icon, Label, Image } from 'semantic-ui-react';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const GridView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <Grid columns={4} stackable>
        {[...Array(8)].map((_, i) => (
          <Grid.Column key={i}>
            <Card className='course-card-skeleton'>
              <div className='skeleton-image' />
              <Card.Content>
                <div className='skeleton-line' />
                <div className='skeleton-line short' />
                <div className='skeleton-line shorter' />
              </Card.Content>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
    );
  }

  return (
    <Grid columns={4} stackable doubling>
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <Grid.Column key={course.id}>
            <Card
              className='course-card'
              as='a'
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              {/* Image */}
              {course.coverImage ? (
                <Image src={course.coverImage} wrapped ui={false} className='course-card-image' />
              ) : (
                <div className='course-card-image course-card-no-image'>
                  <Icon name='book' size='huge' color='grey' />
                </div>
              )}

              <Card.Content>
                <Card.Header>
                  <span className='course-card-title'>{course.title}</span>
                </Card.Header>
                <Card.Meta>
                  <span><Icon name='user' size='mini' /> {course.author}</span>
                </Card.Meta>
                <Card.Description>
                  {course.description}
                </Card.Description>
              </Card.Content>

              <Card.Content extra>
                <div className='course-card-extra'>
                  {/* Category badge */}
                  <Label color={getCategoryColor(course.category)} size='tiny' basic>
                    {course.category}
                  </Label>

                  {/* Stats */}
                  <div className='course-card-stats'>
                    <span><Icon name='list' size='mini' /> {course.totalLessons}</span>
                    <span><Icon name='users' size='mini' /> {course.enrolledUsers}</span>
                  </div>

                  {/* Status */}
                  {status && (
                    <Label color={status.color} size='tiny' basic>
                      {status.text}
                    </Label>
                  )}
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
              </Card.Content>
            </Card>
          </Grid.Column>
        );
      })}
    </Grid>
  );
};

export default GridView;
