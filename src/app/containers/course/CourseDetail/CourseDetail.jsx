import React from 'react';
import {
  Breadcrumb, Header, Divider, Tab, List, Grid, Card, Icon
} from 'semantic-ui-react';
import { faker } from '@faker-js/faker';

import './CourseDetail.scss';

const panes = [
  {
    menuItem: 'Overview',
    render: () => (
      <Tab.Pane attached={false}>
        <Header as="h4" content="About Course" />
        <div>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text
          ever since the 1500s.
        </div>
        <Header as="h4" content="You will learn" />
        <List>
          <List.Item>
            <List.Icon name="checkmark" color="green" />
            <List.Content>{faker.lorem.sentence()}</List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name="checkmark" color="green" />
            <List.Content>{faker.lorem.sentence()}</List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name="checkmark" color="green" />
            <List.Content>{faker.lorem.sentence()}</List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name="checkmark" color="green" />
            <List.Content>{faker.lorem.sentence()}</List.Content>
          </List.Item>
        </List>
      </Tab.Pane>
    ),
  },
  { menuItem: 'FAQ', render: () => <Tab.Pane attached={false}>FAQ</Tab.Pane> },
  {
    menuItem: 'Announcement',
    render: () => <Tab.Pane attached={false}>Announcement</Tab.Pane>,
  },
  {
    menuItem: 'Reviews',
    render: () => <Tab.Pane attached={false}>Reviews</Tab.Pane>,
  },
];

const courseContains = Array.from({ length: 10 }, (_, i) => (
  <Card
    key={i}
    fluid
    header={`Lesson ${i + 1}: ${faker.lorem.words(5)}`}
    description={faker.lorem.sentences(2)}
    extra={<a><Icon name="clock outline" color="green" /> 30 mins</a>}
  />
));

const CourseDetail = () => {
  return (
    <div className="content-center course-details">
      <Breadcrumb>
        <Breadcrumb.Section link href="/courses">
          Courses
        </Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>course_id</Breadcrumb.Section>
      </Breadcrumb>
      <Divider hidden />
      <Grid>
        <Grid.Column width={10}>
          <Header as="h1" content="The Web Developer Bootcamp for Beginner" color="black" />
          <Divider hidden />
          <div className="watch-course" />
          <Divider hidden />
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        </Grid.Column>
        <Grid.Column width={5}>
          <Header as="h2" content="Course Content" color="black" />
          {courseContains}
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default CourseDetail;
