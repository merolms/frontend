import React from 'react';
import { Paper, Text, Group, Badge, SimpleGrid, Skeleton } from '@mantine/core';
import { BookOpen, Clock, List, Star, User } from 'lucide-react';
import { getStatusLabel, getCategoryColor } from './viewHelpers';

const GridView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className='courses-view-grid'>
        {[...Array(8)].map((_, i) => (
          <Paper key={i} className='course-card-skeleton' p="md" radius="md">
            <Skeleton height={140} radius="md" mb="sm" />
            <Skeleton height={16} radius="xl" mb={6} />
            <Skeleton height={12} radius="xl" mb={4} width="60%" />
            <Skeleton height={12} radius="xl" width="40%" />
          </Paper>
        ))}
      </div>
    );
  }

  return (
    <div className='courses-view-grid'>
      {courses.map((course) => {
        const status = getStatusLabel(course.status);
        return (
          <Paper key={course.id} className='course-card' p="md" radius="md" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${course.id}`)}>
            {course.coverImage ? (
              <img src={course.coverImage} alt={course.title} className='course-card-image' />
            ) : (
              <div className='course-card-image course-card-no-image'><BookOpen size={48} color="#999" /></div>
            )}
            <div className='course-card-body'>
              <div className='course-card-meta-row'>
                <Badge size="sm" variant="light" color={getCategoryColor(course.category)}>{course.category}</Badge>
                <Text size="xs" c="dimmed"><User size={12} /> {course.author}</Text>
              </div>
              <Text className='course-card-title' fw={600} size="sm" lineClamp={2}>{course.title}</Text>
              <Text size="xs" c="dimmed" lineClamp={2} mt={4}>{course.description}</Text>
              <Group gap={8} mt={8}>
                <Text size="xs" c="dimmed"><List size={12} /> {course.totalLessons} Lessons</Text>
                <Text size="xs" c="dimmed"><User size={12} /> {course.enrolledUsers}</Text>
                <Text size="xs" c="dimmed"><Clock size={12} /> {course.duration}</Text>
              </Group>
              {course.tags?.length > 0 && (
                <Group gap={4} mt={6}>
                  {course.tags.slice(0, 3).map((tag) => (<Badge key={tag} size="xs" variant="outline">{tag}</Badge>))}
                  {course.tags.length > 3 && <Badge size="xs" variant="outline">+{course.tags.length - 3}</Badge>}
                </Group>
              )}
              {status && (
                <Badge size="xs" variant="light" color={status.color} mt={6}>{status.text}</Badge>
              )}
            </div>
          </Paper>
        );
      })}
    </div>
  );
};

export default GridView;
