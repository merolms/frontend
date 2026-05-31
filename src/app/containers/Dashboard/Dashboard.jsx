import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Users, Network, ChartLine, Clock, Bolt, UserPlus, Upload, ChartBar, Folder, CalendarDays, MapPin, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { fetchDashboardStats } from '@/app/services/dashboardService';
import { fetchUpcomingEvents, formatEventDate, formatEventTime } from '@/app/services/eventService';

const statConfig = [
  { key: 'totalCourses', label: 'Total Courses', icon: BookOpen, bg: 'rgba(34,197,94,0.12)', color: '#15803D' },
  { key: 'totalUsers', label: 'Total Users', icon: Users, bg: 'rgba(99,102,241,0.12)', color: '#4338CA' },
  { key: 'totalTeams', label: 'Total Teams', icon: Network, bg: 'rgba(245,158,11,0.12)', color: '#B45309' },
  { key: 'totalCategories', label: 'Categories', icon: Folder, bg: 'rgba(139,92,246,0.12)', color: '#7C3AED' },
];

const Dashboard = () => {
  const user = useSelector((s) => s.auth.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    load();

    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        const data = await fetchUpcomingEvents(4);
        setUpcomingEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setEventsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back${user ? `, ${user.firstName}` : ''}! Here's your overview.`}
    >
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2.5 text-sm text-error mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {statConfig.map((st) => (
          <div key={st.key} className="rounded-lg border border-border bg-bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg" style={{ background: st.bg }}>
                <st.icon size={20} style={{ color: st.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {loading ? '—' : formatNumber(stats?.[st.key] ?? 0)}
                </div>
                <div className="text-xs text-text-muted">{st.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="col-span-2 rounded-lg border border-border bg-bg-surface shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Clock size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Activity Feed</h3>
          </div>
          <div className="p-4">
            <div className="text-sm text-text-muted text-center py-8">No recent activity</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-bg-surface shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Bolt size={16} className="text-warning" />
              <h3 className="text-sm font-semibold text-text-primary">Quick Actions</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
              {[
                { icon: UserPlus, label: 'Add User' },
                { icon: Upload, label: 'Upload' },
                { icon: ChartBar, label: 'Reports' },
              ].map((action) => (
                <button key={action.label} className="flex flex-col items-center gap-1.5 rounded-lg border border-border py-3 text-[11px] text-text-secondary hover:bg-bg-surface-active cursor-pointer">
                  <action.icon size={14} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-bg-surface shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <ChartLine size={16} className="text-secondary" />
              <h3 className="text-sm font-semibold text-text-primary">Summary</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {loading ? (
                <div className="text-sm text-text-muted text-center">Loading...</div>
              ) : stats ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Users per Team</span>
                    <span className="font-semibold text-text-primary">{stats.totalTeams > 0 ? Math.round(stats.totalUsers / stats.totalTeams) : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Courses per Category</span>
                    <span className="font-semibold text-text-primary">{stats.totalCategories > 0 ? Math.round(stats.totalCourses / stats.totalCategories) : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Total Teams</span>
                    <span className="font-semibold text-text-primary">{stats.totalTeams}</span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-text-muted text-center">No data available</div>
              )}
            </div>
          </div>
          {/* Upcoming Events */}
          <div className="rounded-lg border border-border bg-bg-surface shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Upcoming Events</h3>
              </div>
              <button onClick={() => window.location.href = '/events'} className="text-[11px] text-primary hover:underline cursor-pointer">View all</button>
            </div>
            <div className="p-3 space-y-2">
              {eventsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-bg-surface-active rounded animate-pulse" />)}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-surface-hover transition-colors cursor-pointer group" onClick={() => window.location.href = `/events/${event.id}`}>
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg flex-shrink-0" style={{ background: `${event.color}15` }}>
                      <CalendarDays size={16} style={{ color: event.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary line-clamp-1">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                        <span>{formatEventDate(event.startDate)}</span>
                        <span>·</span>
                        <span>{formatEventTime(event.startDate)}</span>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-text-muted group-hover:text-primary flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
