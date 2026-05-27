export const getStatusLabel = (status) => {
  const s = String(status).toLowerCase();
  switch (s) {
    case 'published': return { color: 'green', text: 'Published' };
    case 'draft': return { color: 'grey', text: 'Draft' };
    case 'archived': return { color: 'orange', text: 'Archived' };
    default: return null;
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    Programming: 'blue',
    Design: 'pink',
    'Data Science': 'violet',
    DevOps: 'orange',
    Business: 'teal',
  };
  return colors[category] || 'grey';
};

export const viewModes = [
  { key: 'grid', icon: 'grid layout', label: 'Grid' },
  { key: 'table', icon: 'table', label: 'Table' },
  { key: 'list', icon: 'list layout', label: 'List' },
  { key: 'compact', icon: 'content', label: 'Compact' },
];
