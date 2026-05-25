import React, { useState } from 'react';
import { Header, Segment, Grid, Card, Icon, Statistic, Label, Button, Menu, Dropdown } from 'semantic-ui-react';
import SideBar from '../SideBar/SideBar';
import './Dashboard.scss';

// Sample data for the dashboard
const statsData = [
  {
    title: 'Total Courses',
    value: 24,
    icon: 'book',
    color: 'green',
    trend: '+3 this month',
    trendUp: true
  },
  {
    title: 'Active Students',
    value: 342,
    icon: 'users',
    color: 'blue',
    trend: '+18 this month',
    trendUp: true
  },
  {
    title: 'Completed Lessons',
    value: 156,
    icon: 'check circle',
    color: 'orange',
    trend: '+24 this week',
    trendUp: true
  },
  {
    title: 'Avg. Completion',
    value: '78%',
    icon: 'chart line',
    color: 'purple',
    trend: '+5% vs last month',
    trendUp: true
  }
];

const recentCourses = [
  {
    id: 1,
    title: 'Introduction to React',
    students: 45,
    progress: 75,
    status: 'active',
    image: 'https://picsum.photos/seed/react/120/80'
  },
  {
    id: 2,
    title: 'Advanced CSS Techniques',
    students: 32,
    progress: 45,
    status: 'active',
    image: 'https://picsum.photos/seed/css/120/80'
  },
  {
    id: 3,
    title: 'Python for Data Science',
    students: 67,
    progress: 90,
    status: 'active',
    image: 'https://picsum.photos/seed/python/120/80'
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    students: 28,
    progress: 30,
    status: 'draft',
    image: 'https://picsum.photos/seed/ml/120/80'
  }
];

const upcomingActivities = [
  {
    id: 1,
    title: 'React Quiz - Chapter 5',
    type: 'quiz',
    date: 'Today, 2:00 PM',
    course: 'Introduction to React'
  },
  {
    id: 2,
    title: 'Live Session: CSS Grid',
    type: 'live',
    date: 'Tomorrow, 10:00 AM',
    course: 'Advanced CSS Techniques'
  },
  {
    id: 3,
    title: 'Assignment: Data Visualization',
    type: 'assignment',
    date: 'Next Week',
    course: 'Python for Data Science'
  }
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigate = (path) => {
    // Navigation handled by react-router
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Label color='green' basic size='tiny'>Active</Label>;
      case 'draft':
        return <Label color='grey' basic size='tiny'>Draft</Label>;
      case 'archived':
        return <Label color='red' basic size='tiny'>Archived</Label>;
      default:
        return null;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'green';
    if (progress >= 50) return 'orange';
    if (progress >= 25) return 'yellow';
    return 'red';
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'quiz':
        return 'question circle';
      case 'live':
        return 'video';
      case 'assignment':
        return 'file alternate';
      default:
        return 'calendar';
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'quiz':
        return 'blue';
      case 'live':
        return 'red';
      case 'assignment':
        return 'orange';
      default:
        return 'grey';
    }
  };

  return (
    <div className="dashboard-layout">
      <SideBar sidebarOpen={sidebarOpen} onNavigate={handleNavigate} />

      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Header Bar */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, Angelina! Here's what's happening.</p>
          </div>
          <div className="header-right">
            <Button icon primary>
              <Icon name='plus' />
              New Course
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-content">
          <Segment className="stats-segment" secondary>
            <Grid columns={4} stackable>
              {statsData.map((stat, index) => (
                <Grid.Column key={index}>
                  <Card className="stat-card">
                    <Card.Content>
                      <Card.Header className="stat-title">{stat.title}</Card.Header>
                      <Card.Description>
                        <div className="stat-value">
                          <Icon name={stat.icon} color={stat.color} size='large' />
                          <span>{stat.value}</span>
                        </div>
                        <div className={`stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                          <Icon name={stat.trendUp ? 'arrow up' : 'arrow down'} size='small' />
                          <span>{stat.trend}</span>
                        </div>
                      </Card.Description>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              ))}
            </Grid>
          </Segment>

          <Grid columns={2} stackable className="main-grid">
            {/* Recent Courses */}
            <Segment className="content-card">
              <Header as='h2'>
                <Icon name='book' color='green' />
                Recent Courses
              </Header>
              <Card.Group itemsPerRow={1}>
                {recentCourses.map((course) => (
                  <Card key={course.id} className="course-card">
                    <Card.Content>
                      <Card.Header>
                        <span>{course.title}</span>
                        {getStatusBadge(course.status)}
                      </Card.Header>
                      <Card.Meta>
                        <span className="course-students">
                          <Icon name='users' size='small' />
                          {course.students} students
                        </span>
                      </Card.Meta>
                      <Card.Description>
                        <div className="progress-bar-container">
                          <div className="progress-label">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${course.progress}%`,
                                backgroundColor: getProgressColor(course.progress)
                              }}
                            />
                          </div>
                        </div>
                      </Card.Description>
                    </Card.Content>
                  </Card>
                ))}
              </Card.Group>
            </Segment>

            {/* Upcoming Activities */}
            <Segment className="content-card">
              <Header as='h2'>
                <Icon name='clock' color='blue' />
                Upcoming Activities
              </Header>
              <div className="activities-list">
                {upcomingActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${getColorForType(activity.type)}`}>
                      <Icon name={getIconForType(activity.type)} size='large' />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-meta">
                        <span className="activity-course">{activity.course}</span>
                        <span className="activity-date">{activity.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button basic color='blue' className="view-all-btn">
                View All Activities
              </Button>
            </Segment>
          </Grid>

          {/* Quick Actions */}
          <Segment className="quick-actions-card">
            <Header as='h3'>
              <Icon name='bolt' color='orange' />
              Quick Actions
            </Header>
            <Grid columns={4} divided stackable>
              <Grid.Column>
                <Button fluid primary icon size='large'>
                  <Icon name='plus circle' />
                </Button>
                <div className="quick-action-label">Create Course</div>
              </Grid.Column>
              <Grid.Column>
                <Button fluid secondary icon size='large'>
                  <Icon name='user plus' />
                </Button>
                <div className="quick-action-label">Add Student</div>
              </Grid.Column>
              <Grid.Column>
                <Button fluid secondary icon size='large'>
                  <Icon name='upload' />
                </Button>
                <div className="quick-action-label">Upload Content</div>
              </Grid.Column>
              <Grid.Column>
                <Button fluid secondary icon size='large'>
                  <Icon name='chart bar' />
                </Button>
                <div className="quick-action-label">View Reports</div>
              </Grid.Column>
            </Grid>
          </Segment>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
