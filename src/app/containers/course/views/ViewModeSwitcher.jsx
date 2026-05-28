import React from 'react';
import { SegmentedControl, Tooltip } from '@mantine/core';
import { LayoutGrid, List, Table as TableIcon } from 'lucide-react';

const viewModes = [
  { value: 'grid', label: 'Grid', icon: <LayoutGrid size={16} /> },
  { value: 'table', label: 'Table', icon: <TableIcon size={16} /> },
  { value: 'list', label: 'List', icon: <List size={16} /> },
  { value: 'compact', label: 'Compact', icon: <List size={16} /> },
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
