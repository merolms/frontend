import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SideBarItem from '@/app/containers/SideBar/SideBarItem/SideBarItem';
import UserProfileInfo from '@/app/components/UserProfileInfo';
import './SideBar.scss';
import { logoutUser } from '@/redux/slices/authSlice';

export default class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activePage: '/', sidebarVisible: true };
  }

  handleMenuClick = (e, { name }) => {
    this.setState({ activePage: name });
    this.props.onNavigate?.(name);
  };

  toggleSidebar = () => {
    this.setState((prev) => ({ sidebarVisible: !prev.sidebarVisible }));
  };

  render() {
    return (
      <div className={`sidebar-wrapper ${this.props.sidebarOpen ? 'open' : 'closed'}`}>
        <div className='sidebar-header'>
          <div className='sidebar-brand'>
            <Icon name='graduation cap' size='large' className='brand-icon' />
            <span className='brand-text'>MeroEdu</span>
          </div>
          <button className='sidebar-toggle' onClick={this.toggleSidebar}>
            <Icon name={this.state.sidebarVisible ? 'angle double left' : 'angle double right'} />
          </button>
        </div>

        <div className='sidebar-nav'>
          <div className='sidebar-section-title'>Main Menu</div>
          <Menu className='side-menu'>
            <SideBarItem path='/' label='Dashboard' icon='home' active={this.state.activePage === '/'} onClick={this.handleMenuClick} />
            <SideBarItem path='/courses' label='Courses' icon='book' active={this.state.activePage === '/courses'} onClick={this.handleMenuClick} />
            <SideBarItem path='/users' label='Users' icon='users' active={this.state.activePage === '/users'} onClick={this.handleMenuClick} />
            <SideBarItem path='/teams' label='Teams' icon='sitemap' active={this.state.activePage === '/teams'} onClick={this.handleMenuClick} />
            <SideBarItem path='/categories' label='Categories' icon='tags' active={this.state.activePage === '/categories'} onClick={this.handleMenuClick} />
          </Menu>

          <div className='sidebar-divider' />

          <div className='sidebar-section-title'>Administration</div>
          <Menu className='side-menu side-menu-secondary'>
            <SideBarItem path='/roles' label='Roles & Permissions' icon='shield' active={this.state.activePage === '/roles'} onClick={this.handleMenuClick} />
          </Menu>
        </div>

        <div className='sidebar-footer'>
          <SideBarFooter />
        </div>
      </div>
    );
  }
}

const SideBarFooter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div>
      {user && (
        <UserProfileInfo
          image={user.avatar}
          primaryText={`${user.firstName} ${user.lastName}`}
          secondaryText={user.role}
        />
      )}
      <button className='auth-logout-btn' onClick={handleLogout}>
        <Icon name='sign out' className='auth-logout-icon' />
        <span>Sign Out</span>
      </button>
    </div>
  );
};
