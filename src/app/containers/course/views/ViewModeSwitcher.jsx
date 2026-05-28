import React from 'react';
import { SegmentedControl, Tooltip } from '@mantine/core';
import { IconLayoutGrid, IconTable, IconList, IconLayoutList } from '@tabler/icons-react';

const viewModes = [
  { value: 'grid', label: 'Grid', icon: <IconLayoutGrid size={16} /> },
  { value: 'table', label: 'Table', icon: <IconTable size={16} /> },
  { value: 'list', label: 'List', icon: <IconList size={16} /> },
  { value: 'compact', label: 'Compact', icon: <IconLayoutList size={16} /> },
];

const ViewModeSwitcher = ({ value, onChange }) => (
  <SegmentedControl
    value={value}
    onChange={onChange}
    data={viewModes.map(m => ({ value: m.value, label: (<Tooltip label={m.label}>{m.icon}</Tooltip>) }))}
    className='view-mode-switcher'
    size="sm"
  />
);

export default ViewModeSwitcher;
