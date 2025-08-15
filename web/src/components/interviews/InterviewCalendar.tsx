import {useState} from 'react';
import type {Interview} from '../types';

interface InterviewCalendarProps {
  interviews: Interview[];
  onInterviewClick: (interview: Interview) => void;
}

export default function InterviewCalendar({
  interviews,
  onInterviewClick,
}: InterviewCalendarProps) {
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

  // Generate calendar days array
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push({day: null, interviews: []});
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const dayInterviews = interviews.filter((interview) => {
      const interviewDate = new Date(interview.scheduledAt);
      return (
        interviewDate.getDate() === day &&
        interviewDate.getMonth() === currentDate.getMonth() &&
        interviewDate.getFullYear() === currentDate.getFullYear()
      );
    });

    calendarDays.push({day, interviews: dayInterviews, date});
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

  const getStatusColor = (status: string) => {
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
        return 'bg-gray-500';
    }
  };

  const formatInterviewTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
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
        {calendarDays.map(({day, interviews}, index) => (
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

                {/* Interviews for this day */}
                <div className="space-y-1">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      onClick={() => onInterviewClick(interview)}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors ${getStatusColor(
                        interview.status,
                      )} text-white hover:opacity-80`}
                    >
                      <div className="font-medium truncate">
                        {interview.title}
                      </div>
                      <div className="text-xs opacity-90">
                        {formatInterviewTime(interview.scheduledAt)}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {interview.job.company}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show count if more than 3 interviews */}
                {interviews.length > 3 && (
                  <div className="text-xs text-gray-400 text-center mt-1">
                    +{interviews.length - 3} more
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Rescheduled</span>
        </div>
      </div>
    </div>
  );
}
