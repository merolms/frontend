import React from 'react';
import { Header, Divider, Form, Input, Grid, Button, List, Dropdown,Icon, Pagination } from 'semantic-ui-react';
import faker from 'faker';

import GridItem from './GridItem';
import './index.scss';


class CourseContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          query: '',
        };
      }
    render() {
        const options = [
            {
              key: 'date',
              text: 'Date',
              value: 'date',
              content: 'Date',
            },
            {
              key: 'this week',
              text: 'this week',
              value: 'this week',
              content: 'This Week',
            },
            {
              key: 'this month',
              text: 'this month',
              value: 'this month',
              content: 'This Month',
            },
          ]
        let rows=[]
        for (let i = 0; i <8; i++) {
            const course={
                Title: faker.random.words(5),
                CoverImage: faker.random.image(),
                Description: faker.random.words(25),
            }
            console.log(course)
            rows.push(<Grid.Column key={i} style={{margin: '0px', marginBottom: '25px'}}> <GridItem course={course} /></Grid.Column>)
        }
        return (
                <div className="courses">
                    <Header as='h1' content='Courses' color={"grey"}/>
                    <Divider hidden/>
                    <Grid>
                    <Grid.Column floated='left' width={4}>
                        <Form onSubmit={this.onSubmit}>
                            <Form.Field>
                                <Input placeholder='Search' size='small' action='Search' value={this.state.query} onChange={this.onInputChange}/>
                            </Form.Field>
                        </Form>
                    </Grid.Column>
                    <Grid.Column floated='right' width={3} style={{textAlign: "right"}}>
                        <Button positive>Create Course</Button>
                    </Grid.Column>
                    </Grid>
                    <Divider hidden/>
                    <Grid>
                        <Grid.Column floated='left' width={5}>
                        <List celled horizontal>
                            <List.Item>All</List.Item>
                            <List.Item>Assigned</List.Item>
                            <List.Item>Published</List.Item>
                            <List.Item>Archived</List.Item>
                            <List.Item>Draft</List.Item>
                        </List>
                        </Grid.Column>
                        <Grid.Column floated='right' width={3} style={{textAlign: "right"}}>
                        <b style={{paddingRight:10}}>Show By  </b>
                        <Dropdown
                            inline
                            header='Adjust time span'
                            options={options}
                            defaultValue={options[0].value}
                        />
                            <Icon name='list' style={{marginLeft: 20}}/>
                            <Icon name='grid layout' />
                            <Icon name='table' />
                        </Grid.Column>
                    </Grid>
                    <div>
                    <Grid stackable style={{display: 'flex', justifyContent: 'center'}}>
                        <Grid.Row columns={1} only="mobile">{rows}</Grid.Row>
                        <Grid.Row columns={2} only="tablet">{rows}</Grid.Row>
                        <Grid.Row columns={4} only="computer">{rows}</Grid.Row>
                    </Grid>
                    </div>
                    <div style={{display: "flex", justifyContent: "center"}}><Pagination defaultActivePage={5} totalPages={10} /></div>
                </div>
                
        );
    }
    onInputChange = (event) => {
        this.setState({
          query: event.target.value,
        });
      };
    onSubmit = () => {
    const escapedSearchQuery = encodeURI(this.state.query);
    this.props.history.push(`/results?search_query=${escapedSearchQuery}`);
    };
}

export default CourseContainer;