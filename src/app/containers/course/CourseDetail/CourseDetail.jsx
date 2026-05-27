import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Breadcrumb, Header, Divider, Tab, List, Grid, Icon, Button, Image, Label, Segment,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import {
  fetchCourseById, fetchLessons, publishCourse, archiveCourse, deleteCourse,
} from '@/app/services/courseService';
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
      setLoading(true);
      setError(null);
      const [courseData, lessonsData] = await Promise.all([
        fetchCourseById(id),
        fetchLessons(id),
      ]);
      setCourse(courseData);
      setLessons(lessonsData || []);
      if (user) {
        setEnrollment(isEnrolled(user.id, parseInt(id)));
      }
    } catch (err) {
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      setActionLoading(true);
      const result = await enrollInCourse(user.id, parseInt(id));
      setEnrollment(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDrop = async () => {
    if (!confirm('Are you sure you want to drop this course?')) return;
    try {
      setActionLoading(true);
      await dropCourse(user.id, parseInt(id));
      setEnrollment(isEnrolled(user.id, parseInt(id)));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      const updated = await publishCourse(id);
      setCourse(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading(true);
      const updated = await archiveCourse(id);
      setCourse(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteCourse(id);
      navigate('/courses');
    } catch (err) {
      alert(err.message);
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const statusConfig = {
    Published: { color: 'green', icon: 'check circle', text: 'Published' },
    DRAFT: { color: 'grey', icon: 'edit', text: 'Draft' },
    Archived: { color: 'orange', icon: 'archive', text: 'Archived' },
  };

  const panes = [
    {
      menuItem: 'Overview',
      render: () => (
        <Tab.Pane attached={false}>
          {course?.description && (
            <div className='course-overview-section'>
              <h3>About This Course</h3>
              <p>{course.description}</p>
            </div>
          )}
          {course?.tags?.length > 0 && (
            <div className='course-overview-section'>
              <h3>Topics Covered</h3>
              <div className='course-tags-row'>
                {course.tags.map((tag) => (
                  <Label key={tag} color='teal' size='small'>{tag}</Label>
                ))}
              </div>
            </div>
          )}
          <div className='course-overview-section'>
            <h3>Course Details</h3>
            <Grid columns={2} stackable>
              <Grid.Column>
                <List relaxed>
                  <List.Item>
                    <Icon name='user' color='blue' />
                    <List.Content>
                      <List.Header>Instructor</List.Header>
                      <List.Description>{course?.author || 'N/A'}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='folder' color='violet' />
                    <List.Content>
                      <List.Header>Category</List.Header>
                      <List.Description>{course?.category || 'N/A'}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='clock outline' color='orange' />
                    <List.Content>
                      <List.Header>Duration</List.Header>
                      <List.Description>{course?.duration || 'N/A'}</List.Description>
                    </List.Content>
                  </List.Item>
                </List>
              </Grid.Column>
              <Grid.Column>
                <List relaxed>
                  <List.Item>
                    <Icon name='list' color='green' />
                    <List.Content>
                      <List.Header>Lessons</List.Header>
                      <List.Description>{course?.totalLessons || 0}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='calendar' color='blue' />
                    <List.Content>
                      <List.Header>Created</List.Header>
                      <List.Description>{course?.createdAt || 'N/A'}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='refresh' color='grey' />
                    <List.Content>
                      <List.Header>Last Updated</List.Header>
                      <List.Description>{course?.updatedAt || 'N/A'}</List.Description>
                    </List.Content>
                  </List.Item>
                </List>
              </Grid.Column>
            </Grid>
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `Lessons (${lessons.length})`,
      render: () => (
        <Tab.Pane attached={false}>
          {lessons.length === 0 ? (
            <div className='course-empty-state'>
              <Icon name='book' size='huge' color='grey' />
              <Header as='h3' color='grey'>No lessons yet</Header>
              <p>Start building your course by adding the first lesson.</p>
              <PermissionGuard permissions={['courses.lessons.manage']}>
                <Button primary as={Link} to={`/courses/${id}/builder`}>
                  <Icon name='sitemap' /> Open Course Builder
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <List divided relaxed className='course-lessons-list'>
              {lessons.map((lesson, index) => (
                <List.Item key={lesson.id} className='course-lesson-item'>
                  <div className='course-lesson-number'>{index + 1}</div>
                  <List.Content>
                    <List.Header>{lesson.title}</List.Header>
                    <List.Description>{lesson.description}</List.Description>
                    {lesson.duration && (
                      <Label size='tiny' color='teal'>
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

  // Loading
  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <Segment loading style={{ marginTop: 40 }}><Header as='h2'>Loading...</Header></Segment>
        </div>
      </div>
    );
  }

  // Error / Not Found
  if (error || !course) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <Segment placeholder style={{ marginTop: 40 }}>
            <Header icon><Icon name='warning circle' /> {error || 'Course not found'}</Header>
            <Button primary onClick={() => navigate('/courses')}>Back to Courses</Button>
          </Segment>
        </div>
      </div>
    );
  }

  const status = statusConfig[course.status] || statusConfig.DRAFT;

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>

        {/* Breadcrumb */}
        <div className='course-detail-breadcrumb'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>{course.title}</Breadcrumb.Section>
          </Breadcrumb>
        </div>

        {/* Hero */}
        <div className='course-detail-hero'>
          <div className='course-hero-bg' style={{
            background: course.coverImage
              ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${course.coverImage}) center/cover`
              : 'linear-gradient(135deg, #1a2332 0%, #232f3e 100%)',
          }}>
            <div className='course-hero-content'>
              <div className='course-hero-left'>
                <div className='course-hero-status'>
                  <Label color={status.color} size='medium'>
                    <Icon name={status.icon} /> {status.text}
                  </Label>
                </div>
                <Header as='h1' className='course-hero-title'>{course.title}</Header>
                <p className='course-hero-description'>{course.description}</p>
                <div className='course-hero-meta'>
                  <span><Icon name='user' /> {course.author}</span>
                  <span className='meta-sep'>·</span>
                  <span><Icon name='folder' /> {course.category}</span>
                  <span className='meta-sep'>·</span>
                  <span><Icon name='clock outline' /> {course.duration}</span>
                </div>
                {course.tags?.length > 0 && (
                  <div className='course-hero-tags'>
                    {course.tags.map((tag) => (
                      <Label key={tag} size='tiny' inverted>{tag}</Label>
                    ))}
                  </div>
                )}
              </div>
              <div className='course-hero-right'>
                <Grid columns={3} className='course-hero-stats'>
                  <Grid.Column>
                    <div className='course-stat'>
                      <Icon name='list' color='blue' size='large' />
                      <div className='course-stat-value'>{course.totalLessons}</div>
                      <div className='course-stat-label'>Lessons</div>
                    </div>
                  </Grid.Column>
                  <Grid.Column>
                    <div className='course-stat'>
                      <Icon name='users' color='green' size='large' />
                      <div className='course-stat-value'>0</div>
                      <div className='course-stat-label'>Enrolled</div>
                    </div>
                  </Grid.Column>
                  <Grid.Column>
                    <div className='course-stat'>
                      <Icon name='star' color='yellow' size='large' />
                      <div className='course-stat-value'>—</div>
                      <div className='course-stat-label'>Rating</div>
                    </div>
                  </Grid.Column>
                </Grid>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className='course-detail-actions'>
          <div className='action-left'>
            <PermissionGuard permissions={['courses.lessons.manage']}>
              <Button as={Link} to={`/courses/${id}/builder`} primary>
                <Icon name='sitemap' /> Open Builder
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['courses.edit']}>
              <Button as={Link} to={`/courses/${id}/edit`}>
                <Icon name='pencil' /> Edit Details
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['courses.lessons.manage']}>
              <Button as={Link} to={`/courses/${id}/lessons`}>
                <Icon name='list' /> Manage Lessons
              </Button>
            </PermissionGuard>
          </div>
          <div className='action-right'>
            {enrollment?.status === 'active' && (
              <Button primary as={Link} to={`/courses/${id}/learn`}>
                <Icon name='play' /> Continue Learning
              </Button>
            )}
            {enrollment?.status === 'completed' && (
              <Button as={Link} to={`/courses/${id}/learn`}>
                <Icon name='eye' /> Review Course
              </Button>
            )}
            {enrollment?.status === 'dropped' && (
              <Button color='green' onClick={handleEnroll} loading={actionLoading}>
                <Icon name='plus' /> Re-enroll
              </Button>
            )}
            {enrollment?.status === 'active' && (
              <Button basic color='red' onClick={handleDrop} loading={actionLoading}>
                <Icon name='minus circle' /> Drop
              </Button>
            )}
            {!enrollment && user && course.status === 'Published' && (
              <Button color='green' onClick={handleEnroll} loading={actionLoading}>
                <Icon name='plus' /> Enroll Now
              </Button>
            )}
            {course.status !== 'Published' && (
              <PermissionGuard permissions={['courses.publish']}>
                <Button color='green' icon onClick={() => setActiveModal('publish')}>
                  <Icon name='check circle' /> Publish
                </Button>
              </PermissionGuard>
            )}
            {course.status !== 'Archived' && (
              <Button color='orange' icon onClick={() => setActiveModal('archive')}>
                <Icon name='archive' /> Archive
              </Button>
            )}
            <PermissionGuard permissions={['courses.delete']}>
              <Button color='red' icon onClick={() => setActiveModal('delete')}>
                <Icon name='trash' /> Delete
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Content Grid */}
        <Grid stackable className='course-detail-grid'>
          <Grid.Column width={10}>
            <Segment className='course-detail-main'>
              <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
            </Segment>
          </Grid.Column>

          <Grid.Column width={6}>
            {/* Content Card */}
            <Segment className='course-sidebar-card'>
              <Header as='h4'><Icon name='list' color='green' /> Course Content</Header>
              {lessons.length === 0 ? (
                <div className='course-sidebar-empty'>
                  <Icon name='book outline' size='large' color='grey' />
                  <p>No lessons added yet.</p>
                </div>
              ) : (
                <List divided relaxed className='course-sidebar-lessons'>
                  {lessons.map((lesson, index) => (
                    <List.Item key={lesson.id} className='course-sidebar-lesson'>
                      <div className='course-lesson-num'>{index + 1}</div>
                      <List.Content>
                        <List.Header as='h5'>{lesson.title}</List.Header>
                        {lesson.duration && (
                          <List.Description>
                            <Icon name='clock outline' size='mini' /> {lesson.duration}
                          </List.Description>
                        )}
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              )}
            </Segment>

            {/* Quick Info Card */}
            <Segment className='course-sidebar-card'>
              <Header as='h4'><Icon name='info circle' color='grey' /> Quick Info</Header>
              <List relaxed>
                <List.Item>
                  <Icon name='calendar' color='blue' />
                  <List.Content>
                    <List.Header>Created</List.Header>
                    <List.Description>{course.createdAt}</List.Description>
                  </List.Content>
                </List.Item>
                <List.Item>
                  <Icon name='refresh' color='grey' />
                  <List.Content>
                    <List.Header>Last Updated</List.Header>
                    <List.Description>{course.updatedAt}</List.Description>
                  </List.Content>
                </List.Item>
                <List.Item>
                  <Icon name='folder' color='violet' />
                  <List.Content>
                    <List.Header>Category</List.Header>
                    <List.Description>{course.category}</List.Description>
                  </List.Content>
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
    </div>
  );
};

export default CourseDetail;
