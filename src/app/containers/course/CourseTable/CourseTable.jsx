import React from 'react'
import { Table } from 'semantic-ui-react';

function CourseTable(props) {
    return (
        <Table striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Course Name</Table.HeaderCell>
            <Table.HeaderCell>Category</Table.HeaderCell>
            <Table.HeaderCell>Lessons</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Author</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
            {props.rows}
        <Table.Body>
          
        </Table.Body>
      </Table>
    )
}

export default CourseTable;