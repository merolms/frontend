import React from 'react'
import {Button, Header, Card, Icon, Grid, Divider } from 'semantic-ui-react';
import "./step2.scss"

import faker from 'faker'
// import _ from 'lodash'

function Step2(props){
    let items=[]
    for(let i=1;i<=10;i++){
        items.push(
        <div key={i}>
            <div className="container">
            <Grid textAlign='left' className="item parent">
                <Grid.Column width={12} style={{display: 'flex', alignItems:"baseline"}}>
                    <Header as="h4" color="grey"><Icon name='move' size="mini" />Unit {i}: {faker.random.words(3)}</Header>
                </Grid.Column>
                <Grid.Column floated='right' width={2}style={{display: 'flex', justifyContent:'space-between'}}>
                    <Icon name='pencil' />
                    <Icon name='trash' />
                    <Icon name="angle down" />
                </Grid.Column>
            </Grid>
            <Divider hidden />
            <div>
                <Grid textAlign='left' className="item child">
                    <Grid.Column width={12} style={{display: 'flex', alignItems:"baseline"}}>
                        <Header as="h5" color="grey"><Icon name='move' size="mini" />{faker.random.words(10)}</Header>
                    </Grid.Column>
                    <Grid.Column floated='right' width={2}style={{display: 'flex', justifyContent:'space-around'}}>
                        <Icon name='pencil' />
                        <Icon name='trash' />
                    </Grid.Column>
                </Grid>
                <Divider hidden />
                <div className="create-content-container">
                    <Button basic>Create Content</Button>
                </div>
            </div>
        </div>
            <Divider hidden />
        </div>
)
    }
    return (
        <React.Fragment>
            <div className="lesson-container">
                <Button basic>Create Lesson</Button>
            </div>
            <Divider hidden />
            {items}
        </React.Fragment>
    )
}

export default Step2 