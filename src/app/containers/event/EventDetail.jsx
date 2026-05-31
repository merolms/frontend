import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Trash2, Edit, Tag } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchEventById, deleteEvent, getEventStatus, formatEventDate, formatEventTime } from '@/app/services/eventService';
import EventForm from './components/EventForm';

const typeLabels = { workshop: 'Workshop', live_class: 'Live Class', meeting: 'Meeting', career: 'Career Fair', review: 'Review', ceremony: 'Ceremony', study_group: 'Study Group' };
const statusColors = { upcoming: 'blue', ongoing: 'green', completed: 'gray' };

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEventById(id);
      if (!data) { setError('Event not found.'); return; }
      setEvent(data);
    } catch (err) { setError('Failed to load event.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    try {
      await deleteEvent(id);
      navigate('/events');
    } catch (err) { setError('Failed to delete event.'); }
  };

  const handleFormSubmit = async (data) => {
    try {
      const { updateEvent } = await import('@/app/services/eventService');
      await updateEvent(id, data);
      setShowForm(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <DashboardLayout title="Event" subtitle="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-surface-active rounded w-1/3" />
          <div className="h-64 bg-bg-surface-active rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout title="Event" subtitle="Not found">
        <div className="text-center py-16">
          <p className="text-text-secondary">{error || 'Event not found.'}</p>
          <Button size="sm" className="mt-4" onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = getEventStatus(event.startDate, event.endDate);

  return (
    <DashboardLayout title={event.title} subtitle={event.description}>
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/events')} className="text-primary hover:underline">Events</button>
        <span>/</span>
        <span className="text-text-primary">{event.title}</span>
      </div>

      <div className="max-w-3xl rounded-xl border border-border shadow-sm overflow-hidden" style={{ borderLeft: `4px solid ${event.color}` }}>
        <div className="p-6 border-b border-border" style={{ background: `linear-gradient(135deg, ${event.color}11 0%, ${event.color}05 100%)` }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{typeLabels[event.type] || event.type}</Badge>
                <Badge variant={statusColors[status]}>{status}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatEventDate(event.startDate)} — {formatEventDate(event.endDate)}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {formatEventTime(event.startDate)} — {formatEventTime(event.endDate)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => setShowForm(true)}><Edit size={14} /> Edit</Button>
              <Button variant="default" size="sm" onClick={() => setShowDelete(true)}><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Location</h4>
              <p className="text-sm text-text-primary flex items-center gap-1.5"><MapPin size={14} className="text-text-muted" /> {event.location}</p>
            </div>
            {event.instructor && (
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Instructor</h4>
                <p className="text-sm text-text-primary">{event.instructor}</p>
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Capacity</h4>
              <p className="text-sm text-text-primary flex items-center gap-1.5"><Users size={14} className="text-text-muted" /> {event.enrolledCount} / {event.maxAttendees} enrolled</p>
            </div>
            {event.tags?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="default" className="text-[10px]"><Tag size={9} className="mr-0.5" />{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && <EventForm event={event} onSubmit={handleFormSubmit} onClose={() => setShowForm(false)} />}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-border bg-bg-surface p-6 shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-text-primary mb-2">Delete Event</h3>
            <p className="text-sm text-text-muted mb-4">Are you sure you want to delete "{event.title}"?</p>
            <div className="flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button size="sm" onClick={handleDelete} className="bg-error text-white hover:bg-error/90">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EventDetail;
