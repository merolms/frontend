import React from 'react';
import { useSelector } from 'react-redux';
import { ArrowUp, BookOpen, Users, Network, ChartLine, Clock, Bolt, UserPlus, Upload, ChartBar } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { mockDashboardStats, mockDashboardActivity } from '@/app/services/dashboardService';

const statConfig = [
  { key: 'courses', label: 'Total Courses', icon: BookOpen, bg: 'rgba(34,197,94,0.12)', color: '#15803D' },
  { key: 'users', label: 'Total Users', icon: Users, bg: 'rgba(99,102,241,0.12)', color: '#4338CA' },
  { key: 'teams', label: 'Total Teams', icon: Network, bg: 'rgba(245,158,11,0.12)', color: '#B45309' },
  { key: 'completion', label: 'Avg. Completion', icon: ChartLine, bg: 'rgba(139,92,246,0.12)', color: '#7C3AED' },
];

const Dashboard = () => {
  const user = useSelector((s) => s.auth.user);
  const stats = mockDashboardStats;
  const activity = mockDashboardActivity;

  const statValues = { courses: stats.totalCourses, users: stats.totalUsers, teams: stats.totalTeams, completion: stats.avgCompletion };
  const growthValues = { courses: stats.courseGrowth, users: stats.userGrowth, teams: stats.teamGrowth, completion: stats.completionTrend };

  const s = (token) => `var(--${token})`;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <SideBar />
      <div style={{ flex: 1, marginLeft: 70, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: s('bg-primary') }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', height: 56, borderBottom: `1px solid ${s('border-primary')}`, padding: '0 24px', background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(8px)' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: s('text-primary'), margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: s('text-muted'), margin: 0 }}>Welcome back{user ? `, ${user.firstName}` : ''}! Here's your overview.</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {statConfig.map((st) => (
              <div key={st.key} style={{ borderRadius: 12, border: `1px solid ${s('border-primary')}`, background: s('bg-surface'), padding: 16, boxShadow: s('shadow-sm') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: st.bg }}>
                    <st.icon size={20} style={{ color: st.color }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: s('text-primary') }}>{statValues[st.key]}</div>
                    <div style={{ fontSize: 12, color: s('text-muted') }}>{st.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#15803D', marginTop: 2 }}>
                      <ArrowUp size={10} /><span>{growthValues[st.key]}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Recent Courses */}
              <div style={{ borderRadius: 12, border: `1px solid ${s('border-primary')}`, background: s('bg-surface'), boxShadow: s('shadow-sm') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${s('border-primary')}` }}>
                  <BookOpen size={16} style={{ color: s('primary') }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: s('text-primary'), margin: 0 }}>Recent Courses</h3>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.recentCourses?.map((course) => (
                    <div key={course.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, padding: 8 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 500, color: s('text-primary'), margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</h4>
                        <span style={{ fontSize: 11, color: s('text-muted') }}>{course.users} users</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 80, height: 6, borderRadius: 3, background: s('bg-secondary'), overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 3, width: `${course.progress}%`, background: s('primary') }} />
                        </div>
                        <span style={{ fontSize: 11, color: s('text-muted'), width: 32, textAlign: 'right' }}>{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div style={{ borderRadius: 12, border: `1px solid ${s('border-primary')}`, background: s('bg-surface'), boxShadow: s('shadow-sm') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${s('border-primary')}` }}>
                  <Clock size={16} style={{ color: s('accent') }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: s('text-primary'), margin: 0 }}>Activity Feed</h3>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activity?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ marginTop: 6, width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: item.type === 'enroll' ? '#22C55E' : item.type === 'complete' ? '#6366F1' : '#F59E0B' }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: s('text-primary') }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: s('text-muted'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {[item.course, item.user, item.date].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Quick Actions */}
              <div style={{ borderRadius: 12, border: `1px solid ${s('border-primary')}`, background: s('bg-surface'), boxShadow: s('shadow-sm') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${s('border-primary')}` }}>
                  <Bolt size={16} style={{ color: s('warning') }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: s('text-primary'), margin: 0 }}>Quick Actions</h3>
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { icon: UserPlus, label: 'Add User', color: s('accent') },
                    { icon: Upload, label: 'Upload', color: s('warning') },
                    { icon: ChartBar, label: 'Reports', color: s('accent') },
                  ].map((action) => (
                    <button key={action.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderRadius: 8, border: `1px solid ${s('border-primary')}`, padding: 12, fontSize: 11, color: s('text-secondary'), background: 'transparent', cursor: 'pointer' }}>
                      <action.icon size={14} style={{ color: action.color }} />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enrollment Summary */}
              <div style={{ borderRadius: 12, border: `1px solid ${s('border-primary')}`, background: s('bg-surface'), boxShadow: s('shadow-sm') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${s('border-primary')}` }}>
                  <ChartLine size={16} style={{ color: s('secondary') }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: s('text-primary'), margin: 0 }}>Enrollment Summary</h3>
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
                  {[
                    { value: stats.totalEnrollments || 0, label: 'Total' },
                    { value: stats.activeEnrollments || 0, label: 'Active' },
                    { value: stats.completedEnrollments || 0, label: 'Completed' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: s('text-primary') }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: s('text-muted') }}>{item.label}</div>
                    </div>
                  ))}
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
