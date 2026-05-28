import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Paper, Breadcrumbs, Anchor, Button, Badge, Group, Grid, Stack, Title, Text, Tabs, List, Image, SimpleGrid } from '@mantine/core';
import {  AlertCircle, Archive, BookOpen, Check, Clock, Eye, Folder, ListIcon, Pencil, Plus, Network, Star, Trash2, User  } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchCourseById, fetchLessons, publishCourse, archiveCourse, deleteCourse } from '@/app/services/courseService';
import { PublishModal, ArchiveModal, DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { isEnrolled, enrollInCourse, dropCourse } from '@/app/services/enrollmentService';
import './CourseDetail.scss';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [courseData, lessonsData] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      setCourse(courseData); setLessons(lessonsData || []);
      if (user) setEnrollment(isEnrolled(user.id, parseInt(id)));
    } catch (err) { setError(err.message || 'Failed to load course'); }
    finally { setLoading(false); }
  }, [id, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    try { setActionLoading(true); const result = await enrollInCourse(user.id, parseInt(id)); setEnrollment(result); }
    catch (err) { alert(err.message); } finally { setActionLoading(false); }
  };

  const handleDrop = async () => {
    if (!confirm('Are you sure you want to drop this course?')) return;
    try { setActionLoading(true); await dropCourse(user.id, parseInt(id)); setEnrollment(isEnrolled(user.id, parseInt(id))); }
    catch (err) { alert(err.message); } finally { setActionLoading(false); }
  };

  const handlePublish = async () => { try { setActionLoading(true); const updated = await publishCourse(id); setCourse(updated); } catch (err) { alert(err.message); } finally { setActionLoading(false); setActiveModal(null); } };
  const handleArchive = async () => { try { setActionLoading(true); const updated = await archiveCourse(id); setCourse(updated); } catch (err) { alert(err.message); } finally { setActionLoading(false); setActiveModal(null); } };
  const handleDelete = async () => { try { setActionLoading(true); await deleteCourse(id); navigate('/courses'); } catch (err) { alert(err.message); setActionLoading(false); setActiveModal(null); } };

  const statusConfig = { Published: { color: 'green', icon: 'check circle', text: 'Published' }, DRAFT: { color: 'gray', icon: 'edit', text: 'Draft' }, Archived: { color: 'orange', icon: 'archive', text: 'Archived' } };

  if (loading) {
    return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" radius="md" mt={40}><Title order={4}>Loading...</Title></Paper></div></div>);
  }
  if (error || !course) {
    return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" radius="md" mt={40}><AlertCircle color="red" /> {error || 'Course not found'}<br /><Button mt="sm" onClick={() => navigate('/courses')}>Back to Courses</Button></Paper></div></div>);
  }

  const status = statusConfig[course.status] || statusConfig.DRAFT;

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='course-detail-breadcrumb'>
          <Breadcrumbs><Anchor onClick={() => navigate('/courses')}>Courses</Anchor><span>{course.title}</span></Breadcrumbs>
        </div>

        <div className='course-detail-hero'>
          <div className='course-hero-bg' style={{ background: course.coverImage ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${course.coverImage}) center/cover` : 'linear-gradient(135deg, #1a2332 0%, #232f3e 100%)' }}>
            <div className='course-hero-content'>
              <div className='course-hero-left'>
                <Badge color={status.color} size="lg" mb="sm"><Check size={12} /> {status.text}</Badge>
                <Title order={1} className='course-hero-title'>{course.title}</Title>
                <Text className='course-hero-description'>{course.description}</Text>
                <Group gap={8} className='course-hero-meta'>
                  <span><User size={14} /> {course.author}</span><span className='meta-sep'>·</span>
                  <span><Folder size={14} /> {course.category}</span><span className='meta-sep'>·</span>
                  <span><Clock size={14} /> {course.duration}</span>
                </Group>
                {course.tags?.length > 0 && (
                  <Group gap={4} className='course-hero-tags'>{course.tags.map((tag) => (<Badge key={tag} size="sm" variant="filled" color="gray">{tag}</Badge>))}</Group>
                )}
              </div>
              <div className='course-hero-right'>
                <SimpleGrid cols={3} className='course-hero-stats'>
                  <div className='course-stat'><ListIcon size={24} color="#2185d0" /><div className='course-stat-value'>{course.totalLessons}</div><div className='course-stat-label'>Lessons</div></div>
                  <div className='course-stat'><User size={24} color="#33a163" /><div className='course-stat-value'>0</div><div className='course-stat-label'>Enrolled</div></div>
                  <div className='course-stat'><Star size={24} color="#f0a500" /><div className='course-stat-value'>—</div><div className='course-stat-label'>Rating</div></div>
                </SimpleGrid>
              </div>
            </div>
          </div>
        </div>

        <Group justify="space-between" className='course-detail-actions' my="md">
          <Group>
            <PermissionGuard permissions={['courses.lessons.manage']}><Button component={Link} to={`/courses/${id}/builder`} leftSection={<Network size={14} />}>Open Builder</Button></PermissionGuard>
            <PermissionGuard permissions={['courses.edit']}><Button component={Link} to={`/courses/${id}/edit`} variant="default" leftSection={<Pencil size={14} />}>Edit Details</Button></PermissionGuard>
            <PermissionGuard permissions={['courses.lessons.manage']}><Button component={Link} to={`/courses/${id}/lessons`} variant="default" leftSection={<ListIcon size={14} />}>Manage Lessons</Button></PermissionGuard>
          </Group>
          <Group>
            {enrollment?.status === 'active' && <Button component={Link} to={`/courses/${id}/learn`} leftSection={<Plus size={14} />}>Continue Learning</Button>}
            {enrollment?.status === 'completed' && <Button component={Link} to={`/courses/${id}/learn`} variant="default" leftSection={<Eye size={14} />}>Review Course</Button>}
            {enrollment?.status === 'dropped' && <Button color="green" onClick={handleEnroll} loading={actionLoading} leftSection={<Plus size={14} />}>Re-enroll</Button>}
            {enrollment?.status === 'active' && <Button variant="default" color="red" onClick={handleDrop} loading={actionLoading} leftSection={<Plus size={14} />}>Drop</Button>}
            {!enrollment && user && course.status === 'Published' && <Button color="green" onClick={handleEnroll} loading={actionLoading} leftSection={<Plus size={14} />}>Enroll Now</Button>}
            {course.status !== 'Published' && (<PermissionGuard permissions={['courses.publish']}><Button color="green" variant="light" leftSection={<Check size={14} />} onClick={() => setActiveModal('publish')}>Publish</Button></PermissionGuard>)}
            {course.status !== 'Archived' && <Button color="orange" variant="light" leftSection={<Archive size={14} />} onClick={() => setActiveModal('archive')}>Archive</Button>}
            <PermissionGuard permissions={['courses.delete']}><Button color="red" variant="light" leftSection={<Trash2 size={14} />} onClick={() => setActiveModal('delete')}>Delete</Button></PermissionGuard>
          </Group>
        </Group>

        <Grid className='course-detail-grid'>
          <Grid.Col span={10}>
            <Paper className='course-detail-main' p="md" radius="md" withBorder>
              <Tabs defaultValue="overview">
                <Tabs.List>
                  <Tabs.Tab value="overview">Overview</Tabs.Tab>
                  <Tabs.Tab value="lessons">Lessons ({lessons.length})</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="md">
                  {course?.description && (
                    <div className='course-overview-section'><Title order={5}>About This Course</Title><Text>{course.description}</Text></div>
                  )}
                  {course?.tags?.length > 0 && (
                    <div className='course-overview-section'><Title order={5}>Topics Covered</Title><Group gap={4}>{course.tags.map((tag) => (<Badge key={tag} color="teal" size="sm">{tag}</Badge>))}</Group></div>
                  )}
                  <div className='course-overview-section'><Title order={5}>Course Details</Title>
                    <Grid>
                      <Grid.Col span={6}>
                        <List spacing="xs">
                          <List.Item icon={<User size={16} color="#2185d0" />}><Text fw={600}>Instructor</Text><Text c="dimmed">{course?.author || 'N/A'}</Text></List.Item>
                          <List.Item icon={<Folder size={16} color="#9c27b0" />}><Text fw={600}>Category</Text><Text c="dimmed">{course?.category || 'N/A'}</Text></List.Item>
                          <List.Item icon={<Clock size={16} color="#f0a500" />}><Text fw={600}>Duration</Text><Text c="dimmed">{course?.duration || 'N/A'}</Text></List.Item>
                        </List>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <List spacing="xs">
                          <List.Item icon={<ListIcon size={16} color="#33a163" />}><Text fw={600}>Lessons</Text><Text c="dimmed">{course?.totalLessons || 0}</Text></List.Item>
                          <List.Item icon={<BookOpen size={16} color="#2185d0" />}><Text fw={600}>Created</Text><Text c="dimmed">{course?.createdAt || 'N/A'}</Text></List.Item>
                        </List>
                      </Grid.Col>
                    </Grid>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="lessons" pt="md">
                  {lessons.length === 0 ? (
                    <div className='course-empty-state'><BookOpen size={48} color="#999" /><Title order={4} c="dimmed">No lessons yet</Title><p>Start building your course by adding the first lesson.</p></div>
                  ) : (
                    <List spacing="sm" className='course-lessons-list'>
                      {lessons.map((lesson, index) => (
                        <List.Item key={lesson.id} className='course-lesson-item'>
                          <div className='course-lesson-number'>{index + 1}</div>
                          <div><Text fw={600}>{lesson.title}</Text><Text c="dimmed" size="sm">{lesson.description}</Text></div>
                          {lesson.duration && <Badge size="xs" color="teal" leftSection={<Clock size={10} />}>{lesson.duration}</Badge>}
                        </List.Item>
                      ))}
                    </List>
                  )}
                </Tabs.Panel>
              </Tabs>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper className='course-sidebar-card' p="md" radius="md" withBorder mb="md">
              <Title order={5} mb="sm"><ListIcon size={16} color="#33a163" /> Course Content</Title>
              {lessons.length === 0 ? (
                <div className='course-sidebar-empty'><BookOpen size={32} color="#999" /><Text c="dimmed" size="sm">No lessons added yet.</Text></div>
              ) : (
                <List spacing="xs" className='course-sidebar-lessons'>
                  {lessons.map((lesson, index) => (
                    <List.Item key={lesson.id} className='course-sidebar-lesson'>
                      <div className='course-lesson-num'>{index + 1}</div>
                      <div><Text fw={500} size="sm">{lesson.title}</Text>{lesson.duration && <Text c="dimmed" size="xs"><Clock size={10} /> {lesson.duration}</Text>}</div>
                    </List.Item>
                  ))}
                </List>
              )}
            </Paper>

            <Paper className='course-sidebar-card' p="md" radius="md" withBorder>
              <Title order={5} mb="sm">Quick Info</Title>
              <List spacing="xs">
                <List.Item icon={<Star size={14} />}><Text fw={600}>Created</Text><Text c="dimmed">{course.createdAt}</Text></List.Item>
                <List.Item icon={<Star size={14} />}><Text fw={600}>Last Updated</Text><Text c="dimmed">{course.updatedAt}</Text></List.Item>
              </List>
            </Paper>
          </Grid.Col>
        </Grid>

        <PublishModal open={activeModal === 'publish'} onConfirm={handlePublish} onCancel={() => setActiveModal(null)} courseTitle={course.title} loading={actionLoading} />
        <ArchiveModal open={activeModal === 'archive'} onConfirm={handleArchive} onCancel={() => setActiveModal(null)} courseTitle={course.title} loading={actionLoading} />
        <DeleteModal open={activeModal === 'delete'} onConfirm={handleDelete} onCancel={() => setActiveModal(null)} itemName={course.title} loading={actionLoading} />
      </div>
    </div>
  );
};

export default CourseDetail;
