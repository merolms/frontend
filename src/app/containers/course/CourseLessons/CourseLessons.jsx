import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Header, Segment, Icon, Breadcrumb, Divider, Button,
  List, Label, Grid,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import LessonForm from '@/app/containers/course/LessonForm/LessonForm';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import {
  mockFetchCourseById, mockFetchLessons,
  mockCreateLesson, mockUpdateLesson, mockDeleteLesson,
} from '@/app/services/courseService';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import './CourseLessons.scss';

const CourseLessons = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, lesson: null });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [c, l] = await Promise.all([mockFetchCourseById(id), mockFetchLessons(id)]);
      setCourse(c);
      setLessons(l);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editingLesson) {
        await mockUpdateLesson(id, editingLesson.id, formData);
      } else {
        await mockCreateLesson(id, formData);
      }
      setLessonModalOpen(false);
      setEditingLesson(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteModal.lesson) return;
    setSaving(true);
    try {
      await mockDeleteLesson(id, deleteModal.lesson.id);
      setDeleteModal({ open: false, lesson: null });
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onNavigate={(path) => navigate(path)} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='course-form-page'><Segment loading><Header as='h2'>Loading...</Header></Segment></div>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onNavigate={(path) => navigate(path)} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        <div className='course-form-page'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section link onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Lessons</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          <Grid stackable>
            <Grid.Column width={10}>
              <Segment className='course-form-card'>
                <div className='lessons-header'>
                  <div>
                    <Header as='h2'>
                      <Icon name='list alternate' color='teal' />
                      Lessons
                    </Header>
                    <p className='course-form-subtitle'>
                      {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in "{course?.title}"
                    </p>
                  </div>
                  <PermissionGuard permissions={['courses.lessons.manage']}>
                    <Button primary onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}>
                      <Icon name='plus' /> Add Lesson
                    </Button>
                  </PermissionGuard>
                </div>

                {lessons.length === 0 ? (
                  <div className='lessons-empty'>
                    <Icon name='book' size='huge' color='grey' />
                    <Header as='h3' color='grey'>No lessons yet</Header>
                    <p>Start building your course by adding the first lesson.</p>
                    <PermissionGuard permissions={['courses.lessons.manage']}>
                      <Button primary onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}>
                        <Icon name='plus' /> Create First Lesson
                      </Button>
                    </PermissionGuard>
                    <Divider hidden />
                    <PermissionGuard permissions={['courses.lessons.manage']}>
                      <Button basic as={Link} to={`/courses/${id}/builder`}>
                        <Icon name='sitemap' /> Or use the Course Builder
                      </Button>
                    </PermissionGuard>
                  </div>
                ) : (
                  <div className='lessons-list'>
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className='lesson-card'>
                        <div className='lesson-card-left'>
                          <div className='lesson-card-number'>{index + 1}</div>
                          <div className='lesson-card-info'>
                            <Header as='h4' style={{ margin: 0 }}>{lesson.title}</Header>
                            <p className='lesson-card-desc'>{lesson.description}</p>
                            {lesson.duration && (
                              <Label size='tiny' color='teal'>
                                <Icon name='clock outline' /> {lesson.duration}
                              </Label>
                            )}
                          </div>
                        </div>
                        <div className='lesson-card-actions'>
                          <PermissionGuard permissions={['courses.lessons.manage']}>
                            <Button size='small' icon onClick={() => { setEditingLesson(lesson); setLessonModalOpen(true); }} title='Edit'>
                              <Icon name='pencil' />
                            </Button>
                            <Button size='small' icon color='red' onClick={() => setDeleteModal({ open: true, lesson })} title='Delete'>
                              <Icon name='trash' />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Segment>
            </Grid.Column>

            <Grid.Column width={6}>
              <Segment className='lessons-sidebar-card'>
                <Header as='h4'><Icon name='info circle' /> About Lessons</Header>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                  Lessons are the building blocks of your course. Each lesson can contain text, video, audio, or other content types.
                </p>
                <Divider />
                <Header as='h5' style={{ margin: 0 }}>Quick Actions</Header>
                <div className='quick-actions'>
                  <PermissionGuard permissions={['courses.lessons.manage']}>
                    <Button fluid size='small' primary onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}>
                      <Icon name='plus' /> Add New Lesson
                    </Button>
                  </PermissionGuard>
                  <Button fluid size='small' as={Link} to={`/courses/${id}/builder`}>
                    <Icon name='sitemap' /> Open Builder
                  </Button>
                </div>
              </Segment>
            </Grid.Column>
          </Grid>
        </div>

        <LessonForm
          open={lessonModalOpen}
          onClose={() => { setLessonModalOpen(false); setEditingLesson(null); }}
          onSubmit={handleLessonSubmit}
          initialData={editingLesson}
          loading={saving}
        />
        <DeleteModal
          open={deleteModal.open}
          onConfirm={handleDeleteLesson}
          onCancel={() => setDeleteModal({ open: false, lesson: null })}
          itemName={deleteModal.lesson?.title}
          itemType='lesson'
          loading={saving}
        />

      </div>
    </div>
  );
};

export default CourseLessons;
