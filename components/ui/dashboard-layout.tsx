import { Bell, Check, CheckCheck, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import RoleBasedSidebar from "@/components/layouts/RoleBasedSidebar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  getTimeAgo,
  markAllAsRead,
  markAsRead,
} from "@/services/notificationService";

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
    <div className="from-background via-background to-background/95 flex min-h-screen bg-gradient-to-br">
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
        <header className="border-border/30 from-background via-background/95 to-background sticky top-0 z-30 border-b bg-gradient-to-r shadow-sm backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: mobile menu toggle + page title */}
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-10 w-10 items-center justify-center rounded-lg transition-all lg:hidden"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Page title */}
              <div className="flex flex-col">
                <h1 className="text-foreground text-lg font-semibold sm:text-2xl">{pageTitle}</h1>
                {subtitle && <p className="text-muted-foreground text-xs sm:text-sm">{subtitle}</p>}
              </div>
            </div>

            {/* Right: notifications + theme switcher */}
            <div className="flex items-center gap-3">
              <ThemeSwitcher />

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
                  className="group text-muted-foreground hover:bg-accent hover:text-foreground relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:shadow-md"
                >
                  <Bell
                    size={18}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
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
                    className="border-border/50 from-background to-background/95 absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-gradient-to-b shadow-2xl backdrop-blur-xl"
                  >
                    {/* Header */}
                    <div className="border-border/30 from-accent/30 flex items-center justify-between border-b bg-gradient-to-r via-transparent to-transparent px-4 py-3">
                      <h3 className="text-foreground text-sm font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-muted-foreground hover:text-primary flex cursor-pointer items-center gap-1 text-[11px] transition-colors"
                        >
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    <div className="scrollbar-thumb-border/20 max-h-80 scrollbar-thin scrollbar-track-transparent overflow-y-auto">
                      {loadingNotifs ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            role="menuitem"
                            tabIndex={0}
                            className={cn(
                              "border-border/20 hover:bg-accent/50 focus-visible:ring-primary/50 flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none",
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
                                    className="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px]">
                                {notif.message}
                              </p>
                              <p className="text-muted-foreground/70 mt-1 text-[10px]">
                                {getTimeAgo(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="border-border/30 from-accent/20 to-accent/20 border-t bg-gradient-to-r via-transparent px-4 py-2.5 text-center">
                        <button
                          className="text-primary hover:text-primary/80 text-xs transition-colors hover:underline"
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
