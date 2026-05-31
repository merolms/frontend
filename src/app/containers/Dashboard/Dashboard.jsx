import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  BookOpen,
  Users,
  Network,
  ChartLine,
  Clock,
  Bolt,
  UserPlus,
  Upload,
  ChartBar,
  Folder,
  CalendarDays,
  MapPin,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { fetchDashboardStats } from "@/app/services/dashboardService";
import { fetchUpcomingEvents, formatEventDate, formatEventTime } from "@/app/services/eventService";

const statConfig = [
  {
    key: "totalCourses",
    label: "Total Courses",
    icon: BookOpen,
    bg: "rgba(34,197,94,0.12)",
    color: "#15803D",
  },
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    bg: "rgba(99,102,241,0.12)",
    color: "#4338CA",
  },
  {
    key: "totalTeams",
    label: "Total Teams",
    icon: Network,
    bg: "rgba(245,158,11,0.12)",
    color: "#B45309",
  },
  {
    key: "totalCategories",
    label: "Categories",
    icon: Folder,
    bg: "rgba(139,92,246,0.12)",
    color: "#7C3AED",
  },
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
        setError("Failed to load dashboard stats.");
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
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back${user ? `, ${user.firstName}` : ""}! Here's your overview.`}
    >
      {error && (
        <div className="border-error/30 bg-error/5 text-error mb-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        {statConfig.map((st) => (
          <div key={st.key} className="border-border bg-bg-surface rounded-lg border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: st.bg }}
              >
                <st.icon size={20} style={{ color: st.color }} />
              </div>
              <div>
                <div className="text-text-primary text-2xl font-bold">
                  {loading ? "—" : formatNumber(stats?.[st.key] ?? 0)}
                </div>
                <div className="text-text-muted text-xs">{st.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="border-border bg-bg-surface col-span-2 rounded-lg border shadow-sm">
          <div className="border-border flex items-center gap-2 border-b px-4 py-3">
            <Clock size={16} className="text-accent" />
            <h3 className="text-text-primary text-sm font-semibold">Activity Feed</h3>
          </div>
          <div className="p-4">
            <div className="text-text-muted py-8 text-center text-sm">No recent activity</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="border-border bg-bg-surface rounded-lg border shadow-sm">
            <div className="border-border flex items-center gap-2 border-b px-4 py-3">
              <Bolt size={16} className="text-warning" />
              <h3 className="text-text-primary text-sm font-semibold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              {[
                { icon: UserPlus, label: "Add User" },
                { icon: Upload, label: "Upload" },
                { icon: ChartBar, label: "Reports" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="border-border text-text-secondary hover:bg-bg-surface-active flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border py-3 text-[11px]"
                >
                  <action.icon size={14} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-border bg-bg-surface rounded-lg border shadow-sm">
            <div className="border-border flex items-center gap-2 border-b px-4 py-3">
              <ChartLine size={16} className="text-secondary" />
              <h3 className="text-text-primary text-sm font-semibold">Summary</h3>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {loading ? (
                <div className="text-text-muted text-center text-sm">Loading...</div>
              ) : stats ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Users per Team</span>
                    <span className="text-text-primary font-semibold">
                      {stats.totalTeams > 0 ? Math.round(stats.totalUsers / stats.totalTeams) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Courses per Category</span>
                    <span className="text-text-primary font-semibold">
                      {stats.totalCategories > 0
                        ? Math.round(stats.totalCourses / stats.totalCategories)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Total Teams</span>
                    <span className="text-text-primary font-semibold">{stats.totalTeams}</span>
                  </div>
                </>
              ) : (
                <div className="text-text-muted text-center text-sm">No data available</div>
              )}
            </div>
          </div>
          {/* Upcoming Events */}
          <div className="border-border bg-bg-surface rounded-lg border shadow-sm">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <h3 className="text-text-primary text-sm font-semibold">Upcoming Events</h3>
              </div>
              <button
                onClick={() => (window.location.href = "/events")}
                className="text-primary cursor-pointer text-[11px] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2 p-3">
              {eventsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-bg-surface-active h-12 animate-pulse rounded" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-text-muted py-4 text-center text-xs">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="hover:bg-bg-surface-hover group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
                    onClick={() => (window.location.href = `/events/${event.id}`)}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${event.color}15` }}
                    >
                      <CalendarDays size={16} style={{ color: event.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary line-clamp-1 text-xs font-semibold">
                        {event.title}
                      </p>
                      <div className="text-text-muted mt-0.5 flex items-center gap-2 text-[10px]">
                        <span>{formatEventDate(event.startDate)}</span>
                        <span>·</span>
                        <span>{formatEventTime(event.startDate)}</span>
                      </div>
                    </div>
                    <ChevronRight
                      size={12}
                      className="text-text-muted group-hover:text-primary flex-shrink-0"
                    />
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
