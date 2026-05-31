import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  Settings,
  Shield,
  Network,
  Tags,
  Users,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { logoutUser } from "@/redux/slices/authSlice";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/courses", label: "Courses", icon: BookOpen },
  { path: "/learning-paths", label: "Learning Paths", icon: GraduationCap },
  { path: "/events", label: "Events", icon: CalendarDays },
  { path: "/progress", label: "Progress", icon: BarChart3 },
  { path: "/categories", label: "Categories", icon: Tags },
  { path: "/users", label: "Users", icon: Users },
  { path: "/teams", label: "Teams", icon: Network },
  { path: "/my-learning", label: "My Learning", icon: BookOpen },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/roles", label: "Roles", icon: Shield },
];

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const currentPath = location.pathname;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return currentPath === "/";
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <div className="sidebar-wrapper">
      <div
        className="flex h-14 items-center justify-center border-b"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <Link
          to="/"
          className="group flex h-10 w-10 items-center justify-center rounded-lg"
          title="MeroEdu — Dashboard"
        >
          <GraduationCap
            size={24}
            className="text-primary group-hover:text-primary-hover transition-colors"
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`group mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${active ? "bg-primary text-white" : "text-text-muted hover:bg-bg-surface-hover hover:text-text-primary"}`}
              >
                <Icon size={18} />
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t p-2" style={{ borderColor: "var(--border-primary)" }}>
        {user && (
          <>
            <button
              onClick={() => navigate("/profile")}
              className="hover:bg-bg-surface-hover flex w-full items-center gap-2 rounded-lg p-2 transition-colors"
              title={`${user.firstName} ${user.lastName}`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
                  style={{ background: "var(--primary)" }}
                >
                  {user.firstName?.[0] || "U"}
                </div>
              )}
            </button>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="text-text-muted mx-auto mt-1 flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                e.currentTarget.style.color = "var(--error)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
