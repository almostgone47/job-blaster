import {useState, useEffect} from 'react';
import type {Interview, Job, Application} from '../types';
import {listInterviews, listJobs, listApplications} from '../api';
import {EnhancedCalendar} from '../components/calendar';

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

export default function Calendar() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [interviewsData, jobsData, applicationsData] = await Promise.all([
          listInterviews(),
          listJobs(),
          listApplications(),
        ]);
        setInterviews(interviewsData);
        setJobs(jobsData);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Failed to load calendar data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  // Get upcoming deadlines (jobs with deadlines in the next 30 days)
  const upcomingDeadlines = jobs
    .filter((job) => {
      if (!job.deadline) return false;
      const deadline = new Date(job.deadline);
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      return deadline <= thirtyDaysFromNow && deadline >= now;
    })
    .map((job) => ({
      id: job.id,
      type: 'deadline' as const,
      title: `Deadline: ${job.title}`,
      date: new Date(job.deadline!),
      company: job.company,
      status: job.status,
      data: job,
    }));

  // Get follow-up reminders (applications that need follow-up)
  const followUps = applications
    .filter((app) => {
      if (!app.nextAction) return false;
      const nextAction = new Date(app.nextAction);
      const now = new Date();
      const sevenDaysFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      return nextAction <= sevenDaysFromNow && nextAction >= now;
    })
    .map((app) => ({
      id: app.id,
      type: 'follow-up' as const,
      title: `Follow-up: ${app.job.title}`,
      date: new Date(app.nextAction!),
      company: app.job.company,
      status: app.status,
      data: app,
    }));

  // Combine all events and sort by date
  const allEvents = [
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
    ...upcomingDeadlines.map((deadline) => ({
      ...deadline,
      time: undefined, // Deadlines don't have specific times
    })),
    ...followUps.map((followUp) => ({
      ...followUp,
      time: undefined, // Follow-ups don't have specific times
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  if (loading) {
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
          <h1 className="text-3xl font-bold text-white">📅 Calendar</h1>
          <p className="text-gray-400 mt-2">
            Your complete schedule: interviews, deadlines, and follow-ups
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {allEvents.length} upcoming events
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-gray-800 rounded-lg p-6">
        <EnhancedCalendar
          interviews={interviews}
          jobs={jobs}
          applications={applications}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Upcoming Events List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Upcoming Events
        </h2>
        <div className="space-y-3">
          {allEvents.slice(0, 10).map((event) => (
            <div
              key={`${event.type}-${event.id}`}
              onClick={() => handleEventClick(event)}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {event.type === 'interview' && '🎤'}
                  {event.type === 'deadline' && '⏰'}
                  {event.type === 'follow-up' && '📞'}
                </div>
                <div>
                  <div className="text-white font-medium">{event.title}</div>
                  <div className="text-sm text-gray-400">{event.company}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">
                  {event.date.toLocaleDateString()}
                </div>
                {event.time && (
                  <div className="text-xs text-gray-400">{event.time}</div>
                )}
                <div className="text-xs text-gray-400 capitalize">
                  {event.status?.toLowerCase().replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
          {allEvents.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No upcoming events. Great job staying on top of things! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedEvent.title}
              </h3>
              <button
                onClick={closeEventModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Company:</span>
                <span className="text-white">{selectedEvent.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="text-white">
                  {selectedEvent.date.toLocaleDateString()}
                </span>
              </div>
              {selectedEvent.time && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.status && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white capitalize">
                    {selectedEvent.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeEventModal}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
