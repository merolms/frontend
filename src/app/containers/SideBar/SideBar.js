import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import {Menu, Divider} from 'semantic-ui-react';

import SideBarItem from './SideBarItem/SideBarItem';

import './SideBar.scss';
import UserProfileInfo from '../../components/UserProfileInfo';
import Routes from "../../Routes";

export default class SideBar extends React.Component {
  render() {
    return (
      <Router>
        <Menu borderless vertical stackable fixed='left' className='side-nav'>
          <Divider hidden />
          <UserProfileInfo
            image="https://picsum.photos/100/100"
            primaryText="Angelina Doe"
            secondaryText="Prsidebaroject Manager"
          />
          <Divider hidden />
          <SideBarItem path='/' label='Dashboard' icon='home'/>
          <SideBarItem path='/courses' label='Courses' icon='code'/>
        </Menu>
        <Routes />
      </Router>
    );
  }
}