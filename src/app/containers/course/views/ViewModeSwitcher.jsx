import React from 'react';
import { Button, Icon } from 'semantic-ui-react';

const viewModes = [
  { key: 'grid', icon: 'grid layout', label: 'Grid' },
  { key: 'table', icon: 'table', label: 'Table' },
  { key: 'list', icon: 'list layout', label: 'List' },
  { key: 'compact', icon: 'content', label: 'Compact' },
];

const ViewModeSwitcher = ({ value, onChange }) => (
  <Button.Group basic size='small' className='view-mode-switcher'>
    {viewModes.map((mode) => (
      <Button
        key={mode.key}
        icon={<Icon name={mode.icon} />}
        title={mode.label}
        active={value === mode.key}
        onClick={() => onChange(mode.key)}
      />
    ))}
  </Button.Group>
);

export default ViewModeSwitcher;
