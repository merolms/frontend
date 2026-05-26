import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SideBarItem from '@/app/containers/SideBar/SideBarItem/SideBarItem';
import UserProfileInfo from '@/app/components/UserProfileInfo';
import { logoutUser } from '@/redux/slices/authSlice';
import './SideBar.scss';

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
          <Icon name='graduation cap' className='brand-icon' />
        </div>
      </div>

      <div className='sidebar-nav'>
        <Menu className='side-menu'>
          <SideBarItem path='/' label='Dashboard' icon='home' active={currentPath === '/'} />
          <SideBarItem path='/courses' label='Courses' icon='book' active={currentPath === '/courses' || currentPath.startsWith('/courses/')} />
          <SideBarItem path='/categories' label='Categories' icon='tags' active={currentPath === '/categories'} />
          <SideBarItem path='/users' label='Users' icon='users' active={currentPath === '/users' || currentPath.startsWith('/users/')} />
          <SideBarItem path='/teams' label='Teams' icon='sitemap' active={currentPath === '/teams' || currentPath.startsWith('/teams/')} />
          <SideBarItem path='/my-learning' label='Learning' icon='graduation cap' active={currentPath === '/my-learning'} />
          <SideBarItem path='/chat' label='AI Chat' icon='comments' active={currentPath === '/chat'} />
          <SideBarItem path='/slack' label='Team Chat' icon='hashtag' active={currentPath === '/slack'} />
          <SideBarItem path='/profile' label='Profile' icon='id card' active={currentPath === '/profile'} />
          <SideBarItem path='/settings' label='Settings' icon='cog' active={currentPath === '/settings'} />
          <SideBarItem path='/roles' label='Roles' icon='shield' active={currentPath === '/roles' || currentPath.startsWith('/roles/')} />
        </Menu>
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
              <Icon name='sign out' />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
