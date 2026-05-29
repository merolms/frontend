import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, Badge, Grid, Title, Text, Stack, List, Loader, Group } from '@mantine/core';
import { AlertCircle, BookOpen, Clock, Info, ListIcon, Pencil, Plus, Network, Trash2 } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import LessonForm from '@/app/containers/course/LessonForm/LessonForm';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchCourseById, fetchLessons, createLesson, updateLesson, deleteLesson as apiDeleteLesson } from '@/app/services/courseService';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';

import { t } from '@/styles/theme';

import './CourseLessons.scss';

const CourseLessons = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, lesson: null });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try { setLoading(true); const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]); setCourse(c); setLessons(l || []); }
    catch (err) { console.error('Error loading lessons:', err); } finally { setLoading(false); }
  };

  const handleLessonSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editingLesson) { await updateLesson(id, editingLesson.id, formData); } else { await createLesson(id, formData); }
      setLessonModalOpen(false); setEditingLesson(null); await loadData();
    } catch (err) { alert(err.message || 'Failed to save lesson.'); } finally { setSaving(false); }
  };

  const handleDeleteLesson = async () => {
    if (!deleteModal.lesson) return;
    setSaving(true);
    try { await apiDeleteLesson(id, deleteModal.lesson.id); setDeleteModal({ open: false, lesson: null }); await loadData(); }
    catch (err) { alert(err.message || 'Failed to delete lesson.'); } finally { setSaving(false); }
  };

  if (loading) {
    return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><div className='course-form-page'><Paper p="lg" radius="md"><Loader /><Title order={4}>Loading...</Title></Paper></div></div></div>);
  }

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='course-form-page'>
          <Breadcrumbs mb="md">
            <Anchor onClick={() => navigate('/courses')}>Courses</Anchor>
            <Anchor onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Anchor>
            <span>Lessons</span>
          </Breadcrumbs>

          <Grid>
            <Grid.Col span={10}>
              <Paper className='course-form-card' p="lg" radius="md" withBorder>
                <div className='lessons-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div><Title order={3}><ListIcon size={20} color={t('accent')} /> Lessons</Title><Text c="dimmed" size="sm">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in "{course?.title}"</Text></div>
                  <PermissionGuard permissions={['courses.lessons.manage']}><Button leftSection={<Plus size={14} />} onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}>Add Lesson</Button></PermissionGuard>
                </div>

                {lessons.length === 0 ? (
                  <div className='lessons-empty' ta="center" p="xl">
                    <BookOpen size={48} color={t('text-muted')} /><Title order={4} c="dimmed">No lessons yet</Title>
                    <Text mb="md">Start building your course by adding the first lesson.</Text>
                    <PermissionGuard permissions={['courses.lessons.manage']}><Button leftSection={<Plus size={14} />} onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}>Create First Lesson</Button></PermissionGuard>
                    <PermissionGuard permissions={['courses.lessons.manage']}><Button variant="default" mt="sm" component={Link} to={`/courses/${id}/builder`} leftSection={<Network size={14} />}>Or use the Course Builder</Button></PermissionGuard>
                  </div>
                ) : (
                  <div className='lessons-list'>
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className='lesson-card' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: `1px solid ${t('border-primary')}`, borderRadius: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className='lesson-card-number' style={{ width: 32, height: 32, borderRadius: 16, background: t('bg-hover'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{index + 1}</div>
                          <div><Title order={5} style={{ margin: 0 }}>{lesson.title}</Title>{lesson.duration && <Badge size="xs" color="teal" mt={4} leftSection={<Clock size={10} />}>{lesson.duration}</Badge>}</div>
                        </div>
                        <PermissionGuard permissions={['courses.lessons.manage']}>
                          <Group gap={4}>
                            <Button size="xs" variant="default" leftSection={<Pencil size={12} />} onClick={() => { setEditingLesson(lesson); setLessonModalOpen(true); }} title="Edit">Edit</Button>
                            <Button size="xs" color="red" variant="default" leftSection={<Trash2 size={12} />} onClick={() => setDeleteModal({ open: true, lesson })} title="Delete">Delete</Button>
                          </Group>
                        </PermissionGuard>
                      </div>
                    ))}
                  </div>
                )}
              </Paper>
            </Grid.Col>

            <Grid.Col span={6}>
              <Paper className='lessons-sidebar-card' p="lg" radius="md" withBorder>
                <Title order={5} mb="sm"><Info size={16} /> About Lessons</Title>
                <Text size="sm" c="dimmed">Lessons are the building blocks of your course. Each lesson can contain text, video, audio, or other content types.</Text>
                <hr style={{ margin: '12px 0', border: 'none',  borderTop: `1px solid ${t('border-primary')}` }} />
                <Title order={6} mb="sm">Quick Actions</Title>
                <div className='quick-actions'>
                  <PermissionGuard permissions={['courses.lessons.manage']}><Button fullWidth size="sm" leftSection={<Plus size={14} />} onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}>Add New Lesson</Button></PermissionGuard>
                  <Button fullWidth size="sm" variant="default" component={Link} to={`/courses/${id}/builder`} mt="xs" leftSection={<Network size={14} />}>Open Builder</Button>
                </div>
              </Paper>
            </Grid.Col>
          </Grid>
        </div>

        <LessonForm open={lessonModalOpen} onClose={() => { setLessonModalOpen(false); setEditingLesson(null); }} onSubmit={handleLessonSubmit} initialData={editingLesson} loading={saving} />
        <DeleteModal open={deleteModal.open} onConfirm={handleDeleteLesson} onCancel={() => setDeleteModal({ open: false, lesson: null })} itemName={deleteModal.lesson?.title} itemType='lesson' loading={saving} />
      </div>
    </div>
  );
};

export default CourseLessons;
