import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Header, Segment, Icon, Button, Label, Progress, Grid, Card, Image,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchEnrollments } from '@/app/services/enrollmentService';
import { useSelector } from 'react-redux';
import { mockCourses } from '@/app/services/courseService';

const MyLearning = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, [user]);

  const loadEnrollments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchEnrollments({ userId: user.id });
      setEnrollments(data);
    } catch (err) {
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCourse = (courseId) => mockCourses.find((c) => c.id === courseId);

  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const completedEnrollments = enrollments.filter((e) => e.status === 'completed');
  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  if (!user) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment placeholder>
              <Header icon><Icon name='lock' /> Please log in</Header>
              <Button primary onClick={() => navigate('/login')}>Sign In</Button>
            </Segment>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>

        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>My Learning</h1>
            <p className='page-subtitle'>{activeEnrollments.length} active course{activeEnrollments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className='dashboard-content'>

          {/* Stats */}
          <Grid columns={3} stackable className='mylearning-stats'>
            <Grid.Column>
              <Segment className='mylearning-stat-card'>
                <Icon name='book' color='blue' size='large' />
                <div className='mylearning-stat-info'>
                  <div className='mylearning-stat-value'>{enrollments.length}</div>
                  <div className='mylearning-stat-label'>Total Enrolled</div>
                </div>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment className='mylearning-stat-card'>
                <Icon name='check circle' color='green' size='large' />
                <div className='mylearning-stat-info'>
                  <div className='mylearning-stat-value'>{completedEnrollments.length}</div>
                  <div className='mylearning-stat-label'>Completed</div>
                </div>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment className='mylearning-stat-card'>
                <Icon name='chart line' color='teal' size='large' />
                <div className='mylearning-stat-info'>
                  <div className='mylearning-stat-value'>{overallProgress}%</div>
                  <div className='mylearning-stat-label'>Avg Progress</div>
                </div>
              </Segment>
            </Grid.Column>
          </Grid>

          {/* Active Courses */}
          <Header as='h3' className='mylearning-section-title'>
            <Icon name='book' color='blue' /> Continue Learning
          </Header>
          {loading ? (
            <Segment loading><h3>Loading your courses...</h3></Segment>
          ) : activeEnrollments.length === 0 ? (
            <Segment placeholder className='mylearning-empty'>
              <Icon name='book' size='huge' color='grey' />
              <Header as='h3' color='grey'>No active courses</Header>
              <p>Browse courses and enroll to start learning.</p>
              <Button primary onClick={() => navigate('/courses')}>
                <Icon name='search' /> Browse Courses
              </Button>
            </Segment>
          ) : (
            <div className='mylearning-list'>
              {activeEnrollments.map((enrollment) => {
                const course = getCourse(enrollment.courseId);
                return (
                  <Card key={enrollment.id} className='mylearning-card' as={Link} to={`/courses/${enrollment.courseId}/learn`}>
                    {course?.coverImage && (
                      <Image src={course.coverImage} wrapped ui={false} className='mylearning-card-image' />
                    )}
                    <Card.Content>
                      <div className='mylearning-card-header'>
                        <div>
                          <Card.Header>{course?.title || `Course #${enrollment.courseId}`}</Card.Header>
                          <Card.Meta>
                            {course?.author && <span><Icon name='user' size='mini' /> {course.author}</span>}
                            <span style={{ marginLeft: 8 }}>Enrolled {enrollment.enrolledAt}</span>
                          </Card.Meta>
                        </div>
                        <Label color='blue' size='tiny'>{enrollment.progress}%</Label>
                      </div>
                      <Progress percent={enrollment.progress} color='teal' size='small' style={{ margin: '10px 0 4px' }} />
                      <p className='mylearning-card-progress-text'>
                        {enrollment.completedLessons?.length || 0} of {course?.totalLessons || 0} lessons completed
                      </p>
                    </Card.Content>
                    <Card.Content extra>
                      <Button primary size='small' fluid>
                        <Icon name='play' /> Continue Learning
                      </Button>
                    </Card.Content>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Completed Courses */}
          {completedEnrollments.length > 0 && (
            <>
              <Header as='h3' className='mylearning-section-title'>
                <Icon name='trophy' color='yellow' /> Completed
              </Header>
              <div className='mylearning-list'>
                {completedEnrollments.map((enrollment) => {
                  const course = getCourse(enrollment.courseId);
                  return (
                    <Card key={enrollment.id} className='mylearning-card completed' as={Link} to={`/courses/${enrollment.courseId}`}>
                      {course?.coverImage && (
                        <Image src={course.coverImage} wrapped ui={false} className='mylearning-card-image' />
                      )}
                      <Card.Content>
                        <div className='mylearning-card-header'>
                          <div>
                            <Card.Header>{course?.title || `Course #${enrollment.courseId}`}</Card.Header>
                            <Card.Meta>Completed {enrollment.lastAccessed}</Card.Meta>
                          </div>
                          <Label color='green' size='tiny'><Icon name='check circle' /> Done</Label>
                        </div>
                      </Card.Content>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyLearning;
