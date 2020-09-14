import React from 'react';
import { Table } from 'semantic-ui-react';

const CourseTableItem=(props)=> {
    const course=props.course
    return (
        <Table.Row>
            <Table.Cell>{course.Title}</Table.Cell>
            <Table.Cell>{course.Category}</Table.Cell>
            <Table.Cell>{course.Lesson}</Table.Cell>
            <Table.Cell>{course.Status}</Table.Cell>
            <Table.Cell>{course.Author}</Table.Cell>
          </Table.Row>
    )
}

export default CourseTableItem