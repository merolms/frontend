import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { mockDashboardStats, mockDashboardActivity } from '@/app/services/dashboardService';
import './Dashboard.scss';

const Dashboard = () => {
  const user = useSelector((s) => s.auth.user);

  // Use mock data directly (no API calls needed)
  const stats = mockDashboardStats;
  const activity = mockDashboardActivity;

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className="dashboard-main">

        {/* Header */}
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Dashboard</h1>
            <p className='page-subtitle'>Welcome back{user ? `, ${user.firstName}` : ''}! Here's your overview.</p>
          </div>
        </div>

        <div className='dashboard-content'>

          {/* Stats Row */}
          <div className='stats-row'>
            <div className='stat-card'>
              <div className='stat-icon green'><Icon name='book' /></div>
              <div className='stat-info'>
                <div className='stat-value'>{stats.totalCourses}</div>
                <div className='stat-label'>Total Courses</div>
                <div className='stat-trend up'><Icon name='arrow up' /> {stats.courseGrowth}</div>
              </div>
            </div>
            <div className='stat-card'>
              <div className='stat-icon teal'><Icon name='users' /></div>
              <div className='stat-info'>
                <div className='stat-value'>{stats.totalUsers}</div>
                <div className='stat-label'>Total Users</div>
                <div className='stat-trend up'><Icon name='arrow up' /> {stats.userGrowth}</div>
              </div>
            </div>
            <div className='stat-card'>
              <div className='stat-icon orange'><Icon name='sitemap' /></div>
              <div className='stat-info'>
                <div className='stat-value'>{stats.totalTeams}</div>
                <div className='stat-label'>Total Teams</div>
                <div className='stat-trend up'><Icon name='arrow up' /> {stats.teamGrowth}</div>
              </div>
            </div>
            <div className='stat-card'>
              <div className='stat-icon purple'><Icon name='chart line' /></div>
              <div className='stat-info'>
                <div className='stat-value'>{stats.avgCompletion}</div>
                <div className='stat-label'>Avg. Completion</div>
                <div className='stat-trend up'><Icon name='arrow up' /> {stats.completionTrend}</div>
              </div>
            </div>
          </div>

          {/* Main Content: Two Columns */}
          <div className='dashboard-columns'>

            {/* Left Column */}
            <div className='dashboard-left'>

              {/* Recent Courses */}
              <div className='dashboard-card'>
                <div className='card-header'>
                  <h3><Icon name='book' color='green' /> Recent Courses</h3>
                </div>
                <div className='card-body'>
                  {stats.recentCourses?.map((course) => (
                    <div key={course.id} className='course-item'>
                      <div className='course-item-info'>
                        <h4>{course.title}</h4>
                        <span className='course-item-meta'>
                          <Icon name='users' size='mini' /> {course.users} users
                        </span>
                      </div>
                      <div className='course-item-progress'>
                        <div className='progress-bar-sm'>
                          <div className='progress-fill' style={{ width: `${course.progress}%` }} />
                        </div>
                        <span>{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className='dashboard-card'>
                <div className='card-header'>
                  <h3><Icon name='clock' color='blue' /> Activity Feed</h3>
                </div>
                <div className='card-body'>
                  {activity?.map((item) => (
                    <div key={item.id} className='activity-item'>
                      <div className={`activity-dot ${item.type}`} />
                      <div className='activity-content'>
                        <div className='activity-title'>{item.title}</div>
                        <div className='activity-meta'>
                          {item.course && <span>{item.course}</span>}
                          {item.user && <span>{item.user}</span>}
                          <span className='activity-date'>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='dashboard-right'>

              {/* Quick Actions */}
              <div className='dashboard-card quick-actions-card'>
                <div className='card-header'>
                  <h3><Icon name='bolt' color='orange' /> Quick Actions</h3>
                </div>
                <div className='card-body'>
                  <div className='quick-actions-grid'>
                    <button className='quick-action-btn'>
                      <Icon name='plus circle' color='green' />
                      <span>Create Course</span>
                    </button>
                    <button className='quick-action-btn'>
                      <Icon name='user plus' color='blue' />
                      <span>Add User</span>
                    </button>
                    <button className='quick-action-btn'>
                      <Icon name='upload' color='orange' />
                      <span>Upload Content</span>
                    </button>
                    <button className='quick-action-btn'>
                      <Icon name='chart bar' color='teal' />
                      <span>View Reports</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Team Performance */}
              <div className='dashboard-card'>
                <div className='card-header'>
                  <h3><Icon name='users' color='teal' /> Team Performance</h3>
                </div>
                <div className='card-body'>
                  {stats.teamPerformance?.map((team) => (
                    <div key={team.name} className='team-item'>
                      <div className='team-info'>
                        <span className='team-name'>{team.name}</span>
                        <span className='team-progress-text'>{team.progress}%</span>
                      </div>
                      <div className='progress-bar-sm'>
                        <div className='progress-fill' style={{ width: `${team.progress}%`, background: team.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrollment Summary */}
              <div className='dashboard-card'>
                <div className='card-header'>
                  <h3><Icon name='chart area' color='purple' /> Enrollment Summary</h3>
                </div>
                <div className='card-body'>
                  <div className='enrollment-summary'>
                    <div className='enrollment-stat'>
                      <div className='enrollment-value'>{stats.totalEnrollments || 0}</div>
                      <div className='enrollment-label'>Total Enrollments</div>
                    </div>
                    <div className='enrollment-stat'>
                      <div className='enrollment-value'>{stats.activeEnrollments || 0}</div>
                      <div className='enrollment-label'>Active</div>
                    </div>
                    <div className='enrollment-stat'>
                      <div className='enrollment-value'>{stats.completedEnrollments || 0}</div>
                      <div className='enrollment-label'>Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
