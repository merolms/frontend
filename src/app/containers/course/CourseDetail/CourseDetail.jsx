import React from 'react';
import { Breadcrumb, Header, Divider, Tab,List, Grid, Card, Icon } from 'semantic-ui-react';
import faker from 'faker';

import "./CourseDetail.scss"

class CourseDetail extends React.Component {

    render() {
        const panes = [
            {
              menuItem: 'Overview',
              render: () => 
              <Tab.Pane attached={false}>
                  <Header as='h4' content="About Course" />
                  <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has beethendustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electroni typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset shes containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMake   r including versions of Lorem Ipsum.</div>
                  <Header as='h4' content="You will learn" />
                   <List>
                        <List.Item>
                            <List.Icon name='checkmark' color={"green"} />
                            <List.Content>{faker.random.words(5)}</List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Icon name='checkmark' color={"green"} />
                            <List.Content>{faker.random.words(5)}</List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Icon name='checkmark'color={"green"} />
                            <List.Content>{faker.random.words(5)}</List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Icon name='checkmark' color={"green"}  />
                            <List.Content>{faker.random.words(5)}</List.Content>
                        </List.Item>
                   </List>
              </Tab.Pane>,
            },
            {
              menuItem: 'FAQ',
              render: () => <Tab.Pane attached={false}>FAQ</Tab.Pane>,
            },
            {
              menuItem: 'Announcement',
              render: () => <Tab.Pane attached={false}>Announcement</Tab.Pane>,
            },
            {
                menuItem: 'Reviews',
                render: () => <Tab.Pane attached={false}>Reviews</Tab.Pane>,
              },
          ]
          let courseContains=[]
          for (let i=1;i<=10;i++) {
            courseContains.push(
            <Card
                fluid
                header={"Lesson "+i+": "+faker.random.words(5)}
                description={faker.random.words(25)}
                extra={<a><Icon name='clock outline' color="green" />30 mins</a>}
            />)
          }
          
        return (
           <div className="content-center course-details">
               <Breadcrumb>
                    <Breadcrumb.Section link href={"/courses"}>Courses</Breadcrumb.Section>
                    <Breadcrumb.Divider />
                    <Breadcrumb.Section active>course_id</Breadcrumb.Section>
                </Breadcrumb>
                <Divider hidden />
                <Grid>
                    <Grid.Column width={10}>
                        <Header as='h1' content="The Web Developer Bootcamp for Beginner" color={"black"}/>
                        <Divider  hidden />
                        <div className="watch-course" />
                        <Divider hidden />
                        <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Header as='h2' content="Course Content" color={"black"}/>
                        {courseContains}
                    </Grid.Column>
                </Grid>
           </div>
        )
    }
}
export default CourseDetail