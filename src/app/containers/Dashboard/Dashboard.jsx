import React, { useState, useEffect } from 'react';
import { Header, Segment, Grid, Card, Icon, Label, Button, Menu, Dropdown } from 'semantic-ui-react';
import SideBar from '../SideBar/SideBar';
import StatCard from './components/StatCard';
import './Dashboard.scss';

// Import dashboard service
import {
  fetchDashboardStats,
  fetchDashboardActivity,
  fetchEnrollmentCharts,
  fetchTeamStats,
  mockDashboardStats,
  mockDashboardActivity,
  mockEnrollmentCharts,
  mockTeamStats
} from '../../services/dashboardService';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleNavigate = (path) => {
    // Navigation handled by react-router
  };

  // Fetch all dashboard data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Try to fetch real data, fall back to mock data if API fails
        try {
          const [
            statsData,
            activityData,
            enrollmentData,
            teamsData
          ] = await Promise.all([
            fetchDashboardStats(),
            fetchDashboardActivity(),
            fetchEnrollmentCharts(),
            fetchTeamStats()
          ]);
          setStats(statsData);
          setActivity(activityData);
          setEnrollment(enrollmentData);
          setTeams(teamsData);
        } catch (apiError) {
          console.warn('Using mock data due to API error:', apiError);
          // Fall back to mock data
          setStats(mockDashboardStats);
          setActivity(mockDashboardActivity);
          setEnrollment(mockEnrollmentCharts);
          setTeams(mockTeamStats);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <SideBar sidebarOpen={sidebarOpen} onNavigate={handleNavigate} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="dashboard-header">
            <div className="header-left">
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <SideBar sidebarOpen={sidebarOpen} onNavigate={handleNavigate} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="dashboard-header">
            <div className="header-left">
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Error loading data</p>
            </div>
          </div>
          <div className="dashboard-content">
            <div className="error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

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
      case 'course':
        return 'book';
      case 'team':
        return 'users';
      case 'certificate':
        return 'award';
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
      case 'course':
        return 'green';
      case 'team':
        return 'teal';
      case 'certificate':
        return 'purple';
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
            <p className="page-subtitle">Welcome back! Here's what's happening.</p>
          </div>
          <div className="header-right">
            <Button icon primary>
              <Icon name='plus' />
              New Course
            </Button>
          </div>
        </div>

        {/* Stats Cards - Enhanced with roadmap features */}
        <div className="dashboard-content">
          <Segment className="stats-segment" secondary>
            <Grid columns={4} stackable>
              {/* Total Courses */}
              <Grid.Column>
                <StatCard
                  title="Total Courses"
                  value={stats?.totalCourses || 0}
                  icon="book"
                  color="green"
                  trend={stats?.courseGrowth || '+0 this month'}
                  trendUp={stats?.courseGrowth?.includes('+') || true}
                />
              </Grid.Column>

              {/* Total Users */}
              <Grid.Column>
                <StatCard
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  icon="user"
                  color="teal"
                  trend={stats?.userGrowth || '+0 this month'}
                  trendUp={stats?.userGrowth?.includes('+') || true}
                />
              </Grid.Column>

              {/* Total Teams */}
              <Grid.Column>
                <StatCard
                  title="Total Teams"
                  value={stats?.totalTeams || 0}
                  icon="users"
                  color="orange"
                  trend={stats?.teamGrowth || '+0 this month'}
                  trendUp={stats?.teamGrowth?.includes('+') || true}
                />
              </Grid.Column>

              {/* Avg. Completion */}
              <Grid.Column>
                <StatCard
                  title="Avg. Completion"
                  value={stats?.avgCompletion || '0%'}
                  icon="chart line"
                  color="purple"
                  trend={stats?.completionTrend || '+0% vs last month'}
                  trendUp={stats?.completionTrend?.includes('+') || true}
                />
              </Grid.Column>
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
                {stats?.recentCourses?.map((course) => (
                  <Card key={course.id} className="course-card">
                    <Card.Content>
                      <Card.Header>
                        <span>{course.title}</span>
                        {getStatusBadge(course.status)}
                      </Card.Header>
                      <Card.Meta>
                        <span className="course-users">
                          <Icon name='users' size='small' />
                          {course.users} users
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

            {/* Enhanced Activity Feed */}
            <Segment className="content-card">
              <Header as='h2'>
                <Icon name='clock' color='blue' />
                Activity Feed
              </Header>
              <div className="activities-list">
                {activity?.map((activityItem) => (
                  <div key={activityItem.id} className="activity-item">
                    <div className={`activity-icon ${getColorForType(activityItem.type)}`}>
                      <Icon name={getIconForType(activityItem.type)} size='large' />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activityItem.title}</div>
                      <div className="activity-meta">
                        {activityItem.course && (
                          <span className="activity-course">{activityItem.course}</span>
                        )}
                        {activityItem.user && (
                          <span className="activity-user">{activityItem.user}</span>
                        )}
                        <span className="activity-date">{activityItem.date}</span>
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

          {/* Enrollment Charts Section */}
          <Segment className="charts-card">
            <Header as='h2'>
              <Icon name='chart area' color='teal' />
              Enrollment Trends
            </Header>
            <div className="charts-container">
              {/* Monthly Enrollment Chart */}
              <div className="chart-card">
                <Header as='h3'>Monthly Enrollment</Header>
                <div className="chart-placeholder">
                  {/* In a real implementation, this would render an actual chart */}
                  <div className="chart-info">
                    <Icon name='chart line' size='big' color='teal' />
                    <div>
                      <p>Line chart showing enrollment trends over time</p>
                      <p>Data: {enrollment?.monthlyEnrollment?.length || 0} months</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Course Popularity Chart */}
              <div className="chart-card">
                <Header as='h3'>Course Popularity</Header>
                <div className="chart-placeholder">
                  {/* In a real implementation, this would render an actual chart */}
                  <div className="chart-info">
                    <Icon name='pie chart' size='big' color='orange' />
                    <div>
                      <p>Pie chart showing distribution across courses</p>
                      <p>Data: {enrollment?.coursePopularity?.length || 0} courses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Segment>

          {/* Team Performance Section */}
          <Segment className="team-performance-card">
            <Header as='h2'>
              <Icon name='users' color='teal' />
              Team Performance
            </Header>
            <div className="teams-list">
              {teams?.teamPerformance?.map((team) => (
                <div key={team.name} className="team-performance-item">
                  <div className="team-info">
                    <div className="team-name">{team.name}</div>
                    <div className="team-progress">
                      <span>Progress:</span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${team.progress}%`,
                            backgroundColor: team.color
                          }}
                        />
                      </div>
                      <span>{team.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Segment>

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
                <div className="quick-action-label">Add User</div>
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