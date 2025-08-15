import {useState, useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {listJobs, listApplications, listInterviews} from '../../api';
import type {CalendarEvent} from '../../types';
import {EnhancedCalendar} from '../calendar';
import EventDetailModal from '../calendar/EventDetailModal';

export default function CalendarView() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

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

  const isLoading = jobsLoading || applicationsLoading || interviewsLoading;

  // Process data into calendar events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add interviews
    interviews.forEach((interview) => {
      events.push({
        id: interview.id,
        type: 'interview',
        title: interview.title || 'Interview',
        date: new Date(interview.scheduledAt),
        time: interview.time,
        company: interview.job.company || 'Unknown Company',
        status: interview.status,
        data: interview,
      });
    });

    // Add job deadlines (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    jobs.forEach((job) => {
      if (job.deadline) {
        const deadlineDate = new Date(job.deadline);
        if (deadlineDate <= thirtyDaysFromNow) {
          events.push({
            id: `deadline-${job.id}`,
            type: 'deadline',
            title: `Deadline: ${job.title}`,
            date: deadlineDate,
            time: undefined,
            company: job.company,
            status: job.status,
            data: job,
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
          events.push({
            id: `followup-${application.id}`,
            type: 'follow-up',
            title: `Follow-up: ${application.job.title || 'Application'}`,
            date: followUpDate,
            time: undefined,
            company: application.job.company || 'Unknown Company',
            status: application.status,
            data: application,
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

    return allEvents.filter(
      (event) => event.date >= now && event.date <= nextWeek,
    );
  }, [allEvents]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <EnhancedCalendar
            interviews={interviews}
            jobs={jobs}
            applications={applications}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Upcoming Events
            </h3>

            {upcomingEvents.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No upcoming events this week
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-750 transition-colors"
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
                        <p className="text-sm font-medium text-white truncate">
                          {event.title}
                        </p>
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

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseModal}
      />
    </div>
  );
}
