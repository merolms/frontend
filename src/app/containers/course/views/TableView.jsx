import React from 'react';
import { Table, Icon, Image, Label, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const TableView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <Table celled compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={5}>Course</Table.HeaderCell>
            <Table.HeaderCell width={2}>Category</Table.HeaderCell>
            <Table.HeaderCell width={2}>Status</Table.HeaderCell>
            <Table.HeaderCell width={1} textAlign='center'>Lessons</Table.HeaderCell>
            <Table.HeaderCell width={1} textAlign='center'>Enrolled</Table.HeaderCell>
            <Table.HeaderCell width={2} textAlign='center'>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[...Array(6)].map((_, i) => (
            <Table.Row key={i}>
              {[5, 2, 2, 1, 1, 2].map((w, j) => (
                <Table.Cell key={j} width={w}>
                  <div className='skeleton-line' />
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }

  return (
    <Table celled selectable compact>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={5}>Course</Table.HeaderCell>
          <Table.HeaderCell width={2}>Category</Table.HeaderCell>
          <Table.HeaderCell width={2}>Status</Table.HeaderCell>
          <Table.HeaderCell width={1} textAlign='center'>Lessons</Table.HeaderCell>
          <Table.HeaderCell width={1} textAlign='center'>Enrolled</Table.HeaderCell>
          <Table.HeaderCell width={2} textAlign='center'>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {courses.map((course) => {
          const status = getStatusLabel(course.status);
          return (
            <Table.Row key={course.id}>
              <Table.Cell>
                <div className='course-table-cell' onClick={() => navigate(`/courses/${course.id}`)}>
                  <Image
                    src={course.coverImage}
                    size='mini'
                    spaced='right'
                    style={{ width: 40, height: 30, objectFit: 'cover' }}
                  />
                  <div className='course-table-info'>
                    <div className='course-table-title'>{course.title}</div>
                    <div className='course-table-desc'>{course.description}</div>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <Label color={getCategoryColor(course.category)} size='tiny'>
                  {course.category}
                </Label>
              </Table.Cell>
              <Table.Cell>
                {status && <Label color={status.color} size='tiny'>{status.text}</Label>}
              </Table.Cell>
              <Table.Cell textAlign='center'>
                <Icon name='list' size='mini' /> {course.totalLessons}
              </Table.Cell>
              <Table.Cell textAlign='center'>
                <Icon name='users' size='mini' /> {course.enrolledUsers}
              </Table.Cell>
              <Table.Cell textAlign='center'>
                <Button icon size='mini' as={Link} to={`/courses/${course.id}`} title='View'>
                  <Icon name='eye' />
                </Button>
                <Button icon size='mini' as={Link} to={`/courses/${course.id}/builder`} title='Builder'>
                  <Icon name='sitemap' />
                </Button>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default TableView;
