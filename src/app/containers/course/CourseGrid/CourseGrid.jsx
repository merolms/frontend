import React from 'react'
import {Grid } from 'semantic-ui-react';

const CourseGrid = (props) => {
    return (
        <Grid stackable style={{display: 'flex', justifyContent: 'center'}}>
            <Grid.Row columns={1} only="mobile">{props.rows}</Grid.Row>
            <Grid.Row columns={2} only="tablet">{props.rows}</Grid.Row>
            <Grid.Row columns={4} only="computer">{props.rows}</Grid.Row>
        </Grid>
    )
}

export default CourseGrid;