import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Breadcrumb, Header, Divider, Tab, List, Grid, Card,
  Icon, Button, Image, Label, Segment,
} from 'semantic-ui-react';
import {
  mockFetchCourseById, mockFetchLessons, mockPublishCourse, mockArchiveCourse, mockDeleteCourse,
} from '../../../services/courseService';
import { PublishModal, ArchiveModal, DeleteModal } from '../CourseActions/CourseActions';
import './CourseDetail.scss';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

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
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      const updated = await mockPublishCourse(id);
      setCourse(updated);
    } catch (err) {
      console.error('Error publishing course:', err);
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading(true);
      const updated = await mockArchiveCourse(id);
      setCourse(updated);
    } catch (err) {
      console.error('Error archiving course:', err);
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await mockDeleteCourse(id);
      navigate('/courses');
    } catch (err) {
      console.error('Error deleting course:', err);
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'published':
        return <Label color='green'>Published</Label>;
      case 'draft':
        return <Label color='grey'>Draft</Label>;
      case 'archived':
        return <Label color='orange'>Archived</Label>;
      default:
        return null;
    }
  };

  const panes = [
    {
      menuItem: 'Overview',
      render: () => (
        <Tab.Pane attached={false}>
          {course?.description && (
            <>
              <Header as='h4'>About This Course</Header>
              <p>{course.description}</p>
            </>
          )}
          {course?.tags && course.tags.length > 0 && (
            <>
              <Header as='h4' style={{ marginTop: 20 }}>Topics Covered</Header>
              <div>
                {course.tags.map((tag) => (
                  <Label key={tag} style={{ marginRight: 8, marginBottom: 8 }}>{tag}</Label>
                ))}
              </div>
            </>
          )}
          <Header as='h4' style={{ marginTop: 20 }}>Course Details</Header>
          <List>
            <List.Item>
              <Icon name='user' />
              <List.Content>
                <strong>Instructor:</strong> {course?.author}
              </List.Content>
            </List.Item>
            <List.Item>
              <Icon name='folder' />
              <List.Content>
                <strong>Category:</strong> {course?.category}
              </List.Content>
            </List.Item>
            <List.Item>
              <Icon name='clock outline' />
              <List.Content>
                <strong>Duration:</strong> {course?.duration || 'N/A'}
              </List.Content>
            </List.Item>
            <List.Item>
              <Icon name='users' />
              <List.Content>
                <strong>Enrolled:</strong> {course?.enrolledUsers || 0} users
              </List.Content>
            </List.Item>
            <List.Item>
              <Icon name='calendar' />
              <List.Content>
                <strong>Created:</strong> {course?.createdAt}
              </List.Content>
            </List.Item>
            <List.Item>
              <Icon name='refresh' />
              <List.Content>
                <strong>Last Updated:</strong> {course?.updatedAt}
              </List.Content>
            </List.Item>
          </List>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `Lessons (${lessons.length})`,
      render: () => (
        <Tab.Pane attached={false}>
          {lessons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name='book' size='huge' color='grey' />
              <Header as='h3' color='grey'>No lessons yet</Header>
              <p>Start adding lessons to this course.</p>
              <Button primary as={Link} to={`/courses/${id}/lessons`}>
                <Icon name='plus' /> Add Lesson
              </Button>
            </div>
          ) : (
            <List divided relaxed>
              {lessons.map((lesson, index) => (
                <List.Item key={lesson.id} style={{ padding: '12px 0' }}>
                  <List.Icon name='book outline' size='large' verticalAlign='middle' color='teal' />
                  <List.Content>
                    <List.Header>Lesson {index + 1}: {lesson.title}</List.Header>
                    <List.Description>{lesson.description}</List.Description>
                    {lesson.duration && (
                      <Label size='tiny' color='teal' style={{ marginTop: 4 }}>
                        <Icon name='clock outline' /> {lesson.duration}
                      </Label>
                    )}
                  </List.Content>
                </List.Item>
              ))}
            </List>
          )}
        </Tab.Pane>
      ),
    },
  ];

  if (loading) {
    return (
      <div className='content-center course-details'>
        <Segment loading>
          <Header as='h1'>Loading course...</Header>
        </Segment>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='content-center course-details'>
        <Segment placeholder>
          <Header icon>
            <Icon name='warning circle' />
            Course not found
          </Header>
          <Button primary onClick={() => navigate('/courses')}>Back to Courses</Button>
        </Segment>
      </div>
    );
  }

  return (
    <div className='content-center course-details'>
      <Breadcrumb>
        <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>{course.title}</Breadcrumb.Section>
      </Breadcrumb>
      <Divider hidden />

      {/* Action Bar */}
      <div className='course-detail-actions'>
        <div className='action-left'>
          <Button as={Link} to={`/courses/${id}/edit`} icon>
            <Icon name='pencil' /> Edit
          </Button>
          <Button as={Link} to={`/courses/${id}/lessons`} icon>
            <Icon name='list' /> Manage Lessons
          </Button>
          {course.status !== 'published' && (
            <Button color='green' icon onClick={() => setActiveModal('publish')}>
              <Icon name='check circle' /> Publish
            </Button>
          )}
          {course.status !== 'archived' && (
            <Button color='orange' icon onClick={() => setActiveModal('archive')}>
              <Icon name='archive' /> Archive
            </Button>
          )}
          <Button color='red' icon onClick={() => setActiveModal('delete')}>
            <Icon name='trash' /> Delete
          </Button>
        </div>
        <div className='action-right'>
          {getStatusLabel(course.status)}
        </div>
      </div>

      <Grid>
        <Grid.Column width={10}>
          {course.coverImage && (
            <>
              <Image src={course.coverImage} fluid rounded className='course-detail-image' />
              <Divider hidden />
            </>
          )}
          <Header as='h1'>{course.title}</Header>
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        </Grid.Column>
        <Grid.Column width={6}>
          <Segment className='course-sidebar-segment'>
            <Header as='h3'>Course Content</Header>
            {lessons.length === 0 ? (
              <p style={{ color: '#888' }}>No lessons added yet.</p>
            ) : (
              <List divided relaxed>
                {lessons.map((lesson, index) => (
                  <List.Item key={lesson.id} className='lesson-sidebar-item'>
                    <Icon name='play circle outline' color='grey' />
                    <List.Content>
                      <List.Header as='h5' style={{ margin: 0 }}>{lesson.title}</List.Header>
                      {lesson.duration && (
                        <List.Description style={{ fontSize: '12px', color: '#888' }}>
                          {lesson.duration}
                        </List.Description>
                      )}
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            )}
          </Segment>

          <Segment className='course-sidebar-segment'>
            <Header as='h3'>Quick Stats</Header>
            <List>
              <List.Item>
                <Icon name='users' />
                <List.Content>{course.enrolledUsers || 0} enrolled</List.Content>
              </List.Item>
              <List.Item>
                <Icon name='list' />
                <List.Content>{course.totalLessons || 0} lessons</List.Content>
              </List.Item>
              <List.Item>
                <Icon name='clock outline' />
                <List.Content>{course.duration || 'N/A'}</List.Content>
              </List.Item>
            </List>
          </Segment>
        </Grid.Column>
      </Grid>

      {/* Modals */}
      <PublishModal
        open={activeModal === 'publish'}
        onConfirm={handlePublish}
        onCancel={() => setActiveModal(null)}
        courseTitle={course.title}
        loading={actionLoading}
      />
      <ArchiveModal
        open={activeModal === 'archive'}
        onConfirm={handleArchive}
        onCancel={() => setActiveModal(null)}
        courseTitle={course.title}
        loading={actionLoading}
      />
      <DeleteModal
        open={activeModal === 'delete'}
        onConfirm={handleDelete}
        onCancel={() => setActiveModal(null)}
        itemName={course.title}
        loading={actionLoading}
      />
    </div>
  );
};

export default CourseDetail;
