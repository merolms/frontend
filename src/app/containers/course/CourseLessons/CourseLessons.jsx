import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Header, Segment, Icon, Breadcrumb, Divider, Button,
  List, Card, Label, Grid
} from 'semantic-ui-react';
import LessonForm from '../LessonForm/LessonForm';
import { DeleteModal } from '../CourseActions/CourseActions';
import {
  mockFetchCourseById, mockFetchLessons,
  mockCreateLesson, mockUpdateLesson, mockDeleteLesson,
} from '../../../services/courseService';

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

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        mockFetchCourseById(id),
        mockFetchLessons(id),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch (err) {
      console.error('Error loading course lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setLessonModalOpen(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonModalOpen(true);
  };

  const handleLessonSubmit = async (formData) => {
    try {
      setSaving(true);
      if (editingLesson) {
        await mockUpdateLesson(id, editingLesson.id, formData);
      } else {
        await mockCreateLesson(id, formData);
      }
      setLessonModalOpen(false);
      setEditingLesson(null);
      await loadData();
    } catch (err) {
      console.error('Error saving lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteModal.lesson) return;
    try {
      setSaving(true);
      await mockDeleteLesson(id, deleteModal.lesson.id);
      setDeleteModal({ open: false, lesson: null });
      await loadData();
    } catch (err) {
      console.error('Error deleting lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='content-center course-page'>
        <Segment loading className='course-form-segment'>
          <Header as='h1'>Loading lessons...</Header>
        </Segment>
      </div>
    );
  }

  return (
    <div className='content-center course-page'>
      <Breadcrumb>
        <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section link onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>Lessons</Breadcrumb.Section>
      </Breadcrumb>
      <Divider hidden />

      <Segment className='course-form-segment'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <Header as='h1' style={{ margin: 0 }}>
              <Icon name='list alternate' color='teal' />
              Lessons
            </Header>
            <p className='course-form-subtitle'>
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in "{course?.title}"
            </p>
          </div>
          <Button primary onClick={handleCreateLesson}>
            <Icon name='plus' /> Add Lesson
          </Button>
        </div>

        {lessons.length === 0 ? (
          <div className='lessons-empty'>
            <Icon name='book' size='huge' color='grey' />
            <Header as='h3' color='grey'>No lessons yet</Header>
            <p>Start building your course by adding the first lesson.</p>
            <Button primary onClick={handleCreateLesson}>
              <Icon name='plus' /> Create First Lesson
            </Button>
          </div>
        ) : (
          <List divided relaxed>
            {lessons.map((lesson, index) => (
              <List.Item key={lesson.id} className='lesson-list-item'>
                <Grid>
                  <Grid.Column width={12}>
                    <div className='lesson-info'>
                      <div className='lesson-number'>{index + 1}</div>
                      <div className='lesson-details'>
                        <Header as='h4' style={{ margin: 0 }}>{lesson.title}</Header>
                        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>
                          {lesson.description}
                        </p>
                        {lesson.duration && (
                          <Label size='tiny' color='teal' style={{ marginTop: '6px' }}>
                            <Icon name='clock outline' /> {lesson.duration}
                          </Label>
                        )}
                      </div>
                    </div>
                  </Grid.Column>
                  <Grid.Column width={4} textAlign='right'>
                    <Button size='small' icon='pencil' onClick={() => handleEditLesson(lesson)} />
                    <Button size='small' icon='trash' color='red' onClick={() => setDeleteModal({ open: true, lesson })} />
                  </Grid.Column>
                </Grid>
              </List.Item>
            ))}
          </List>
        )}
      </Segment>

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
  );
};

export default CourseLessons;
