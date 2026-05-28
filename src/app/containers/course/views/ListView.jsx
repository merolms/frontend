import React from 'react';
import { Paper, Text, Group, Badge, Stack, Avatar, Skeleton } from '@mantine/core';
import { BookOpen, ChevronRight, Clock, List, Pencil, Network, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const ListView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <Stack>
        {[...Array(3)].map((_, i) => (
          <Paper key={i} p="md" radius="md">
            <Group>
              <Skeleton height={100} width={140} radius="md" />
              <div style={{ flex: 1 }}>
                <Skeleton height={16} radius="xl" mb={6} />
                <Skeleton height={12} radius="xl" mb={4} width="80%" />
                <Skeleton height={12} radius="xl" width="60%" />
              </div>
            </Group>
          </Paper>
        ))}
      </Stack>
    );
  }

  return (
    <div className='course-list'>
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <Paper key={course.id} className={`course-list-item course-status-${course.status}`} p="md" radius="md" mb="sm" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${course.id}`)}>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="md" wrap="nowrap">
                <img src={course.coverImage} alt={course.title} style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                <Stack gap={4}>
                  <Text fw={600}>{course.title}</Text>
                  {status && <Badge size="xs" variant="light" color={status.color}>{status.text}</Badge>}
                  <Text size="sm" c="dimmed" lineClamp={2}>{course.description}</Text>
                  <Group gap={8}>
                    <Badge size="xs" variant="light" color={getCategoryColor(course.category)} leftSection={<BookOpen size={10} />}>{course.category}</Badge>
                    <Text size="xs" c="dimmed"><User size={10} /> {course.author}</Text>
                    <Text size="xs" c="dimmed"><List size={10} /> {course.totalLessons} lessons</Text>
                    <Text size="xs" c="dimmed"><Users size={10} /> {course.enrolledUsers}</Text>
                  </Group>
                  {course.tags?.length > 0 && (
                    <Group gap={4}>
                      {course.tags.map((tag) => (<Badge key={tag} size="xs" variant="outline">{tag}</Badge>))}
                    </Group>
                  )}
                </Stack>
              </Group>
              <Group gap={4}>
                <Badge component={Link} to={`/courses/${course.id}/builder`} size="sm" variant="outline" leftSection={<Network size={10} />} style={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>Builder</Badge>
                <Badge component={Link} to={`/courses/${course.id}/edit`} size="sm" variant="outline" leftSection={<Pencil size={10} />} style={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>Edit</Badge>
              </Group>
            </Group>
          </Paper>
        );
      })}
    </div>
  );
};

export default ListView;
