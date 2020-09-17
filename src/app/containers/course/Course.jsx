import React from 'react';
import { Header, Divider, Form, Input, Grid, Button, List, Dropdown, Pagination } from 'semantic-ui-react';
import faker from 'faker';

import CourseTable from './CourseTable/CourseTable';

import CourseGrid from './CourseGrid/CourseGrid';
import CourseGridItem from './CourseGrid/CourseGridItem/CourseGridItem';

import './Course.scss';
import CourseTableItem from './CourseTable/CourseTableItem/CourseTableItem';

import NewCourse from './NewCourse/NewCourse';

class CourseContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          query: '',
          view: "grid",
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
        let course;
        for (let i = 0; i <8; i++) {
            
            switch (this.state.view) {
              case "table":
                course={
                  Title: faker.random.words(5),
                  Category: faker.random.words(5),
                  Lesson: faker.random.number(),
                  Status: faker.random.alphaNumeric(1),
                  Author: faker.random.words(2),
                }
                
                rows.push(<CourseTableItem key={i} course={course} />)
                break;
              case "grid":
                 course={
                  Title: faker.random.words(5),
                  CoverImage: faker.random.image(),
                  Description: faker.random.words(25),
                }
                rows.push(<Grid.Column key={i} style={{margin: '0px', marginBottom: '25px'}}> <CourseGridItem course={course} /></Grid.Column>)
                break;
            }
            
        }
        let viewType;
        switch (this.state.view) {
          case "table":
            viewType=<CourseTable rows={rows} />
            break;
          case "grid":
            viewType=<CourseGrid rows={rows} />
            break;
        }
        return (
                <div className="content-center courses">
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
                        <NewCourse />
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
                            <Button icon='list' onClick={()=>this.onChangeView("list")}/>
                            <Button icon='grid layout' onClick={()=>this.onChangeView("grid")} />
                            <Button icon="table" onClick={()=>this.onChangeView("table")}/>
                        </Grid.Column>
                    </Grid>
                    {viewType}
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
    onChangeView=(value)=> {
      this.setState({
        view: value,
      });
    }
}

export default CourseContainer;