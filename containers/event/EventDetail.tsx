import { CalendarDays, Clock, Edit, MapPin, Tag, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatEventDate, formatEventTime, getEventStatus } from "@/utils/eventUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { useDeleteEvent, useEvent, useUpdateEvent } from "@/hooks/queries/useEvents";

import EventForm from "./components/EventForm";

const typeLabels = {
  workshop: "Workshop",
  live_class: "Live Class",
  meeting: "Meeting",
  career: "Career Fair",
  review: "Review",
  ceremony: "Ceremony",
  study_group: "Study Group",
};
const statusColors = { upcoming: "blue", ongoing: "green", completed: "gray" };

const EventDetail = ({ eventId }: { eventId: string }) => {
  const router = useRouter();
  const id = eventId;
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Use orval hook for fetching event
  const { data: event, isLoading: loading } = useEvent(id);
  const deleteMutation = useDeleteEvent();
  const updateMutation = useUpdateEvent();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      router.push("/events");
    } catch {
      setError("Failed to delete event.");
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Event" subtitle="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="bg-bg-surface-active h-8 w-1/3 rounded" />
          <div className="bg-bg-surface-active h-64 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout title="Event" subtitle="Not found">
        <div className="py-16 text-center">
          <p className="text-text-secondary">{error || "Event not found."}</p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = getEventStatus(event.startDate, event.endDate);

  return (
    <DashboardLayout title={event.title} subtitle={event.description}>
      <div className="text-text-muted mb-4 flex items-center gap-2 text-xs">
        <button onClick={() => navigate("/events")} className="text-primary hover:underline">
          Events
        </button>
        <span>/</span>
        <span className="text-text-primary">{event.title}</span>
      </div>

      <div
        className="border-border max-w-3xl overflow-hidden rounded-xl border shadow-sm"
        style={{ borderLeft: `4px solid ${event.color}` }}
      >
        <div
          className="border-border border-b p-6"
          style={{
            background: `linear-gradient(135deg, ${event.color}11 0%, ${event.color}05 100%)`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge>{typeLabels[event.type] || event.type}</Badge>
                <Badge variant={statusColors[status]}>{status}</Badge>
              </div>
              <div className="text-text-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} /> {formatEventDate(event.startDate)} —{" "}
                  {formatEventDate(event.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {formatEventTime(event.startDate)} —{" "}
                  {formatEventTime(event.endDate)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => setShowForm(true)}>
                <Edit size={14} /> Edit
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-text-muted mb-2 text-xs font-semibold uppercase">Location</h4>
              <p className="text-text-primary flex items-center gap-1.5 text-sm">
                <MapPin size={14} className="text-text-muted" /> {event.location}
              </p>
            </div>
            {event.instructor && (
              <div>
                <h4 className="text-text-muted mb-2 text-xs font-semibold uppercase">Instructor</h4>
                <p className="text-text-primary text-sm">{event.instructor}</p>
              </div>
            )}
            <div>
              <h4 className="text-text-muted mb-2 text-xs font-semibold uppercase">Capacity</h4>
              <p className="text-text-primary flex items-center gap-1.5 text-sm">
                <Users size={14} className="text-text-muted" /> {event.enrolledCount} /{" "}
                {event.maxAttendees} enrolled
              </p>
            </div>
            {event.tags?.length > 0 && (
              <div>
                <h4 className="text-text-muted mb-2 text-xs font-semibold uppercase">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <Badge key={tag.id} variant="default" className="text-[10px]">
                      <Tag size={9} className="mr-0.5" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <EventForm event={event} onSubmit={handleFormSubmit} onClose={() => setShowForm(false)} />
      )}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-border bg-bg-surface mx-4 w-full max-w-sm rounded-xl border p-6 shadow-lg">
            <h3 className="text-text-primary mb-2 text-base font-semibold">Delete Event</h3>
            <p className="text-text-muted mb-4 text-sm">
              Are you sure you want to delete &quot;{event.title}&quot;?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                className="bg-error hover:bg-error/90 text-secondary"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EventDetail;
