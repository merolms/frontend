import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, Title, Text, Badge, Button, Progress, Grid, Image, Stack, Group, Skeleton } from '@mantine/core';
import { IconBook, IconClock, IconArrowRight } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchEnrollments } from '@/app/services/enrollmentService';
import { useSelector } from 'react-redux';

const MyLearning = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEnrollments(); }, [user]);

  const loadEnrollments = async () => {
    try { setLoading(true); const data = await fetchEnrollments(user?.id); setEnrollments(data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'><div className='header-left'><h1 className='page-title'>My Learning</h1><p className='page-subtitle'>Track your enrolled courses and progress.</p></div></div>
        <div className='dashboard-content'>
          {loading ? (
            <Grid>{[...Array(4)].map((_, i) => (<Grid.Col key={i} span={6}><Skeleton height={200} radius="md" /></Grid.Col>))}</Grid>
          ) : enrollments.length === 0 ? (
            <Paper p="xl" radius="md" ta="center"><Title order={4} c="dimmed">No enrollments yet</Title><Text>Browse courses to start learning.</Text><Button mt="md" component={Link} to="/courses">Browse Courses</Button></Paper>
          ) : (
            <Grid>
              {enrollments.map((enrollment) => (
                <Grid.Col key={enrollment.id} span={6}>
                  <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" wrap="nowrap">
                      <Image src={enrollment.coverImage} width={100} height={70} radius="sm" />
                      <div style={{ flex: 1 }}>
                        <Text fw={600} lineClamp={1}>{enrollment.title}</Text>
                        <Text size="sm" c="dimmed"><IconClock size={12} /> {enrollment.duration}</Text>
                        <Progress value={enrollment.progress || 0} size="sm" radius="xl" mt={4} />
                        <Text size="xs" c="dimmed">{enrollment.progress || 0}% complete</Text>
                      </div>
                      <Button size="sm" component={Link} to={`/courses/${enrollment.courseId}/learn`} leftSection={<IconArrowRight size={14} />}>Continue</Button>
                    </Group>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
