import { CalendarDays, Clock, List, MapPin, Plus, Search, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import {
  formatEventDate,
  formatEventTime,
  getEventStatus,
  getEventTypes,
} from "@/app/services/eventService";
import { useEvents, useDeleteEvent } from "@/hooks/queries/useEvents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Calendar from "./components/Calendar";
import EventForm from "./components/EventForm";
import { usePageTitle } from "@/hooks";

const typeLabels = {
  workshop: "Workshop",
  live_class: "Live Class",
  meeting: "Meeting",
  career: "Career Fair",
  review: "Review",
  ceremony: "Ceremony",
  study_group: "Study Group",
};

const statusColors = {
  upcoming: "blue",
  ongoing: "green",
  completed: "gray",
};

const EventCard = ({ event, onEdit, onDelete, navigate }) => {
  const status = getEventStatus(event.startDate, event.endDate);

  return (
    <div
      className="border-border bg-bg-surface group cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Color bar */}
      <div className="h-1.5" style={{ background: event.color }} />

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: event.color }}
            />
            <span className="text-text-muted text-[10px] font-semibold uppercase">
              {typeLabels[event.type] || event.type}
            </span>
          </div>
          <Badge variant={statusColors[status]} className="flex-shrink-0 text-[10px]">
            {status}
          </Badge>
        </div>

        <h3 className="text-text-primary group-hover:text-primary line-clamp-1 text-sm font-semibold transition-colors">
          {event.title}
        </h3>
        <p className="text-text-muted mt-1 line-clamp-2 text-[11px]">{event.description}</p>

        <div className="text-text-muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="flex items-center gap-1">
            <CalendarDays size={11} /> {formatEventDate(event.startDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {formatEventTime(event.startDate)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {event.location}
          </span>
        </div>

        <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            {event.instructor && (
              <span className="text-text-muted text-[10px]">{event.instructor}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-[10px]">
              <Users size={10} className="inline" /> {event.enrolledCount}/{event.maxAttendees}
            </span>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
                className="hover:bg-bg-surface-active text-text-muted flex h-6 w-6 cursor-pointer items-center justify-center rounded"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event);
                }}
                className="hover:bg-error/10 text-error flex h-6 w-6 cursor-pointer items-center justify-center rounded"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  usePageTitle("Events");
  const navigate = useNavigate();
  const [view, setView] = useState("calendar"); // 'calendar' | 'list'
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const eventTypes = getEventTypes();

  // TanStack Query hooks
  const { data: eventsResult, isLoading: eventsLoading, error: eventsError, refetch } = useEvents({
    search,
    type: typeFilter,
    page,
    limit: 8,
  });
  const deleteMutation = useDeleteEvent();

  // Process data
  useEffect(() => {
    if (eventsResult) {
      setEvents(eventsResult?.events || []);
      setTotalPages(eventsResult?.totalPages || 1);
      setTotal(eventsResult?.total || 0);
    }
  }, [eventsResult]);

  // Update error state from query
  useEffect(() => {
    if (eventsError) {
      setError("Failed to load events.");
    }
  }, [eventsError]);

  const loading = eventsLoading;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };
  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setTypeFilter("");
    setPage(1);
  };
  const handleCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };
  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (event) => {
    setDeleteTarget(event);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setError("Failed to delete event.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingEvent) {
        const { updateEvent } = await import("@/app/services/eventService");
        await updateEvent(editingEvent.id, data);
      } else {
        const { createEvent } = await import("@/app/services/eventService");
        await createEvent(data);
      }
      setShowForm(false);
      setEditingEvent(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setShowForm(true);
  };

  return (
    <DashboardLayout title="Events" subtitle={`${total} event${total !== 1 ? "s" : ""} scheduled`}>
      {/* Action bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="border-border flex items-center overflow-hidden rounded-lg border">
            <button
              onClick={() => setView("calendar")}
              className={`flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${view === "calendar" ? "bg-primary text-secondary" : "text-text-muted hover:bg-bg-surface-hover"}`}
            >
              <CalendarDays size={13} /> Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${view === "list" ? "bg-primary text-secondary" : "text-text-muted hover:bg-bg-surface-hover"}`}
            >
              <List size={13} /> List
            </button>
          </div>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus size={14} /> Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <form className="flex flex-1 items-center gap-2" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search
              size={14}
              className="text-text-muted absolute top-1/2 left-2.5 -translate-y-1/2"
            />
            <Input
              placeholder="Search events..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8"
            />
          </div>
        </form>
        <Select
          value={typeFilter || "all"}
          onValueChange={(v) => {
            setTypeFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || typeFilter) && (
          <Button variant="default" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {/* Content */}
      {view === "calendar" ? (
        <Calendar
          onDateClick={handleDateClick}
          onEventClick={(event) => navigate(`/events/${event.id}`)}
          selectedDate={selectedDate}
        />
      ) : (
        <>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="border-border bg-bg-surface h-40 animate-pulse rounded-lg border"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays size={48} className="text-text-muted mb-3" />
              <p className="text-text-secondary text-sm">No events found.</p>
              <p className="text-text-muted mt-1 text-xs">
                Create your first event to get started.
              </p>
              <Button size="sm" className="mt-4" onClick={handleCreate}>
                <Plus size={14} /> Create Event
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    navigate={navigate}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
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
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      <DeleteModal
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget?.title || ""}
        itemType="event"
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default EventsPage;
