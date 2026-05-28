import React from 'react';
import { NavLink, Stack, Divider, Button, Group, Text } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, GraduationCap, Hash, Home, LogOut, MessageCircle, Settings, Shield, Network, Tags, User, Users } from 'lucide-react';
import SideBarItem from '@/app/containers/SideBar/SideBarItem/SideBarItem';
import UserProfileInfo from '@/app/components/UserProfileInfo';
import { logoutUser } from '@/redux/slices/authSlice';
import './SideBar.scss';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'home' },
  { path: '/courses', label: 'Courses', icon: 'book' },
  { path: '/categories', label: 'Categories', icon: 'tags' },
  { path: '/users', label: 'Users', icon: 'users' },
  { path: '/teams', label: 'Teams', icon: 'sitemap' },
  { path: '/my-learning', label: 'Learning', icon: 'graduation-cap' },
  { path: '/chat', label: 'AI Chat', icon: 'comments' },
  { path: '/slack', label: 'Team Chat', icon: 'hashtag' },
  { path: '/profile', label: 'Profile', icon: 'id-card' },
  { path: '/settings', label: 'Settings', icon: 'cog' },
  { path: '/roles', label: 'Roles', icon: 'shield' },
];

const iconMap = {
  home: Home, book: BookOpen, tags: Tags, users: Users, sitemap: Network,
  'graduation-cap': BookOpen, comments: MessageCircle, hashtag: Hash,
  'id-card': User, cog: Settings, shield: Shield,
};

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const currentPath = location.pathname;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className='sidebar-wrapper'>
      <div className='sidebar-header'>
        <div className='sidebar-brand'>
          <GraduationCap className='brand-icon' />
        </div>
      </div>

      <div className='sidebar-nav'>
        <Stack gap={2} className='side-menu'>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || Home;
            const isActive = item.path === '/' ? currentPath === '/' : currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <SideBarItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                IconComponent={Icon}
                active={isActive}
              />
            );
          })}
        </Stack>
      </div>

      <div className='sidebar-footer'>
        {user && (
          <>
            <div className='sidebar-profile-card' onClick={() => navigate('/profile')} role='button' title='View profile'>
              <UserProfileInfo
                image={user.avatar}
                primaryText={`${user.firstName} ${user.lastName}`}
                secondaryText={user.role}
              />
            </div>
            <button className='sidebar-logout-btn' onClick={handleLogout} title='Sign Out'>
              <LogOut />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
