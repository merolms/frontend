import React from 'react';
import { Card, Icon } from 'semantic-ui-react';
import './StatCard.scss';

const StatCard = ({ title, value, icon, color, trend, trendUp }) => {
  return (
    <Card className="stat-card">
      <Card.Content>
        <Card.Header className="stat-title">{title}</Card.Header>
        <Card.Description>
          <div className="stat-value">
            <Icon name={icon} color={color} size='large' />
            <span>{value}</span>
          </div>
          <div className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            <Icon name={trendUp ? 'arrow up' : 'arrow down'} size='small' />
            <span>{trend}</span>
          </div>
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

export default StatCard;
