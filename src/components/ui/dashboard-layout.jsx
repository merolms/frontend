import { Bell, Check, CheckCheck, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import RoleBasedSidebar from "@/components/layouts/RoleBasedSidebar";
import {
  fetchNotifications,
  getTimeAgo,
  markAllAsRead,
  markAsRead,
} from "@/app/services/notificationService";

const typeColors = {
  enrollment: "#22C55E",
  course: "#6366F1",
  team: "#F59E0B",
  completion: "#8B5CF6",
  system: "#64748B",
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) loadNotifications();
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const pageTitle = title || getPageTitle(location.pathname);

  return (
    <div className="dashboard-layout">
      <RoleBasedSidebar />
      <div className="dashboard-main">
        {/* Top bar */}
        <div className="border-border bg-bg-surface sticky top-0 z-10 flex h-20 items-center justify-between border-b px-6">
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
                className="text-text-muted hover:bg-bg-surface-hover hover:text-text-primary relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="bg-error absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="border-border bg-bg-surface absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border shadow-lg"
                >
                  {/* Header */}
                  <div className="border-border bg-bg-surface-hover flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-text-primary text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-text-muted hover:text-primary flex cursor-pointer items-center gap-1 text-[11px]"
                      >
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifs ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-text-muted py-8 text-center text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`border-border hover:bg-bg-surface-hover flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-colors ${!notif.read ? "bg-bg-surface-active/30" : ""}`}
                          onClick={() => handleMarkRead(notif.id, { stopPropagation: () => {} })}
                        >
                          {/* Type indicator */}
                          <div
                            className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                            style={{ background: typeColors[notif.type] || "#64748B" }}
                          />

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`line-clamp-1 text-xs font-semibold ${!notif.read ? "text-text-primary" : "text-text-secondary"}`}
                              >
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <button
                                  onClick={(e) => handleMarkRead(notif.id, e)}
                                  className="hover:bg-bg-surface-active text-text-muted hover:text-primary flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded"
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </div>
                            <p className="text-text-muted mt-0.5 line-clamp-2 text-[11px]">
                              {notif.message}
                            </p>
                            <p className="text-text-muted mt-1 text-[10px]">
                              {getTimeAgo(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-border bg-bg-surface-hover border-t px-4 py-2.5 text-center">
                      <button
                        className="text-primary cursor-pointer text-xs hover:underline"
                        onClick={() => setShowDropdown(false)}
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}

function getPageTitle(pathname) {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/courses")) return "Courses";
  if (pathname.startsWith("/users")) return "Users";
  if (pathname.startsWith("/teams")) return "Teams";
  if (pathname.startsWith("/categories")) return "Categories";
  if (pathname.startsWith("/roles")) return "Roles";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/my-learning")) return "My Learning";
  if (pathname.startsWith("/learning-paths")) return "Learning Paths";
  if (pathname.startsWith("/events")) return "Events";
  return "MeroEdu";
}
