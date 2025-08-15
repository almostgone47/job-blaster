import {useState} from 'react';
import type {Interview, Job, Application} from '../../types';

interface CalendarEvent {
  id: string;
  type: 'interview' | 'deadline' | 'follow-up';
  title: string;
  date: Date;
  time?: string;
  company: string;
  status?: string;
  data: Interview | Job | Application;
}

interface EnhancedCalendarProps {
  interviews: Interview[];
  jobs: Job[];
  applications: Application[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function EnhancedCalendar({
  interviews,
  jobs,
  applications,
  onEventClick,
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first day of the current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  // Get the last day of the current month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayWeekday = firstDayOfMonth.getDay();
  // Get the total number of days in the month
  const daysInMonth = lastDayOfMonth.getDate();

  // Convert all data to calendar events
  const allEvents: CalendarEvent[] = [
    ...interviews.map((interview) => ({
      id: interview.id,
      type: 'interview' as const,
      title: interview.title,
      date: new Date(interview.scheduledAt),
      time: new Date(interview.scheduledAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      company: interview.job.company,
      status: interview.status,
      data: interview,
    })),
    ...jobs
      .filter((job) => job.deadline)
      .map((job) => ({
        id: job.id,
        type: 'deadline' as const,
        title: job.title,
        date: new Date(job.deadline!),
        company: job.company,
        status: job.status,
        data: job,
      })),
    ...applications
      .filter((app) => app.nextAction)
      .map((app) => ({
        id: app.id,
        type: 'follow-up' as const,
        title: app.job.title,
        date: new Date(app.nextAction!),
        company: app.job.company,
        status: app.status,
        data: app,
      })),
  ];

  // Generate calendar days array
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push({day: null, events: []});
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const dayEvents = allEvents.filter((event) => {
      return (
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
    });

    calendarDays.push({day, events: dayEvents, date});
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventColor = (type: string, status?: string) => {
    if (type === 'interview') {
      switch (status) {
        case 'SCHEDULED':
          return 'bg-blue-500';
        case 'CONFIRMED':
          return 'bg-green-500';
        case 'COMPLETED':
          return 'bg-gray-500';
        case 'CANCELLED':
          return 'bg-red-500';
        case 'RESCHEDULED':
          return 'bg-yellow-500';
        default:
          return 'bg-blue-500';
      }
    } else if (type === 'deadline') {
      return 'bg-orange-500';
    } else if (type === 'follow-up') {
      return 'bg-purple-500';
    }
    return 'bg-gray-500';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return '🎤';
      case 'deadline':
        return '⏰';
      case 'follow-up':
        return '📞';
      default:
        return '📅';
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.time) {
      return event.time;
    }
    return event.date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({day, events}, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-2 border border-gray-600 rounded ${
              day ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-900'
            } transition-colors`}
          >
            {day && (
              <>
                {/* Day Number */}
                <div
                  className={`text-sm font-medium mb-2 ${
                    isToday(day) ? 'text-blue-400 font-bold' : 'text-white'
                  }`}
                >
                  {day}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={`${event.type}-${event.id}`}
                      onClick={() => onEventClick(event)}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors ${getEventColor(
                        event.type,
                        event.status,
                      )} text-white hover:opacity-80`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs">
                          {getEventIcon(event.type)}
                        </span>
                        <div className="font-medium truncate">
                          {event.title}
                        </div>
                      </div>
                      <div className="text-xs opacity-90">
                        {formatEventTime(event)}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {event.company}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show count if more than 3 events */}
                {events.length > 3 && (
                  <div className="text-xs text-gray-400 text-center mt-1">
                    +{events.length - 3} more
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Interviews</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Deadlines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Follow-ups</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
