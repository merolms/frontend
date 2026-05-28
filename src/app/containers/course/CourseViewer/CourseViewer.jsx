import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Paper, Breadcrumbs, Anchor, Button, Progress, List, Grid, Title, Text, Skeleton } from '@mantine/core';
import { ArrowRight, BookOpen, Check } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchCourseById, fetchLessons } from '@/app/services/courseService';
import { isEnrolled, markLessonComplete } from '@/app/services/enrollmentService';
import './CourseViewer.scss';

const CourseViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      setCourse(c); setLessons(l || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (loading) { return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" mt={40}><Skeleton height={40} /><Skeleton height={200} mt="md" /></Paper></div></div>); }
  if (error) { return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" mt={40}><Text c="red">{error}</Text></Paper></div></div>); }

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md"><Anchor onClick={() => navigate('/courses')}>Courses</Anchor><Anchor onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Anchor><span>Learning</span></Breadcrumbs>
        <div className='dashboard-content'>
          <Grid>
            <Grid.Col span={9}>
              <Paper p="lg" radius="md" withBorder>
                <Title order={3}>{course?.title}</Title>
                <Text c="dimmed" mt="sm">{course?.description}</Text>
                <Paper p="md" radius="md" mt="md" withBorder style={{ minHeight: 300, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text c="dimmed">Video / content player placeholder</Text>
                </Paper>
              </Paper>
            </Grid.Col>
            <Grid.Col span={3}>
              <Paper p="md" radius="md" withBorder>
                <Title order={5} mb="sm">Lessons</Title>
                <List spacing="xs">
                  {lessons.map((lesson, idx) => (
                    <List.Item key={lesson.id}>
                      <Group justify="space-between">
                        <Text size="sm">{idx + 1}. {lesson.title}</Text>
                        {lesson.completed && <Check size={14} color="green" />}
                      </Group>
                    </List.Item>
                  ))}
                </List>
              </Paper>
            </Grid.Col>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
