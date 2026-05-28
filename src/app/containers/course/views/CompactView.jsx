import React from 'react';
import { Table, Text, Group, Badge, Skeleton } from '@mantine/core';
import { IconBook, IconSitemap, IconPencil, IconList, IconUsers } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const CompactView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className='course-compact'>
        <Skeleton height={32} mb={4} />
        {[...Array(10)].map((_, i) => <Skeleton key={i} height={28} mb={2} />)}
      </div>
    );
  }

  const rows = courses.map((course) => {
    const status = getStatusLabel(course.status);
    return (
      <div key={course.id} className='course-compact-row' onClick={() => navigate(`/courses/${course.id}`)} style={{ cursor: 'pointer' }}>
        <span className='compact-col-title'><IconBook size={12} className='compact-icon' /> {course.title}</span>
        <Badge size="xs" variant="light" color={getCategoryColor(course.category)}>{course.category}</Badge>
        {status && <Badge size="xs" variant="light" color={status.color}>{status.text}</Badge>}
        <span className='compact-col-num'><IconList size={12} /> {course.totalLessons}</span>
        <span className='compact-col-num'><IconUsers size={12} /> {course.enrolledUsers}</span>
        <Group gap={4} className='compact-col-actions'>
          <Badge component={Link} to={`/courses/${course.id}/builder`} size="xs" variant="outline" leftSection={<IconSitemap size={10} />} onClick={(e) => e.stopPropagation()}>Builder</Badge>
          <Badge component={Link} to={`/courses/${course.id}/edit`} size="xs" variant="outline" leftSection={<IconPencil size={10} />} onClick={(e) => e.stopPropagation()}>Edit</Badge>
        </Group>
      </div>
    );
  });

  return (
    <div className='course-compact'>
      <div className='course-compact-header'>
        <span className='compact-col-title'>Course</span>
        <span>Category</span><span>Status</span>
        <span className='compact-col-num'>Lessons</span><span className='compact-col-num'>Enrolled</span>
        <span className='compact-col-actions'>Actions</span>
      </div>
      {rows}
    </div>
  );
};

export default CompactView;
