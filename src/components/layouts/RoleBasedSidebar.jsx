import { GraduationCap, LogOut, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import RoleBadge from "@/components/common/RoleBadge";
import { logoutUser } from "@/redux/slices/authSlice";
import { getUserNavItems } from "@/utils/navConfig";

/**
 * RoleBasedSidebar — Icon-only sidebar with hover tooltips.
 * Shows icons only; label appears as tooltip on hover.
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
    <div className="sidebar-wrapper">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link
          to="/"
          aria-label="MeroEdu Dashboard"
          className="group flex h-10 w-10 items-center justify-center rounded-lg"
          title="MeroEdu"
        >
          <GraduationCap
            size={24}
            className="text-primary group-hover:text-primary-hover transition-colors"
          />
        </Link>
      </div>

      {/* Navigation — icon only with hover tooltip */}
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
                aria-label={item.label}
                className={active ? "sidebar-nav-item-active" : "sidebar-nav-item"}
              >
                <Icon size={18} />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div
        className="flex flex-col items-center gap-1 border-t p-2"
        style={{ borderColor: "var(--border-primary)" }}
      >
        {/* Role indicator */}
        {user?.role && (
          <div className="flex justify-center px-3 py-2">
            <RoleBadge role={user.role} size="sm" />
          </div>
        )}

        {user && (
          <>
            <button
              onClick={() => navigate("/profile")}
              className="sidebar-user-btn"
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
              onClick={() => navigate("/settings")}
              aria-label="Settings"
              title="Settings"
              className="sidebar-nav-item"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={handleLogout}
              aria-label="Sign Out"
              title="Sign Out"
              className="sidebar-signout-btn"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleBasedSidebar;
