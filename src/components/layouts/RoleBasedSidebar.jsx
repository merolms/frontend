import { GraduationCap, LogOut, Settings, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import RoleBadge from "@/components/common/RoleBadge";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/redux/slices/authSlice";
import { getUserNavItems } from "@/utils/navConfig";
import { useSidebar } from "@/contexts/SidebarContext";

/**
 * RoleBasedSidebar — Modern expandable/collapsible sidebar with enhanced UX.
 * Features glassmorphism, smooth animations, and beautiful hover states.
 */
const RoleBasedSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();

  const navItems = getUserNavItems(user);
  const currentPath = location.pathname;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return currentPath === "/";
    return (
      currentPath === path ||
      currentPath.startsWith(path + "/") ||
      currentPath.startsWith(path + "?")
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <div 
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-all duration-300 ease-in-out",
          // Mobile: hidden by default, shown when open
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Width transitions
          isExpanded ? "w-64" : "w-16"
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-transparent px-3">
        <Link
          to="/"
          aria-label="MeroEdu Dashboard"
          className="group relative flex items-center gap-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          title="MeroEdu"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <GraduationCap
              size={22}
              className="relative z-10 text-primary transition-all duration-300 group-hover:text-primary/80 group-hover:scale-105"
            />
          </div>
          {isExpanded && (
            <span className="text-sm font-semibold text-primary transition-all duration-300">
              MeroEdu
            </span>
          )}
        </Link>
        
        <div className="flex items-center gap-2">
          {/* Desktop toggle button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground hover:shadow-md"
          >
            {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground hover:shadow-md"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl transition-all duration-300",
                  active
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:text-foreground hover:shadow-md hover:shadow-black/5"
                )}
              >
                <div className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300",
                  active ? "scale-105" : "group-hover:scale-105"
                )}>
                  <Icon size={20} className="relative z-10 transition-transform duration-300" />
                </div>
                
                {isExpanded && (
                  <span className={cn(
                    "text-sm font-medium transition-all duration-300",
                    active ? "text-primary-foreground" : "group-hover:text-foreground"
                  )}>
                    {item.label}
                  </span>
                )}
                
                {/* Active state indicator */}
                {active && (
                  <span className="absolute -left-2 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary/80 via-primary to-primary/80 shadow-lg shadow-primary/30" />
                )}
                
                {/* Hover glow effect */}
                {!active && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-all duration-300 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 group-hover:opacity-100" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border/30 bg-gradient-to-t from-background via-background/95 to-transparent p-3">
        {user && (
          <div className="flex flex-col gap-2">
            {/* User avatar */}
            <button
              onClick={() => navigate("/profile")}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/15",
                isExpanded ? "px-2 py-2 w-full" : "mx-auto h-10 w-10 justify-center"
              )}
              title={`${user.firstName} ${user.lastName}`}
            >
              {user.avatar ? (
                <>
                  <div className="relative flex h-9 w-9 items-center justify-center">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="relative z-10 h-9 w-9 rounded-full object-cover ring-2 ring-border/30 transition-all duration-300 group-hover:ring-primary/50"
                    />
                    {/* Role badge */}
                    {user?.role && (
                      <div className="absolute -bottom-1 -right-1 z-20">
                        <RoleBadge role={user.role} size="xs" />
                      </div>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground transition-all duration-300">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground transition-all duration-300">
                        View Profile
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="relative flex h-9 w-9 items-center justify-center">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-semibold text-primary-foreground ring-2 ring-border/30 transition-all duration-300 group-hover:ring-primary/50">
                      {user.firstName?.[0] || "U"}
                    </div>
                    {/* Role badge */}
                    {user?.role && (
                      <div className="absolute -bottom-1 -right-1 z-20">
                        <RoleBadge role={user.role} size="xs" />
                      </div>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground transition-all duration-300">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground transition-all duration-300">
                        View Profile
                      </span>
                    </div>
                  )}
                </>
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={() => navigate("/settings")}
              aria-label="Settings"
              className={cn(
                "group relative flex items-center gap-3 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:text-foreground hover:shadow-md",
                isExpanded ? "px-3 py-2 w-full justify-start" : "mx-auto h-10 w-10 justify-center"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <Settings size={18} className="transition-transform duration-300 group-hover:rotate-90" />
              </div>
              {isExpanded && (
                <span className="text-sm font-medium transition-all duration-300">
                  Settings
                </span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-all duration-300 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-primary/5 group-hover:opacity-100" />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              aria-label="Sign Out"
              className={cn(
                "group relative flex items-center gap-3 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-gradient-to-br hover:from-red-500/10 hover:to-red-500/5 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/10",
                isExpanded ? "px-3 py-2 w-full justify-start" : "mx-auto h-10 w-10 justify-center"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <LogOut size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
              {isExpanded && (
                <span className="text-sm font-medium transition-all duration-300">
                  Sign Out
                </span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 via-red-500/0 to-red-500/0 opacity-0 transition-all duration-300 group-hover:from-red-500/10 group-hover:via-red-500/0 group-hover:to-red-500/10 group-hover:opacity-100" />
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default RoleBasedSidebar;
