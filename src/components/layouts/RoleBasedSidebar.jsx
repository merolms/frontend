import { GraduationCap, LogOut, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import RoleBadge from "@/components/common/RoleBadge";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/redux/slices/authSlice";
import { getUserNavItems } from "@/utils/navConfig";

/**
 * RoleBasedSidebar — Modern icon-only sidebar with enhanced UX.
 * Features glassmorphism, smooth animations, and beautiful hover states.
 */
const RoleBasedSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

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
    <div className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl border-r border-border/50 shadow-2xl">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <Link
          to="/"
          aria-label="MeroEdu Dashboard"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
          title="MeroEdu"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <GraduationCap
            size={22}
            className="relative z-10 text-primary transition-all duration-300 group-hover:text-primary/80 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                aria-label={item.label}
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300",
                  active
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "text-muted-foreground hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:text-foreground hover:scale-105 hover:shadow-md hover:shadow-black/5"
                )}
              >
                <Icon size={20} className="relative z-10 transition-transform duration-300" />
                
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
        {/* Role indicator */}
        {user?.role && (
          <div className="flex justify-center pb-3">
            <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 px-3 py-1.5 shadow-sm transition-all duration-300 hover:shadow-md">
              <RoleBadge role={user.role} size="sm" />
            </div>
          </div>
        )}

        {user && (
          <div className="flex flex-col gap-1.5">
            {/* User avatar */}
            <button
              onClick={() => navigate("/profile")}
              className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/15"
              title={`${user.firstName} ${user.lastName}`}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="relative z-10 h-9 w-9 rounded-full object-cover ring-2 ring-border/30 transition-all duration-300 group-hover:ring-primary/50"
                />
              ) : (
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-semibold text-primary-foreground ring-2 ring-border/30 transition-all duration-300 group-hover:ring-primary/50">
                  {user.firstName?.[0] || "U"}
                </div>
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={() => navigate("/settings")}
              aria-label="Settings"
              title="Settings"
              className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:text-foreground hover:shadow-md"
            >
              <Settings size={18} className="transition-transform duration-300 group-hover:rotate-90" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-all duration-300 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-primary/5 group-hover:opacity-100" />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              aria-label="Sign Out"
              title="Sign Out"
              className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-red-500/10 hover:to-red-500/5 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/10"
            >
              <LogOut size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 via-red-500/0 to-red-500/0 opacity-0 transition-all duration-300 group-hover:from-red-500/10 group-hover:via-red-500/0 group-hover:to-red-500/10 group-hover:opacity-100" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedSidebar;
