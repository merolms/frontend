import React from 'react';
import { Table, Text, Group, Badge, Avatar, Skeleton } from '@mantine/core';
import { BookOpen, ChevronRight, List, Network, User, Users,TableIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const TableView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <TableIcon>
        <TableIcon.Thead>
          <TableIcon.Tr>
            <TableIcon.Th>Course</TableIcon.Th><TableIcon.Th>Category</TableIcon.Th><TableIcon.Th>Status</TableIcon.Th>
            <TableIcon.Th ta="center">Lessons</TableIcon.Th><TableIcon.Th ta="center">Enrolled</TableIcon.Th><TableIcon.Th ta="center">Actions</TableIcon.Th>
          </TableIcon.Tr>
        </TableIcon.Thead>
        <TableIcon.Tbody>
          {[...Array(6)].map((_, i) => (
            <TableIcon.Tr key={i}>
              {[5, 2, 2, 1, 1, 2].map((_, j) => <TableIcon.Td key={j}><Skeleton height={16} /></TableIcon.Td>)}
            </TableIcon.Tr>
          ))}
        </TableIcon.Tbody>
      </TableIcon>
    );
  }

  const rows = courses.map((course) => {
    const status = getStatusLabel(course.status);
    return (
      <TableIcon.Tr key={course.id}>
        <TableIcon.Td>
          <Group gap="sm" onClick={() => navigate(`/courses/${course.id}`)} style={{ cursor: 'pointer' }}>
            <Avatar src={course.coverImage} size={40} radius="sm" />
            <div>
              <Text size="sm" fw={500}>{course.title}</Text>
              <Text size="xs" c="dimmed" lineClamp={1}>{course.description}</Text>
            </div>
          </Group>
        </TableIcon.Td>
        <TableIcon.Td><Badge size="sm" variant="light" color={getCategoryColor(course.category)}>{course.category}</Badge></TableIcon.Td>
        <TableIcon.Td>{status && <Badge size="sm" variant="light" color={status.color}>{status.text}</Badge>}</TableIcon.Td>
        <TableIcon.Td ta="center"><Text size="sm"><List size={12} /> {course.totalLessons}</Text></TableIcon.Td>
        <TableIcon.Td ta="center"><Text size="sm"><Users size={12} /> {course.enrolledUsers}</Text></TableIcon.Td>
        <TableIcon.Td ta="center">
          <Group gap={4} justify="center">
            <Badge component={Link} to={`/courses/${course.id}`} size="sm" variant="outline" leftSection={<ChevronRight size={10} />} style={{ cursor: 'pointer' }}>View</Badge>
            <Badge component={Link} to={`/courses/${course.id}/builder`} size="sm" variant="outline" leftSection={<Network size={10} />} style={{ cursor: 'pointer' }}>Builder</Badge>
          </Group>
        </TableIcon.Td>
      </TableIcon.Tr>
    );
  });

  return (
    <TableIcon striped highlightOnHover>
      <TableIcon.Thead>
        <TableIcon.Tr>
          <TableIcon.Th>Course</TableIcon.Th><TableIcon.Th>Category</TableIcon.Th><TableIcon.Th>Status</TableIcon.Th>
          <TableIcon.Th ta="center">Lessons</TableIcon.Th><TableIcon.Th ta="center">Enrolled</TableIcon.Th><TableIcon.Th ta="center">Actions</TableIcon.Th>
        </TableIcon.Tr>
      </TableIcon.Thead>
      <TableIcon.Tbody>{rows}</TableIcon.Tbody>
    </TableIcon>
  );
};

export default TableView;
