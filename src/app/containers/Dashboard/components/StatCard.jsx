import React from 'react';
import { Paper, Group, Text } from '@mantine/core';

const StatCard = ({ title, value, icon, color, trend, trendUp }) => (
  <Paper className='stat-card' p="md" radius="md" withBorder>
    <Group justify="space-between">
      <Stack gap={2}>
        <Text size="sm" c="dimmed">{title}</Text>
        <Group gap={8}>
          <span className={`stat-value-icon ${color}`}>{icon}</span>
          <Text size="xl" fw={700}>{value}</Text>
        </Group>
        <Text size="xs" c={trendUp ? 'green' : 'red'}>{trendUp ? '↑' : '↓'} {trend}</Text>
      </Stack>
    </Group>
  </Paper>
);

export default StatCard;
