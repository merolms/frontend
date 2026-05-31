import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchEventsForMonth, formatEventDate } from '@/app/services/eventService';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Calendar = ({ onDateClick, onEventClick, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEventsForMonth(year, month);
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year, month]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) });
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
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="rounded-xl border border-border bg-bg-surface shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-surface-hover/50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-text-primary">{MONTHS[month]} {year}</h3>
          <button onClick={goToToday} className="text-[11px] text-primary hover:underline cursor-pointer">Today</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-bg-surface-active text-text-muted cursor-pointer">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-bg-surface-active text-text-muted cursor-pointer">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold text-text-muted">{d}</div>
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
              className={`min-h-[80px] border-b border-r border-border p-1.5 cursor-pointer transition-colors ${
                !dayInfo.isCurrentMonth ? 'bg-bg-surface-hover/30' : ''
              } ${selected ? 'bg-primary/10' : 'hover:bg-bg-surface-hover'}`}
              onClick={() => onDateClick?.(dayInfo.date)}
            >
              <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-medium mb-1 ${
                today ? 'bg-primary text-white' : selected ? 'bg-primary/20 text-primary' : dayInfo.isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
              }`}>
                {dayInfo.day}
              </div>
              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                    className="w-full text-left px-1 py-0.5 rounded text-[9px] font-medium truncate cursor-pointer hover:opacity-80"
                    style={{ background: `${event.color}20`, color: event.color }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[9px] text-text-muted px-1">+{dayEvents.length - 2} more</p>
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
