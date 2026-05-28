import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Text, Center } from '@mantine/core';
import { IconBan, IconArrowLeft, IconHome } from '@tabler/icons-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className='unauthorized-page'>
      <Center>
        <Stack align="center" className='unauthorized-card'>
          <IconBan size={64} className='unauthorized-icon' />
          <Text size="xl" fw={700}>Access Denied</Text>
          <Text c="dimmed" ta="center">You don't have permission to view this page. Contact your administrator if you believe this is an error.</Text>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <Button variant="default" onClick={() => navigate(-1)} leftSection={<IconArrowLeft size={16} />}>Go Back</Button>
            <Button onClick={() => navigate('/')} leftSection={<IconHome size={16} />}>Dashboard</Button>
          </div>
        </Stack>
      </Center>
    </div>
  );
};

export default Unauthorized;
