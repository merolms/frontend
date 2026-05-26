import React from 'react';
import { Icon } from 'semantic-ui-react';
import './SideBarItem.scss';
import { Link } from 'react-router-dom';

export class SideBarItem extends React.Component {
  handleClick = (e) => {
    if (this.props.onClick) {
      this.props.onClick(e, { name: this.props.path });
    }
  };

  render() {
    const { path, label, icon, active, onClick } = this.props;

    return (
      <Link to={path} onClick={this.handleClick}>
        <div className='sidebar-item'>
          <div className={`sidebar-item-icon${active ? ' selected' : ''}`}>
            <Icon name={icon} />
          </div>
          <span className={`sidebar-item-label${active ? ' selected' : ''}`}>{label}</span>
        </div>
      </Link>
    );
  }
}

export default SideBarItem;
