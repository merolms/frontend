import React, { useState } from 'react';
import { Button, Menu, Burger, Box } from '@mantine/core';
import { MenuIcon } from 'lucide-react';

function Header(props) {
  const [visible, setVisibility] = useState(true);
  const toggleVisibility = () => { setVisibility(true); };

  return (
    <Box className='header bg-white'>
      <Button variant="subtle" color="gray" p="xs" onClick={props.toggleVisibiltiy} style={{ background: 'transparent' }}>
        <MenuIcon size={24} />
      </Button>
    </Box>
  );
}

export default Header;
