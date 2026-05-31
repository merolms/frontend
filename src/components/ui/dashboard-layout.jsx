import React, { useState, useEffect, useRef, useCallback } from 'react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { Bell, LogOut, Check, CheckCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '@/redux/slices/authSlice';
import { fetchNotifications, markAsRead, markAllAsRead, getTimeAgo } from '@/app/services/notificationService';

const typeColors = {
  enrollment: '#22C55E',
  course: '#6366F1',
  team: '#F59E0B',
  completion: '#8B5CF6',
  system: '#64748B',
};

export default function DashboardLayout({ children, title, subtitle }) {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      setLoadingNotifs(true);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && bellRef.current && !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { dispatch(logoutUser()); navigate('/login'); };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) loadNotifications();
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const pageTitle = title || getPageTitle(location.pathname);

  return (
    <div className="dashboard-layout">
      <SideBar />
      <div className="dashboard-main">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-bg-surface/90 backdrop-blur-sm px-6">
          {/* Left: page title */}
          <div>
            <h1 className="page-title">{pageTitle}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>

          {/* Right: notifications + user */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={handleBellClick}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error text-white text-[10px] font-bold px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showDropdown && (
                <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-bg-surface shadow-lg overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-surface-hover/50">
                    <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary cursor-pointer">
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifs ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-text-muted">No notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-bg-surface-hover transition-colors cursor-pointer ${!notif.read ? 'bg-bg-surface-active/30' : ''}`}
                          onClick={() => handleMarkRead(notif.id, { stopPropagation: () => {} })}
                        >
                          {/* Type indicator */}
                          <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ background: typeColors[notif.type] || '#64748B' }} />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-semibold line-clamp-1 ${!notif.read ? 'text-text-primary' : 'text-text-secondary'}`}>{notif.title}</p>
                              {!notif.read && (
                                <button
                                  onClick={(e) => handleMarkRead(notif.id, e)}
                                  className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded hover:bg-bg-surface-active cursor-pointer text-text-muted hover:text-primary"
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-text-muted mt-1">{getTimeAgo(notif.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-border bg-bg-surface-hover/50 text-center">
                      <button className="text-xs text-primary hover:underline cursor-pointer" onClick={() => setShowDropdown(false)}>
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User avatar */}
            {user && (
              <button onClick={() => navigate('/profile')} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-bg-surface-hover transition-colors cursor-pointer">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.firstName} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white" style={{ background: 'var(--primary)' }}>
                    {user.firstName?.[0] || 'U'}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/courses')) return 'Courses';
  if (pathname.startsWith('/users')) return 'Users';
  if (pathname.startsWith('/teams')) return 'Teams';
  if (pathname.startsWith('/categories')) return 'Categories';
  if (pathname.startsWith('/roles')) return 'Roles';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/my-learning')) return 'My Learning';
  if (pathname.startsWith('/learning-paths')) return 'Learning Paths';
  if (pathname.startsWith('/events')) return 'Events';
  return 'MeroEdu';
}
