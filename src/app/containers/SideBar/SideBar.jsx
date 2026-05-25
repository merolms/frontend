import React from 'react';
import { Menu, Icon, Dropdown } from 'semantic-ui-react';
import SideBarItem from './SideBarItem/SideBarItem';
import './SideBar.scss';
import UserProfileInfo from '../../components/UserProfileInfo';

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
    this.setState(prev => ({ sidebarVisible: !prev.sidebarVisible }));
  };

  render() {
    return (
      <div className={`sidebar-wrapper ${this.props.sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Icon name="graduation cap" size="large" className="brand-icon" />
            <span className="brand-text">MeroEdu</span>
          </div>
          <button className="sidebar-toggle" onClick={this.toggleSidebar}>
            <Icon name={this.state.sidebarVisible ? 'angle double left' : 'angle double right'} />
          </button>
        </div>

        <div className="sidebar-nav">
          <Menu className="side-menu">
            <SideBarItem 
              path='/' 
              label='Dashboard' 
              icon='home' 
              active={this.state.activePage === '/'}
              onClick={this.handleMenuClick}
            />
            <SideBarItem 
              path='/courses' 
              label='Courses' 
              icon='book' 
              active={this.state.activePage === '/courses'}
              onClick={this.handleMenuClick}
            />
            <SideBarItem 
              path='/users'
              label='Users'
              icon='users'
              active={this.state.activePage === '/users'}
              onClick={this.handleMenuClick}
            />
            <SideBarItem 
              path='/reports' 
              label='Reports' 
              icon='chart bar' 
              active={this.state.activePage === '/reports'}
              onClick={this.handleMenuClick}
            />
          </Menu>

          <div className="sidebar-divider" />

          <div className="sidebar-section-title">Quick Links</div>
          <Menu className="side-menu side-menu-secondary">
            <SideBarItem 
              path='/calendar' 
              label='Calendar' 
              icon='calendar' 
              active={this.state.activePage === '/calendar'}
              onClick={this.handleMenuClick}
            />
            <SideBarItem 
              path='/messages' 
              label='Messages' 
              icon='mail' 
              active={this.state.activePage === '/messages'}
              onClick={this.handleMenuClick}
            />
            <SideBarItem 
              path='/settings' 
              label='Settings' 
              icon='settings' 
              active={this.state.activePage === '/settings'}
              onClick={this.handleMenuClick}
            />
          </Menu>
        </div>

        <div className="sidebar-footer">
          <UserProfileInfo
            image="https://picsum.photos/100/100"
            primaryText="Angelina Doe"
            secondaryText="Instructor"
          />
        </div>
      </div>
    );
  }
}
