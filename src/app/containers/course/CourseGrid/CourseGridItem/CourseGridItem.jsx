import React from 'react';
import { Card, Text, Group, Badge, Image } from '@mantine/core';
import { IconBook, IconCalendar, IconUsers } from '@tabler/icons-react';
import './CourseGridItem.scss';

const GridItem = (props) => {
  const course = props.course;
  return (
    <Card className='course-grid-item' padding="md" radius="md" withBorder>
      <Card.Section>
        <Image src={course.CoverImage} height={160} className='course-grid-image" />
      </Card.Section>
      <Text fw={600} className='course-grid-title' mt="sm">{course.Title}</Text>
      <Text size="sm" c="dimmed" className='course-grid-description' lineClamp={2}>{course.Description}</Text>
      <Group gap={8} mt="sm">
        <Text size="xs" c="dimmed"><IconBook size={12} /> Course Type</Text>
        <Text size="xs" c="dimmed"><IconCalendar size={12} /> 11 Dec 2020</Text>
        <Text size="xs" c="dimmed"><IconUsers size={12} /> 50</Text>
      </Group>
    </Card>
  );
};

export default GridItem;
