import React, { useState } from 'react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { MenuIcon, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '@/redux/slices/authSlice';

export default function DashboardLayout({ children, title, subtitle }) {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const pageTitle = title || getPageTitle(location.pathname);

  return (
    <div className="dashboard-layout">
      <SideBar />
      <div className="dashboard-main">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-bg-surface/90 backdrop-blur-sm px-6">
          <div>
            <h1 className="page-title">{pageTitle}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
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
  return 'MeroEdu';
}
