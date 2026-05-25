import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header, Divider, Form, Input, Grid, Button, List,
  Dropdown, Pagination
} from 'semantic-ui-react';
import { faker } from '@faker-js/faker';

import CourseTable from './CourseTable/CourseTable';
import CourseGrid from './CourseGrid/CourseGrid';
import CourseGridItem from './CourseGrid/CourseGridItem/CourseGridItem';
import './Course.scss';
import CourseTableItem from './CourseTable/CourseTableItem/CourseTableItem';
import NewCourse from './NewCourse/NewCourse';

const CourseContainer = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');

  const options = [
    { key: 'date', text: 'Date', value: 'date', content: 'Date' },
    { key: 'this week', text: 'This Week', value: 'this week' },
    { key: 'this month', text: 'This Month', value: 'this month' },
  ];

  const rows = [];
  for (let i = 0; i < 8; i++) {
    if (view === 'table') {
      const course = {
        Title: faker.commerce.productName(),
        Category: faker.commerce.department(),
        Lesson: faker.number.int({ min: 1, max: 50 }),
        Status: faker.helpers.arrayElement(['A', 'B', 'C']),
        Author: faker.person.fullName(),
      };
      rows.push(<CourseTableItem key={i} course={course} />);
    } else if (view === 'grid') {
      const course = {
        Title: faker.commerce.productName(),
        CoverImage: faker.image.urlLoremFlickr(),
        Description: faker.lorem.words(25),
      };
      rows.push(
        <Grid.Column key={i} style={{ margin: '0px', marginBottom: '25px' }}>
          <CourseGridItem course={course} />
        </Grid.Column>
      );
    }
  }

  const viewType = view === 'table'
    ? <CourseTable rows={rows} />
    : <CourseGrid rows={rows} />;

  const handleSubmit = (e) => {
    e.preventDefault();
    const escapedSearchQuery = encodeURIComponent(query);
    navigate(`/results?search_query=${escapedSearchQuery}`);
  };

  return (
    <div className="content-center courses">
      <Header as="h1" content="Courses" color="grey" />
      <Divider hidden />
      <Grid>
        <Grid.Column floated="left" width={4}>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <Input
                placeholder="Search"
                size="small"
                action="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Form.Field>
          </Form>
        </Grid.Column>
        <Grid.Column floated="right" width={3} style={{ textAlign: 'right' }}>
          <NewCourse />
        </Grid.Column>
      </Grid>
      <Divider hidden />
      <Grid>
        <Grid.Column floated="left" width={5}>
          <List celled horizontal>
            <List.Item>All</List.Item>
            <List.Item>Assigned</List.Item>
            <List.Item>Published</List.Item>
            <List.Item>Archived</List.Item>
            <List.Item>Draft</List.Item>
          </List>
        </Grid.Column>
        <Grid.Column floated="right" width={3} style={{ textAlign: 'right' }}>
          <b style={{ paddingRight: 10 }}>Show By  </b>
          <Dropdown
            inline
            header="Adjust time span"
            options={options}
            defaultValue={options[0].value}
          />
          <Button icon="list" onClick={() => setView('list')} />
          <Button icon="grid layout" onClick={() => setView('grid')} />
          <Button icon="table" onClick={() => setView('table')} />
        </Grid.Column>
      </Grid>
      {viewType}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination defaultActivePage={5} totalPages={10} />
      </div>
    </div>
  );
};

export default CourseContainer;
