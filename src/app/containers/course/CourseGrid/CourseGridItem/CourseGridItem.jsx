import React from 'react';
import { Card, Icon, Image } from 'semantic-ui-react'
import styled from 'styled-components';

const ExtraItem = styled.div `
    color: #141313;
    font-weight: bolder;
    margin: 0px 5px;
`

const GridItem = (props) => {
    const course=props.course
    return (
        <Card fluid={true} style={{width:'328px'}}>
            <Image src={course.CoverImage} wrapped />
            <Card.Content>
                <Card.Header>{course.Title}</Card.Header>
                <Card.Description>{course.Description}</Card.Description>
            </Card.Content>
            <Card.Content extra style={{display: 'inline-flex'}}>
                <ExtraItem><Icon name='user' />Course Type</ExtraItem>
                <ExtraItem><Icon name='user' />11 Dec 2020</ExtraItem>
                <ExtraItem><Icon name='user' />50</ExtraItem>
            </Card.Content>
    </Card>
    )
}
export default GridItem;
