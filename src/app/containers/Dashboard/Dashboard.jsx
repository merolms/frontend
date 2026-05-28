import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { SimpleGrid, Paper, Text, Stack, Group, Box, Progress, Button } from '@mantine/core';
import { IconBook, IconUsers, IconSitemap, IconChartLine, IconArrowUp, IconClock, IconBolt, IconUserPlus, IconUpload, IconChartBar, IconCheck, IconRobot } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { mockDashboardStats, mockDashboardActivity } from '@/app/services/dashboardService';
import './Dashboard.scss';

const statIcons = {
  green: IconBook, teal: IconUsers, orange: IconSitemap, purple: IconChartLine,
};
const statColors = { green: 'green', teal: 'teal', orange: 'orange', purple: 'violet' };

const Dashboard = () => {
  const user = useSelector((s) => s.auth.user);
  const stats = mockDashboardStats;
  const activity = mockDashboardActivity;

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className="dashboard-main">
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Dashboard</h1>
            <p className='page-subtitle'>Welcome back{user ? `, ${user.firstName}` : ''}! Here's your overview.</p>
          </div>
        </div>

        <div className='dashboard-content'>
          <SimpleGrid cols={4} mb="md" className="stats-row">
            {[
              { label: 'Total Courses', value: stats.totalCourses, color: 'green', growth: stats.courseGrowth },
              { label: 'Total Users', value: stats.totalUsers, color: 'teal', growth: stats.userGrowth },
              { label: 'Total Teams', value: stats.totalTeams, color: 'orange', growth: stats.teamGrowth },
              { label: 'Avg. Completion', value: stats.avgCompletion, color: 'purple', growth: stats.completionTrend },
            ].map((s) => (
              <Paper key={s.label} className='stat-card' p="md" radius="md" withBorder>
                <div className='stat-card-inner'>
                  <Box className={`stat-icon ${s.color}`}>
                    {React.createElement(statIcons[s.color], { size: 24 })}
                  </Box>
                  <div className='stat-info'>
                    <Text className='stat-value' size="xl" fw={700}>{s.value}</Text>
                    <Text className='stat-label' size="sm" c="dimmed">{s.label}</Text>
                    <Text className='stat-trend up' size="xs" c="green"><IconArrowUp size={12} /> {s.growth}</Text>
                  </div>
                </div>
              </Paper>
            ))}
          </SimpleGrid>

          <div className='dashboard-columns'>
            <div className='dashboard-left'>
              <Paper className='dashboard-card' p="md" radius="md" withBorder mb="md">
                <div className='card-header'><h3><IconBook size={16} color='#33a163' /> Recent Courses</h3></div>
                <div className='card-body'>
                  {stats.recentCourses?.map((course) => (
                    <div key={course.id} className='course-item'>
                      <div className='course-item-info'><h4>{course.title}</h4><span className='course-item-meta'><IconUsers size={12} /> {course.users} users</span></div>
                      <div className='course-item-progress'>
                        <Progress value={course.progress} size="sm" radius="xl" style={{ width: 80 }} />
                        <span>{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Paper>

              <Paper className='dashboard-card' p="md" radius="md" withBorder>
                <div className='card-header'><h3><IconClock size={16} color='#2185d0' /> Activity Feed</h3></div>
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
              </Paper>
            </div>

            <div className='dashboard-right'>
              <Paper className='dashboard-card quick-actions-card' p="md" radius="md" withBorder mb="md">
                <div className='card-header'><h3><IconBolt size={16} color="#f0a500" /> Quick Actions</h3></div>
                <div className='card-body'>
                  <div className='quick-actions-grid'>
                    {/* <button className='quick-action-btn'><IconPlus size={16} color="#33a163" /><span>Create Course</span></button> */}
                    <button className='quick-action-btn'><IconUserPlus size={16} color="#2185d0" /><span>Add User</span></button>
                    <button className='quick-action-btn'><IconUpload size={16} color="#f0a500" /><span>Upload Content</span></button>
                    <button className='quick-action-btn'><IconChartBar size={16} color="#00838f" /><span>View Reports</span></button>
                  </div>
                </div>
              </Paper>

              <Paper className='dashboard-card' p="md" radius="md" withBorder mb="md">
                <div className='card-header'><h3><IconUsers size={16} color="#00838f" /> Team Performance</h3></div>
                <div className='card-body'>
                  {stats.teamPerformance?.map((team) => (
                    <div key={team.name} className='team-item'>
                      <div className='team-info'><span className='team-name'>{team.name}</span><span className='team-progress-text'>{team.progress}%</span></div>
                      <Progress value={team.progress} size="sm" radius="xl" color={team.color} />
                    </div>
                  ))}
                </div>
              </Paper>

              <Paper className='dashboard-card' p="md" radius="md" withBorder>
                <div className='card-header'><h3><IconChartLine size={16} color="#9c27b0" /> Enrollment Summary</h3></div>
                <div className='card-body'>
                  <div className='enrollment-summary'>
                    <div className='enrollment-stat'><div className='enrollment-value'>{stats.totalEnrollments || 0}</div><div className='enrollment-label'>Total Enrollments</div></div>
                    <div className='enrollment-stat'><div className='enrollment-value'>{stats.activeEnrollments || 0}</div><div className='enrollment-label'>Active</div></div>
                    <div className='enrollment-stat'><div className='enrollment-value'>{stats.completedEnrollments || 0}</div><div className='enrollment-label'>Completed</div></div>
                  </div>
                </div>
              </Paper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
