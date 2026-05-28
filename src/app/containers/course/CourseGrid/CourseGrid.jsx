import React from 'react';
import { SimpleGrid } from '@mantine/core';

const CourseGrid = (props) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {props.rows}
    </SimpleGrid>
  );
};

export default CourseGrid;
