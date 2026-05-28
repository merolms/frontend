import React from 'react';
import { Table } from '@mantine/core';

const CourseTableItem = (props) => {
  const course = props.course;
  return (
    <Table.Tr>
      <Table.Td component="a" href="courses/1">{course.Title}</Table.Td>
      <Table.Td>{course.Category}</Table.Td>
      <Table.Td>{course.Lesson}</Table.Td>
      <Table.Td>{course.Status}</Table.Td>
      <Table.Td>{course.Author}</Table.Td>
    </Table.Tr>
  );
};

export default CourseTableItem;
