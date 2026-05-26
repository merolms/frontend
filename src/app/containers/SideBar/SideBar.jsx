import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import SideBarItem from '@/app/containers/SideBar/SideBarItem/SideBarItem';
import UserProfileInfo from '@/app/components/UserProfileInfo';
import './SideBar.scss';
import { logoutUser } from '@/redux/slices/authSlice';

export default function SideBar({ sidebarOpen, onToggle }) {
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
    <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className='sidebar-header'>
        <div className='sidebar-brand'>
          <Icon name='graduation cap' size='large' className='brand-icon' />
          <span className='brand-text'>MeroEdu</span>
        </div>
        <button
          className='sidebar-toggle'
          onClick={() => onToggle?.(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Icon name={sidebarOpen ? 'angle double left' : 'angle double right'} />
        </button>
      </div>

      <div className='sidebar-nav'>
        <div className='sidebar-section-title'>Main Menu</div>
        <Menu className='side-menu'>
          <SideBarItem path='/' label='Dashboard' icon='home' active={currentPath === '/'} />
          <SideBarItem path='/courses' label='Courses' icon='book' active={currentPath === '/courses' || currentPath.startsWith('/courses/')} />
          <SideBarItem path='/categories' label='Categories' icon='tags' active={currentPath === '/categories'} />
          <SideBarItem path='/users' label='Users' icon='users' active={currentPath === '/users' || currentPath.startsWith('/users/')} />
          <SideBarItem path='/teams' label='Teams' icon='sitemap' active={currentPath === '/teams' || currentPath.startsWith('/teams/')} />
          <SideBarItem path='/my-learning' label='My Learning' icon='graduation cap' active={currentPath === '/my-learning'} />
          <SideBarItem path='/chat' label='AI Chat' icon='comments' active={currentPath === '/chat'} />
          <SideBarItem path='/profile' label='My Profile' icon='id card' active={currentPath === '/profile'} />
          <SideBarItem path='/settings' label='Settings' icon='cog' active={currentPath === '/settings'} />
        </Menu>

        <div className='sidebar-divider' />

        <div className='sidebar-section-title'>Administration</div>
        <Menu className='side-menu side-menu-secondary'>
          <SideBarItem path='/roles' label='Roles & Permissions' icon='shield' active={currentPath === '/roles' || currentPath.startsWith('/roles/')} />
        </Menu>
      </div>

      <div className='sidebar-footer'>
        {user && (
          <div className='sidebar-profile-card' onClick={() => navigate('/profile')} role='button' title='View profile'>
            <UserProfileInfo
              image={user.avatar}
              primaryText={`${user.firstName} ${user.lastName}`}
              secondaryText={user.role}
            />
          </div>
        )}
        <div className='sidebar-footer-actions'>
          <button className='sidebar-footer-btn' onClick={() => navigate('/settings')} title='Settings'>
            <Icon name='cog' />
          </button>
          <button className='sidebar-footer-btn' onClick={handleLogout} title='Sign Out'>
            <Icon name='sign out' />
          </button>
        </div>
      </div>
    </div>
  );
}
