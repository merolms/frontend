import React from 'react';
import { Table } from '@mantine/core';

function CourseTable(props) {
  return (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Course Name</Table.Th>
          <Table.Th>Category</Table.Th>
          <Table.Th>Lessons</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Author</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {props.rows}
      </Table.Tbody>
    </Table>
  );
}

export default CourseTable;
