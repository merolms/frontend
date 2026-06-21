import { Bell, Check, CheckCheck, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import {
  fetchNotifications,
  getTimeAgo,
  markAllAsRead,
  markAsRead,
} from "@/app/services/notificationService";
import RoleBasedSidebar from "@/components/layouts/RoleBasedSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

const typeColors = {
  enrollment: "#22C55E",
  course: "#6366F1",
  team: "#F59E0B",
  completion: "#8B5CF6",
  system: "#64748B",
};

export default function DashboardLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();

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

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showDropdown) {
        setShowDropdown(false);
        bellRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showDropdown]);

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
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <RoleBasedSidebar />
      
      {/* Main content area */}
      <main
        onClick={() => isMobileOpen && setIsMobileOpen(false)}
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          "lg:ml-16", // Base margin for collapsed sidebar
          isExpanded && "lg:ml-64" // Expanded margin
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/30 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: mobile menu toggle + page title */}
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Page title */}
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground sm:text-2xl">
                  {pageTitle}
                </h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right: notifications + theme switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification bell */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={handleBellClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleBellClick();
                    }
                  }}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                  className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground hover:shadow-md"
                >
                  <Bell size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    role="menu"
                    aria-label="Notifications"
                    className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-background to-background/95 shadow-2xl backdrop-blur-xl"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/30 bg-gradient-to-r from-accent/30 via-transparent to-transparent px-4 py-3">
                      <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="flex cursor-pointer items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-primary"
                        >
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
                      {loadingNotifs ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            role="menuitem"
                            tabIndex={0}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 border-b border-border/20 px-4 py-3 transition-all duration-200 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                              !notif.read && "bg-primary/5"
                            )}
                            onClick={() => handleMarkRead(notif.id, { stopPropagation: () => {} })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleMarkRead(notif.id, { stopPropagation: () => {} });
                              }
                            }}
                          >
                            {/* Type indicator */}
                            <div
                              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full shadow-sm"
                              style={{ background: typeColors[notif.type] || "#64748B" }}
                            />

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p
                                  className={cn(
                                    "line-clamp-1 text-xs font-semibold",
                                    !notif.read ? "text-foreground" : "text-muted-foreground"
                                  )}
                                >
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <button
                                    onClick={(e) => handleMarkRead(notif.id, e)}
                                    className="flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                    title="Mark as read"
                                  >
                                    <Check size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                                {notif.message}
                              </p>
                              <p className="mt-1 text-[10px] text-muted-foreground/70">
                                {getTimeAgo(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="border-t border-border/30 bg-gradient-to-r from-accent/20 via-transparent to-accent/20 px-4 py-2.5 text-center">
                        <button
                          className="text-xs text-primary transition-colors hover:text-primary/80 hover:underline"
                          onClick={() => setShowDropdown(false)}
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme switcher */}
              <div className="flex h-9 w-9 items-center justify-center">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </div>
      </main>
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
