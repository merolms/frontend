import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Loader } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Paper } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchEnrollments } from '@/app/services/enrollmentService';
import { useSelector } from 'react-redux';

const MyLearning = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEnrollments(); }, [user]);

  const loadEnrollments = async () => {
    try { setLoading(true); const data = await fetchEnrollments(user?.id); setEnrollments(data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout
      title="My Learning"
      subtitle="Track your enrolled courses and progress"
    >
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={48} className="text-text-muted mb-3" />
          <p className="text-sm font-medium text-text-primary">No enrollments yet</p>
          <p className="text-xs text-text-muted mt-1">Browse courses to start learning.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {enrollments.map((enrollment) => (
            <Paper key={enrollment.id} className="p-4">
              <div className="flex items-start gap-3">
                {enrollment.coverImage ? (
                  <img src={enrollment.coverImage} alt={enrollment.title} className="w-24 h-16 object-cover rounded-md shrink-0" />
                ) : (
                  <div className="w-24 h-16 rounded-md bg-bg-surface-active flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-text-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary line-clamp-1">{enrollment.title}</h4>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><Clock size={10} /> {enrollment.duration}</p>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-bg-surface-active overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${enrollment.progress || 0}%` }} />
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{enrollment.progress || 0}% complete</p>
                </div>
                <Button size="sm" variant="default" onClick={() => navigate(`/courses/${enrollment.courseId}/learn`)}>
                  <ArrowRight size={14} /> Continue
                </Button>
              </div>
            </Paper>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyLearning;
