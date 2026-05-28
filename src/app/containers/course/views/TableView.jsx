import React from 'react';
import { Table, Text, Group, Badge, Avatar, Skeleton } from '@mantine/core';
import { IconBook, IconUser, IconList, IconUsers, IconChevronRight, IconSitemap } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const TableView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Course</Table.Th><Table.Th>Category</Table.Th><Table.Th>Status</Table.Th>
            <Table.Th ta="center">Lessons</Table.Th><Table.Th ta="center">Enrolled</Table.Th><Table.Th ta="center">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {[...Array(6)].map((_, i) => (
            <Table.Tr key={i}>
              {[5, 2, 2, 1, 1, 2].map((_, j) => <Table.Td key={j}><Skeleton height={16} /></Table.Td>)}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  }

  const rows = courses.map((course) => {
    const status = getStatusLabel(course.status);
    return (
      <Table.Tr key={course.id}>
        <Table.Td>
          <Group gap="sm" onClick={() => navigate(`/courses/${course.id}`)} style={{ cursor: 'pointer' }}>
            <Avatar src={course.coverImage} size={40} radius="sm" />
            <div>
              <Text size="sm" fw={500}>{course.title}</Text>
              <Text size="xs" c="dimmed" lineClamp={1}>{course.description}</Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td><Badge size="sm" variant="light" color={getCategoryColor(course.category)}>{course.category}</Badge></Table.Td>
        <Table.Td>{status && <Badge size="sm" variant="light" color={status.color}>{status.text}</Badge>}</Table.Td>
        <Table.Td ta="center"><Text size="sm"><IconList size={12} /> {course.totalLessons}</Text></Table.Td>
        <Table.Td ta="center"><Text size="sm"><IconUsers size={12} /> {course.enrolledUsers}</Text></Table.Td>
        <Table.Td ta="center">
          <Group gap={4} justify="center">
            <Badge component={Link} to={`/courses/${course.id}`} size="sm" variant="outline" leftSection={<IconChevronRight size={10} />} style={{ cursor: 'pointer' }}>View</Badge>
            <Badge component={Link} to={`/courses/${course.id}/builder`} size="sm" variant="outline" leftSection={<IconSitemap size={10} />} style={{ cursor: 'pointer' }}>Builder</Badge>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Course</Table.Th><Table.Th>Category</Table.Th><Table.Th>Status</Table.Th>
          <Table.Th ta="center">Lessons</Table.Th><Table.Th ta="center">Enrolled</Table.Th><Table.Th ta="center">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export default TableView;
