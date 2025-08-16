import {useState, useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  listJobs,
  listApplications,
  listInterviews,
  listResumes,
} from '../../api';
import type {CalendarEvent} from '../../types';
import {EnhancedCalendar} from '../calendar';
import EnhancedCalendarEventManager from '../calendar/EnhancedCalendarEventManager';

export default function CalendarView() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  const {data: jobs = [], isLoading: jobsLoading} = useQuery({
    queryKey: ['jobs'],
    queryFn: listJobs,
  });

  const {data: applications = [], isLoading: applicationsLoading} = useQuery({
    queryKey: ['applications'],
    queryFn: listApplications,
  });

  const {data: interviews = [], isLoading: interviewsLoading} = useQuery({
    queryKey: ['interviews'],
    queryFn: listInterviews,
  });

  const {data: resumes = [], isLoading: resumesLoading} = useQuery({
    queryKey: ['resumes'],
    queryFn: listResumes,
  });

  const isLoading =
    jobsLoading || applicationsLoading || interviewsLoading || resumesLoading;

  // Process data into calendar events with alerts
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add interviews
    interviews.forEach((interview) => {
      // For interviews, we don't have deadline info in the simplified job object
      const hasDeadline = false;
      const isOverdue = false;

      // Priority: 0 = no alerts, higher = more urgent
      let priority = 10; // Interview scheduled

      events.push({
        id: interview.id,
        type: 'interview',
        title: interview.title || 'Interview',
        date: new Date(interview.scheduledAt),
        time: interview.time,
        company: interview.job.company || 'Unknown Company',
        status: interview.status,
        data: interview,
        alerts: {
          hasDeadline,
          hasFollowUp: false,
          hasInterview: true,
          isOverdue,
          priority,
        },
      });
    });

    // Add job deadlines (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    jobs.forEach((job) => {
      if (job.deadline) {
        const deadlineDate = new Date(job.deadline);
        if (deadlineDate <= thirtyDaysFromNow) {
          const now = new Date();
          const hasDeadline = !!job.deadline;
          const isOverdue =
            hasDeadline && job.deadline ? new Date(job.deadline) < now : false;

          // Priority: 0 = no alerts, higher = more urgent
          let priority = 0;
          if (isOverdue) priority += 100;
          if (hasDeadline && !isOverdue) priority += 25;

          events.push({
            id: `deadline-${job.id}`,
            type: 'deadline',
            title: `Deadline: ${job.title}`,
            date: deadlineDate,
            time: undefined,
            company: job.company,
            status: job.status,
            data: job,
            alerts: {
              hasDeadline,
              hasFollowUp: false,
              hasInterview: false,
              isOverdue,
              priority,
            },
          });
        }
      }
    });

    // Add follow-up reminders (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    applications.forEach((application) => {
      if (application.nextAction) {
        const followUpDate = new Date(application.nextAction);
        if (followUpDate <= sevenDaysFromNow) {
          const now = new Date();
          const hasDeadline = !!application.job.deadline;
          const hasFollowUp = application.nextAction
            ? new Date(application.nextAction) <= now
            : false;
          const isOverdue =
            hasDeadline && application.job.deadline
              ? new Date(application.job.deadline) < now
              : false;

          // Priority: 0 = no alerts, higher = more urgent
          let priority = 0;
          if (isOverdue) priority += 100;
          if (hasFollowUp) priority += 50;
          if (hasDeadline && !isOverdue) priority += 25;

          events.push({
            id: `followup-${application.id}`,
            type: 'follow-up',
            title: `Follow-up: ${application.job.title || 'Application'}`,
            date: followUpDate,
            time: undefined,
            company: application.job.company || 'Unknown Company',
            status: application.status,
            data: application,
            alerts: {
              hasDeadline,
              hasFollowUp,
              hasInterview: false,
              isOverdue,
              priority,
            },
          });
        }
      }
    });

    // Sort by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [jobs, applications, interviews]);

  // Get upcoming events for the sidebar
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    let events = allEvents.filter(
      (event) => event.date >= now && event.date <= nextWeek,
    );

    // Apply alert filter if enabled
    if (showAlertsOnly) {
      events = events.filter((event) => event.alerts.priority > 0);
    }

    return events;
  }, [allEvents, showAlertsOnly]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleEventUpdated = () => {
    // TODO: Invalidate queries to refresh data
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendar View</h1>
          <p className="text-gray-400 mt-2">
            Timeline view of interviews, deadlines, and follow-ups
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Action Buttons */}
          <button
            onClick={() => {
              // TODO: Add new job functionality
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            <span>Add Job</span>
          </button>
          <button
            onClick={() => {
              // TODO: Add new interview functionality
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🎤</span>
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <EnhancedCalendar
            interviews={interviews}
            jobs={jobs}
            applications={applications}
            onEventClick={handleEventClick}
            showAlertsOnly={showAlertsOnly}
            onShowAlertsOnlyChange={setShowAlertsOnly}
          />
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Upcoming Events
              </h3>
              <label className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={showAlertsOnly}
                  onChange={(e) => setShowAlertsOnly(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                Alerts only
              </label>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No upcoming events this week
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 bg-gray-800 rounded-lg border cursor-pointer hover:bg-gray-750 transition-colors ${
                      event.alerts.priority > 0
                        ? event.alerts.isOverdue
                          ? 'border-red-500 bg-red-900/10'
                          : event.alerts.hasFollowUp
                          ? 'border-yellow-500 bg-yellow-900/10'
                          : 'border-orange-500 bg-orange-900/10'
                        : 'border-gray-600'
                    }`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-1">
                        {event.type === 'interview' && (
                          <span className="text-blue-400">🎯</span>
                        )}
                        {event.type === 'deadline' && (
                          <span className="text-red-400">⏰</span>
                        )}
                        {event.type === 'follow-up' && (
                          <span className="text-yellow-400">📝</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">
                            {event.title}
                          </p>
                          {/* Alert indicator */}
                          {event.alerts.priority > 0 && (
                            <span className="text-xs flex-shrink-0">
                              {event.alerts.isOverdue
                                ? '🔴'
                                : event.alerts.hasFollowUp
                                ? '🟡'
                                : '🟠'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{event.company}</p>
                        <p className="text-xs text-gray-500">
                          {event.date.toLocaleDateString()}
                          {event.time && ` at ${event.time}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Event Manager Modal */}
      <EnhancedCalendarEventManager
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseModal}
        onEventUpdated={handleEventUpdated}
        resumes={resumes}
      />
    </div>
  );
}
