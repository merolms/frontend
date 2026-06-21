import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { useGetEventsInTimeRange } from "@/app/api/orval";
import { getMonthTimeRange } from "@/app/utils/eventUtils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Calendar = ({ onDateClick, onEventClick, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { start, end } = getMonthTimeRange(year, month);

  const { data: eventsData, isLoading: loading } = useGetEventsInTimeRange({ start, end });
  const events = eventsData?.data || [];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }
    return days;
  }, [year, month]);

  const getEventsForDay = (date) => {
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="border-border bg-bg-surface overflow-hidden rounded-xl border shadow-sm">
      {/* Header */}
      <div className="border-border bg-bg-surface-hover flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-text-primary text-sm font-semibold">
            {MONTHS[month]} {year}
          </h3>
          <button
            onClick={goToToday}
            className="text-primary cursor-pointer text-[11px] hover:underline"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="hover:bg-bg-surface-active text-text-muted flex h-7 w-7 cursor-pointer items-center justify-center rounded-md"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextMonth}
            className="hover:bg-bg-surface-active text-text-muted flex h-7 w-7 cursor-pointer items-center justify-center rounded-md"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="border-border grid grid-cols-7 border-b">
        {DAYS.map((d) => (
          <div key={d} className="text-text-muted py-2 text-center text-[11px] font-semibold">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayInfo, idx) => {
          const dayEvents = getEventsForDay(dayInfo.date);
          const today = isToday(dayInfo.date);
          const selected = isSelected(dayInfo.date);

          return (
            <div
              key={idx}
              className={`border-border min-h-[80px] cursor-pointer border-r border-b p-1.5 transition-colors ${
                !dayInfo.isCurrentMonth ? "bg-bg-surface-hover/30" : ""
              } ${selected ? "bg-primary/10" : "hover:bg-bg-surface-hover"}`}
              onClick={() => onDateClick?.(dayInfo.date)}
            >
              <div
                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium ${
                  today
                    ? "bg-primary text-secondary"
                    : selected
                      ? "bg-primary/20 text-primary"
                      : dayInfo.isCurrentMonth
                        ? "text-text-primary"
                        : "text-text-muted"
                }`}
              >
                {dayInfo.day}
              </div>
              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className="w-full cursor-pointer truncate rounded px-1 py-0.5 text-left text-[9px] font-medium hover:opacity-80"
                    style={{ background: `${event.color}20`, color: event.color }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-text-muted px-1 text-[9px]">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
