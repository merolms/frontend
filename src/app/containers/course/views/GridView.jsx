import React from 'react';
import { Card, Text, Group, Badge, SimpleGrid, Skeleton } from '@mantine/core';
import { Carousel } from '@mantine/carousel';

import { BookOpen, Clock, List, Star, User } from 'lucide-react';
import { getStatusLabel, getCategoryColor } from './viewHelpers';


import { t } from '@/styles/theme';

const CourseCard = ({ course, navigate }) => {
  const status = getStatusLabel(course.status);

  // Build slides: prefer images array, fall back to coverImage, else placeholder
  const slides = course.images?.length
    ? course.images
    : course.coverImage
      ? [course.coverImage]
      : [];

  return (
    <Card
      className='course-card'
      padding="sm"
      radius="md"
      withBorder
      style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <Card.Section>
        {slides.length > 1 ? (
          <Carousel
            withIndicators
            height={180}
            loop
            align="start"
            containScroll="trimSnaps"
            styles={{
              control: {
                background: t('bg-surface'),
                border: `1px solid ${t('border-primary')}`,
                color: t('text-primary'),
              },
              indicator: {
                background: t('text-muted'),
              },
            }}
          >
            {slides.map((img, i) => (
              <Carousel.Slide key={i}>
                <img
                  src={img}
                  alt={`${course.title} ${i + 1}`}
                  className='course-card-image'
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : slides.length === 1 ? (
          <img
            src={slides[0]}
            alt={course.title}
            className='course-card-image'
          />
        ) : (
          <div className='course-card-image course-card-no-image'>
            <BookOpen size={48} color={t('text-muted')} />
          </div>
        )}
      </Card.Section>

      <div className='course-card-body'>
        <div className='course-card-meta-row'>
          <Badge size="sm" variant="light" color={getCategoryColor(course.category)}>
            {course.category}
          </Badge>
          <Text size="xs" c="dimmed" className='course-card-author'>
            <User size={12} /> {course.author}
          </Text>
        </div>

        <Text className='course-card-title' fw={600} size="sm" lineClamp={2}>
          {course.title}
        </Text>

        <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
          {course.description}
        </Text>

        <Group gap={8} mt={8}>
          <Text size="xs" c="dimmed"><List size={12} /> {course.totalLessons} Lessons</Text>
          <Text size="xs" c="dimmed"><User size={12} /> {course.enrolledUsers}</Text>
          <Text size="xs" c="dimmed"><Clock size={12} /> {course.duration}</Text>
        </Group>

        {course.tags?.length > 0 && (
          <Group gap={4} mt={6}>
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="xs" variant="outline">{tag}</Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge size="xs" variant="outline">+{course.tags.length - 3}</Badge>
            )}
          </Group>
        )}

        {status && (
          <Badge size="xs" variant="light" color={status.color} mt={6}>
            {status.text}
          </Badge>
        )}
      </div>
    </Card>
  );
};

const GridView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {[...Array(8)].map((_, i) => (
          <Card key={i} padding="sm" radius="md" withBorder>
            <Card.Section><Skeleton height={180} /></Card.Section>
            <Skeleton height={16} mt="sm" radius="xl" />
            <Skeleton height={12} mt={6} radius="xl" width="60%" />
            <Skeleton height={12} mt={4} radius="xl" width="40%" />
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} navigate={navigate} />
      ))}
    </SimpleGrid>
  );
};

export default GridView;
