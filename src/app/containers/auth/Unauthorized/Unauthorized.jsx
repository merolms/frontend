import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Header, Icon } from 'semantic-ui-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className='unauthorized-page'>
      <div className='unauthorized-card'>
        <Icon name='ban' size='huge' className='unauthorized-icon' />
        <Header as='h1'>Access Denied</Header>
        <p>You don't have permission to view this page. Contact your administrator if you believe this is an error.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
          <Button onClick={() => navigate(-1)} basic>
            <Icon name='arrow left' /> Go Back
          </Button>
          <Button primary onClick={() => navigate('/')}>
            <Icon name='home' /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
