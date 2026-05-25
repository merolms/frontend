import React from 'react';
import { Card, Icon, Image } from 'semantic-ui-react';

import './CourseGridItem.scss';

const GridItem = (props) => {
  const course = props.course;
  return (
    <Card fluid={true} style={{ width: '328px' }} href="courses/12">
      <Image src={course.CoverImage} wrapped />
      <Card.Content>
        <Card.Header>{course.Title}</Card.Header>
        <Card.Description>{course.Description}</Card.Description>
      </Card.Content>
      <Card.Content extra style={{ display: 'inline-flex' }}>
        <span className="extra-item">
          <Icon name="user" /> Course Type
        </span>
        <span className="extra-item">
          <Icon name="user" /> 11 Dec 2020
        </span>
        <span className="extra-item">
          <Icon name="user" /> 50
        </span>
      </Card.Content>
    </Card>
  );
};

export default GridItem;
