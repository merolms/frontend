import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CalendarDays, List, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { fetchEvents, getEventTypes, formatEventDate, formatEventTime, getEventStatus } from '@/app/services/eventService';
import Calendar from './components/Calendar';
import EventForm from './components/EventForm';

const typeLabels = {
  workshop: 'Workshop',
  live_class: 'Live Class',
  meeting: 'Meeting',
  career: 'Career Fair',
  review: 'Review',
  ceremony: 'Ceremony',
  study_group: 'Study Group',
};

const statusColors = {
  upcoming: 'blue',
  ongoing: 'green',
  completed: 'gray',
};

const EventCard = ({ event, onEdit, onDelete, navigate }) => {
  const status = getEventStatus(event.startDate, event.endDate);

  return (
    <div
      className="rounded-lg border border-border bg-bg-surface shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Color bar */}
      <div className="h-1.5" style={{ background: event.color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: event.color }} />
            <span className="text-[10px] font-semibold text-text-muted uppercase">{typeLabels[event.type] || event.type}</span>
          </div>
          <Badge variant={statusColors[status]} className="text-[10px] flex-shrink-0">{status}</Badge>
        </div>

        <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
        <p className="text-[11px] text-text-muted line-clamp-2 mt-1">{event.description}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><CalendarDays size={11} /> {formatEventDate(event.startDate)}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {formatEventTime(event.startDate)}</span>
          <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {event.instructor && <span className="text-[10px] text-text-muted">{event.instructor}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted"><Users size={10} className="inline" /> {event.enrolledCount}/{event.maxAttendees}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="h-6 w-6 flex items-center justify-center rounded hover:bg-bg-surface-active text-text-muted cursor-pointer">✏️</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="h-6 w-6 flex items-center justify-center rounded hover:bg-error/10 text-error cursor-pointer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const eventTypes = getEventTypes();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents({ search, type: typeFilter, page, limit: 8 });
      setEvents(data.events);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handleClear = () => { setSearchInput(''); setSearch(''); setTypeFilter(''); setPage(1); };
  const handleCreate = () => { setEditingEvent(null); setShowForm(true); };
  const handleEdit = (event) => { setEditingEvent(event); setShowForm(true); };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      const { deleteEvent } = await import('@/app/services/eventService');
      await deleteEvent(event.id);
      fetchData();
    } catch (err) { setError('Failed to delete event.'); }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingEvent) {
        const { updateEvent } = await import('@/app/services/eventService');
        await updateEvent(editingEvent.id, data);
      } else {
        const { createEvent } = await import('@/app/services/eventService');
        await createEvent(data);
      }
      setShowForm(false);
      setEditingEvent(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setShowForm(true);
  };

  return (
    <DashboardLayout title="Events" subtitle={`${total} event${total !== 1 ? 's' : ''} scheduled`}>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer transition-colors ${view === 'calendar' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-surface-hover'}`}>
              <CalendarDays size={13} /> Calendar
            </button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-surface-hover'}`}>
              <List size={13} /> List
            </button>
          </div>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus size={14} /> Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <form className="flex items-center gap-2 flex-1" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input placeholder="Search events..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-8" />
          </div>
        </form>
        <Select value={typeFilter || 'all'} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>{eventTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        {(search || typeFilter) && <Button variant="default" size="sm" onClick={handleClear}>Clear</Button>}
      </div>

      {/* Content */}
      {view === 'calendar' ? (
        <Calendar
          onDateClick={handleDateClick}
          onEventClick={(event) => navigate(`/events/${event.id}`)}
          selectedDate={selectedDate}
        />
      ) : (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-bg-surface h-40 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays size={48} className="text-text-muted mb-3" />
              <p className="text-text-secondary text-sm">No events found.</p>
              <p className="text-xs text-text-muted mt-1">Create your first event to get started.</p>
              <Button size="sm" className="mt-4" onClick={handleCreate}><Plus size={14} /> Create Event</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} navigate={navigate} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination total={totalPages} value={page} onChange={(p) => setPage(p)} />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Event form modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
        />
      )}
    </DashboardLayout>
  );
};

export default EventsPage;
