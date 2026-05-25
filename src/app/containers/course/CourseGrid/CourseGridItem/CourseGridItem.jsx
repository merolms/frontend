import React from 'react';
import { Card, Icon, Image } from 'semantic-ui-react';

import './CourseGridItem.scss';

const GridItem = (props) => {
  const course = props.course;

  return (
    <Card className="course-grid-item" href="courses/12">
      <Image
        src={course.CoverImage}
        wrapped
        ui={false}
        className="course-grid-image"
      />

      <Card.Content>
        <Card.Header className="course-grid-title">
          {course.Title}
        </Card.Header>

        <Card.Description className="course-grid-description">
          {course.Description}
        </Card.Description>
      </Card.Content>

      <Card.Content extra className="course-grid-extra">
        <span className="extra-item">
          <Icon name="book" /> Course Type
        </span>

        <span className="extra-item">
          <Icon name="calendar" /> 11 Dec 2020
        </span>

        <span className="extra-item">
          <Icon name="users" /> 50
        </span>
      </Card.Content>
    </Card>
  );
};

export default GridItem;