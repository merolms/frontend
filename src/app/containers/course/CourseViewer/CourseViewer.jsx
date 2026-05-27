import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Header, Icon, Button, Image, Label, Segment, Breadcrumb,
  Grid, List, Progress, Divider,
} from 'semantic-ui-react';
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
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, lessonsData] = await Promise.all([
        fetchCourseById(id),
        fetchLessons(id),
      ]);
      setCourse(courseData);
      setLessons(lessonsData || []);
      if (lessonsData && lessonsData.length > 0) {
        setActiveLesson(lessonsData[0]);
      }
      if (user) {
        const enrolled = isEnrolled(user.id, parseInt(id));
        setEnrollment(enrolled);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !activeLesson) return;
    try {
      const updated = await markLessonComplete(user.id, parseInt(id), activeLesson.id, lessons.length);
      setEnrollment(updated);
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const isCurrentLessonCompleted = () => {
    return enrollment?.completedLessons?.includes(activeLesson?.id);
  };

  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <Segment loading style={{ marginTop: 60 }}><h2>Loading course...</h2></Segment>
        </div>
      </div>
    );
  }

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

  const completedCount = enrollment?.completedLessons?.length || 0;

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-content'>

          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>{course.title}</Breadcrumb.Section>
          </Breadcrumb>

          <div className='viewer-layout'>
            {/* Left: Lesson content */}
            <div className='viewer-main'>
              <Segment className='viewer-lesson-card'>
                {course.coverImage && (
                  <Image src={course.coverImage} fluid rounded className='viewer-lesson-image' />
                )}
                <Header as='h2' style={{ marginTop: 16 }}>{activeLesson?.title || 'Select a lesson'}</Header>
                <div className='viewer-lesson-body'>
                  {activeLesson?.description ? (
                    <p>{activeLesson.description}</p>
                  ) : activeLesson?.content ? (
                    <p>{activeLesson.content}</p>
                  ) : (
                    <p style={{ color: '#888' }}>Select a lesson from the outline to begin.</p>
                  )}
                </div>
                <Divider />
                <div className='viewer-lesson-actions'>
                  {activeLesson && isCurrentLessonCompleted() ? (
                    <Label color='green' size='medium'><Icon name='check circle' /> Completed</Label>
                  ) : activeLesson ? (
                    <Button primary onClick={handleMarkComplete} disabled={!enrollment}>
                      <Icon name='check' /> Mark as Complete
                    </Button>
                  ) : null}
                  {!enrollment && (
                    <Button as={Link} to={`/courses/${id}`} basic>
                      Enroll to track progress
                    </Button>
                  )}
                </div>
              </Segment>
            </div>

            {/* Right: Course outline */}
            <div className='viewer-sidebar'>
              <Segment className='viewer-outline'>
                <Header as='h4'>Course Outline</Header>
                <Progress percent={enrollment?.progress || 0} color='teal' size='small' progress />
                <p className='viewer-progress-text'>{completedCount} of {lessons.length} lessons completed</p>

                {lessons.length === 0 ? (
                  <p style={{ color: '#888', fontSize: 13 }}>No lessons available yet.</p>
                ) : (
                  <List divided relaxed className='viewer-lessons-list'>
                    {lessons.map((lesson, index) => {
                      const isCompleted = enrollment?.completedLessons?.includes(lesson.id);
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <List.Item
                          key={lesson.id}
                          className={`viewer-lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          onClick={() => setActiveLesson(lesson)}
                        >
                          <List.Icon name={isCompleted ? 'check circle' : 'circle outline'} color={isCompleted ? 'green' : 'grey'} />
                          <List.Content>
                            <List.Header as='h5'>{index + 1}. {lesson.title}</List.Header>
                            {lesson.duration && (
                              <List.Description><Icon name='clock outline' size='mini' /> {lesson.duration}</List.Description>
                            )}
                          </List.Content>
                        </List.Item>
                      );
                    })}
                  </List>
                )}
              </Segment>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
