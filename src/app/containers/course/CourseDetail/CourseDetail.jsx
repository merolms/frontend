import React, { useState, useEffect, useCallback } from 'react';
import { t } from '@/styles/theme';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertCircle, Archive, BookOpen, Check, Clock, Eye, ChevronRight, List, Pencil, Plus, Network, Star, Trash2, User, Folder, Loader } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Paper } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { fetchCourseById, fetchLessons, publishCourse, archiveCourse, deleteCourse } from '@/app/services/courseService';
import { PublishModal, ArchiveModal, DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { isEnrolled, enrollInCourse, dropCourse } from '@/app/services/enrollmentService';

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

  const statusConfig = {
    Published: { color: 'green', text: 'Published' },
    DRAFT: { color: 'gray', text: 'Draft' },
    Archived: { color: 'orange', text: 'Archived' },
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-text-muted" size={20} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 text-error py-4">
          <AlertCircle size={14} /> {error || 'Course not found'}
        </div>
        <Button size="sm" onClick={() => navigate('/courses')}>Back to Courses</Button>
      </DashboardLayout>
    );
  }

  const status = statusConfig[course.status] || statusConfig.DRAFT;

  return (
    <>
      <DashboardLayout>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
          <button onClick={() => navigate('/courses')} className="text-primary hover:underline">Courses</button>
          <ChevronRight size={12} />
          <span>{course.title}</span>
        </div>

        {/* Hero */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: course.coverImage ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${course.coverImage}) center/cover` : 'linear-gradient(135deg, #1a2332 0%, #232f3e 100%)' }}>
          <div className="flex items-start justify-between p-6 gap-6">
            <div className="flex-1 space-y-2">
              <Badge variant={status.color === 'green' ? 'green' : status.color === 'orange' ? 'orange' : 'gray'}>
                <Check size={10} /> {status.text}
              </Badge>
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
              <p className="text-sm text-white/80 max-w-xl">{course.description}</p>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="flex items-center gap-1"><User size={12} /> {course.author}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Folder size={12} /> {course.category}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
              </div>
              {course.tags?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  {course.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px]">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-8 shrink-0">
              <div className="text-center text-white">
                <List size={20} className="mx-auto mb-1" style={{ color: t('accent') }} />
                <div className="text-lg font-bold">{course.totalLessons}</div>
                <div className="text-[11px] text-white/60">Lessons</div>
              </div>
              <div className="text-center text-white">
                <User size={20} className="mx-auto mb-1" style={{ color: t('primary') }} />
                <div className="text-lg font-bold">0</div>
                <div className="text-[11px] text-white/60">Enrolled</div>
              </div>
              <div className="text-center text-white">
                <Star size={20} className="mx-auto mb-1" style={{ color: t('warning') }} />
                <div className="text-lg font-bold">—</div>
                <div className="text-[11px] text-white/60">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PermissionGuard permissions={['courses.lessons.manage']}>
              <Button size="sm" onClick={() => navigate(`/courses/${id}/builder`)}><Network size={14} /> Open Builder</Button>
            </PermissionGuard>
            <PermissionGuard permissions={['courses.edit']}>
              <Button size="sm" variant="default" onClick={() => navigate(`/courses/${id}/edit`)}><Pencil size={14} /> Edit Details</Button>
            </PermissionGuard>
          </div>
          <div className="flex items-center gap-2">
            {enrollment?.status === 'active' && <Button size="sm" variant="default" onClick={() => navigate(`/courses/${id}/learn`)}><Plus size={14} /> Continue Learning</Button>}
            {enrollment?.status === 'completed' && <Button size="sm" variant="default" onClick={() => navigate(`/courses/${id}/learn`)}><Eye size={14} /> Review Course</Button>}
            {enrollment?.status === 'dropped' && <Button size="sm" variant="green" onClick={handleEnroll}><Plus size={14} /> Re-enroll</Button>}
            {enrollment?.status === 'active' && <Button size="sm" variant="default" onClick={handleDrop}><Plus size={14} /> Drop</Button>}
            {!enrollment && user && course.status === 'Published' && <Button size="sm" variant="green" onClick={handleEnroll}><Plus size={14} /> Enroll Now</Button>}
            {course.status !== 'Published' && (
              <PermissionGuard permissions={['courses.publish']}>
                <Button size="sm" variant="ghost" onClick={() => setActiveModal('publish')}><Check size={14} /> Publish</Button>
              </PermissionGuard>
            )}
            {course.status !== 'Archived' && <Button size="sm" variant="ghost" onClick={() => setActiveModal('archive')}><Archive size={14} /> Archive</Button>}
            <PermissionGuard permissions={['courses.delete']}>
              <Button size="sm" variant="ghost" onClick={() => setActiveModal('delete')}><Trash2 size={14} /> Delete</Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Tabs + Sidebar */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <Paper className="p-4">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  {course?.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">About This Course</h3>
                      <p className="text-xs text-text-secondary">{course.description}</p>
                    </div>
                  )}
                  {course?.tags?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Topics Covered</h3>
                      <div className="flex items-center gap-1.5">
                        {course.tags.map((tag) => <Badge key={tag} variant="teal">{tag}</Badge>)}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Course Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User size={14} className="mt-0.5" style={{ color: t('accent') }} />
                          <div>
                            <div className="text-xs font-semibold text-text-primary">Instructor</div>
                            <div className="text-xs text-text-muted">{course?.author || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Folder size={14} className="mt-0.5" style={{ color: t('secondary') }} />
                          <div>
                            <div className="text-xs font-semibold text-text-primary">Category</div>
                            <div className="text-xs text-text-muted">{course?.category || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock size={14} className="mt-0.5" style={{ color: t('warning') }} />
                          <div>
                            <div className="text-xs font-semibold text-text-primary">Duration</div>
                            <div className="text-xs text-text-muted">{course?.duration || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <List size={14} className="mt-0.5" style={{ color: t('primary') }} />
                          <div>
                            <div className="text-xs font-semibold text-text-primary">Lessons</div>
                            <div className="text-xs text-text-muted">{course?.totalLessons || 0}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <BookOpen size={14} className="mt-0.5" style={{ color: t('accent') }} />
                          <div>
                            <div className="text-xs font-semibold text-text-primary">Created</div>
                            <div className="text-xs text-text-muted">{course?.createdAt || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="lessons">
                  {lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen size={48} className="text-text-muted mb-3" />
                      <p className="text-sm font-medium text-text-primary">No lessons yet</p>
                      <p className="text-xs text-text-muted mt-1">Start building your course by adding the first lesson.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-surface-hover transition-colors">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-[11px] font-semibold text-primary">{index + 1}</div>
                          <div className="flex-1 text-xs font-semibold text-text-primary">{lesson.title}</div>
                          {lesson.duration && <Badge variant="teal">{lesson.duration}</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Paper>
          </div>

          <div className="col-span-5 space-y-4">
            <Paper className="p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1">
                <List size={14} style={{ color: t('primary') }} /> Course Content
              </h3>
              {lessons.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <BookOpen size={28} className="text-text-muted" />
                  <p className="text-xs text-text-muted mt-2">No lessons added yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-bg-surface-hover transition-colors">
                      <div className="text-[11px] font-medium text-text-muted w-4">{index + 1}</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-text-primary">{lesson.title}</div>
                        {lesson.duration && <div className="text-[11px] text-text-muted flex items-center gap-1"><Clock size={9} /> {lesson.duration}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Paper>

            <Paper className="p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star size={12} />
                  <div>
                    <div className="text-xs font-semibold text-text-primary">Created</div>
                    <div className="text-xs text-text-muted">{course.createdAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={12} />
                  <div>
                    <div className="text-xs font-semibold text-text-primary">Last Updated</div>
                    <div className="text-xs text-text-muted">{course.updatedAt}</div>
                  </div>
                </div>
              </div>
            </Paper>
          </div>
        </div>
      </DashboardLayout>

      <PublishModal open={activeModal === 'publish'} onConfirm={handlePublish} onCancel={() => setActiveModal(null)} courseTitle={course.title} loading={actionLoading} />
      <ArchiveModal open={activeModal === 'archive'} onConfirm={handleArchive} onCancel={() => setActiveModal(null)} courseTitle={course.title} loading={actionLoading} />
      <DeleteModal open={activeModal === 'delete'} onConfirm={handleDelete} onCancel={() => setActiveModal(null)} itemName={course.title} loading={actionLoading} />
    </>
  );
};

export default CourseDetail;
