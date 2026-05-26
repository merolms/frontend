import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Breadcrumb, Header, Divider, Tab, List, Grid, Card,
  Icon, Button, Image, Label, Segment, Statistic, Progress,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import {
  mockFetchCourseById, mockFetchLessons, mockPublishCourse, mockArchiveCourse, mockDeleteCourse,
} from '@/app/services/courseService';
import { PublishModal, ArchiveModal, DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { isEnrolled, enrollInCourse, dropCourse } from '@/app/services/enrollmentService';
import './CourseDetail.scss';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        mockFetchCourseById(id),
        mockFetchLessons(id),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
      if (user) {
        setEnrollment(isEnrolled(user.id, parseInt(id)));
      }
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setCourse(await mockPublishCourse(id));
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading(true);
      setCourse(await mockArchiveCourse(id));
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
    } finally {
      setActionLoading(false);
      setActiveModal(null);
    }
  };

  const statusConfig = {
    published: { color: 'green', icon: 'check circle', text: 'Published' },
    draft: { color: 'grey', icon: 'edit', text: 'Draft' },
    archived: { color: 'orange', icon: 'archive', text: 'Archived' },
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
                      <List.Description>{course?.author}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='folder' color='violet' />
                    <List.Content>
                      <List.Header>Category</List.Header>
                      <List.Description>{course?.category}</List.Description>
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
                    <Icon name='users' color='green' />
                    <List.Content>
                      <List.Header>Enrolled</List.Header>
                      <List.Description>{course?.enrolledUsers || 0} users</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='calendar' color='blue' />
                    <List.Content>
                      <List.Header>Created</List.Header>
                      <List.Description>{course?.createdAt}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name='refresh' color='grey' />
                    <List.Content>
                      <List.Header>Last Updated</List.Header>
                      <List.Description>{course?.updatedAt}</List.Description>
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

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='course-detail-loading'>
            <Segment loading>
              <div className='skeleton-hero' />
              <div className='skeleton-content' />
            </Segment>
          </div>
        </div>
      </div>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────
  if (!course) {
    return (
      <div className='dashboard-layout'>
        <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='course-detail-notfound'>
            <Segment placeholder>
              <Header icon><Icon name='warning circle' /> Course not found</Header>
              <Button primary onClick={() => navigate('/courses')}>Back to Courses</Button>
            </Segment>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[course.status] || statusConfig.draft;

  // ─── Main View ──────────────────────────────────────────────
  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        {/* Breadcrumb */}
        <div className='course-detail-breadcrumb'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>{course.title}</Breadcrumb.Section>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
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
                <Statistic.Group size='tiny' widths='3' className='course-hero-stats'>
                  <Statistic color='blue'>
                    <Statistic.Value><Icon name='list' /> {course.totalLessons}</Statistic.Value>
                    <Statistic.Label>Lessons</Statistic.Label>
                  </Statistic>
                  <Statistic color='green'>
                    <Statistic.Value><Icon name='users' /> {course.enrolledUsers}</Statistic.Value>
                    <Statistic.Label>Enrolled</Statistic.Label>
                  </Statistic>
                  <Statistic color='teal'>
                    <Statistic.Value><Icon name='star' /> {course.avgCompletion || '78%'}</Statistic.Value>
                    <Statistic.Label>Completion</Statistic.Label>
                  </Statistic>
                </Statistic.Group>
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
            {!enrollment && user && course.status === 'published' && (
              <Button color='green' onClick={handleEnroll} loading={actionLoading}>
                <Icon name='plus' /> Enroll Now
              </Button>
            )}
            {course.status !== 'published' && (
              <PermissionGuard permissions={['courses.publish']}>
                <Button color='green' icon onClick={() => setActiveModal('publish')}>
                  <Icon name='check circle' /> Publish
                </Button>
              </PermissionGuard>
            )}
            {course.status !== 'archived' && (
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
            {/* Progress Card */}
            <Segment className='course-sidebar-card'>
              <Header as='h4'><Icon name='chart line' color='blue' /> Progress</Header>
              <Progress percent={course.avgCompletion || 78} color='teal' progress size='small' />
              <p className='course-sidebar-note'>Average completion rate</p>
            </Segment>

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
