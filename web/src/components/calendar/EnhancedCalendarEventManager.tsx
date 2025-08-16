import {useState, useMemo} from 'react';
import type {CalendarEvent, Job, Application, Interview} from '../../types';
import {EditJobModal} from '../jobs';
import {ApplicationModal} from '../jobs';
import InterviewModal from '../interviews/InterviewModal';

interface EnhancedCalendarEventManagerProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
  resumes: any[]; // TODO: Proper type
}

export default function EnhancedCalendarEventManager({
  event,
  isOpen,
  onClose,
  onEventUpdated,
  resumes,
}: EnhancedCalendarEventManagerProps) {
  const [activeModal, setActiveModal] = useState<
    'job' | 'application' | 'interview' | null
  >(null);

  // Extract job data from the event
  const job = useMemo(() => {
    if (!event) return null;

    if (event.type === 'interview') {
      // For interviews, we need to construct a minimal job object
      // since interview.job only has basic properties
      const interview = event.data as Interview;
      return {
        id: interview.jobId,
        userId: interview.userId,
        title: interview.job.title,
        company: interview.job.company,
        url: '', // Will be filled by the modal
        source: null,
        location: null,
        salary: null,
        tags: [],
        faviconUrl: null,
        notes: null,
        deadline: null, // Will be filled by the modal
        status: interview.job.status as any,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
        lastActivityAt: interview.updatedAt,
        isRemote: undefined,
        locationCity: null,
        locationState: null,
        locationCountry: null,
        postedAt: null,
        salaryCurrency: '',
        salaryMin: null,
        salaryMax: null,
        salaryType: '',
      } as Job;
    } else if (event.type === 'deadline') {
      return event.data as Job;
    } else if (event.type === 'follow-up') {
      return (event.data as Application).job;
    }
    return null;
  }, [event]);

  // Extract application data
  const application = useMemo(() => {
    if (!event || event.type !== 'follow-up') return null;
    return event.data as Application;
  }, [event]);

  // Extract interview data
  const interview = useMemo(() => {
    if (!event || event.type !== 'interview') return null;
    return event.data as Interview;
  }, [event]);

  const handleCloseModal = () => {
    setActiveModal(null);
    onClose();
  };

  const handleEventUpdated = () => {
    onEventUpdated();
    handleCloseModal();
  };

  if (!event || !isOpen || !job) return null;

  const getEventIcon = () => {
    switch (event.type) {
      case 'interview':
        return '🎯';
      case 'deadline':
        return '⏰';
      case 'follow-up':
        return '📝';
      default:
        return '📅';
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case 'interview':
        return 'text-blue-400';
      case 'deadline':
        return 'text-red-400';
      case 'follow-up':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getAlertIcon = () => {
    if (event.alerts.isOverdue) return '🔴';
    if (event.alerts.hasFollowUp) return '🟡';
    if (event.alerts.hasDeadline) return '🟠';
    if (event.alerts.hasInterview) return '🔵';
    return '⚪';
  };

  const getAlertColor = () => {
    if (event.alerts.isOverdue) return 'text-red-400';
    if (event.alerts.hasFollowUp) return 'text-yellow-400';
    if (event.alerts.hasDeadline) return 'text-orange-400';
    if (event.alerts.hasInterview) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getAlertTooltip = () => {
    const messages = [];
    if (event.alerts.isOverdue) messages.push('Deadline overdue');
    if (event.alerts.hasFollowUp) messages.push('Follow-up due');
    if (event.alerts.hasDeadline && !event.alerts.isOverdue)
      messages.push('Deadline approaching');
    if (event.alerts.hasInterview) messages.push('Interview scheduled');
    return messages.length > 0 ? messages.join(', ') : 'No alerts';
  };

  return (
    <>
      {/* Main Event Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={handleCloseModal}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 p-6 text-left align-middle shadow-xl">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className={`text-3xl ${getEventColor()}`}>
              {getEventIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">
                  {event.title}
                </h3>
                <span
                  className={`text-lg ${getAlertColor()}`}
                  title={getAlertTooltip()}
                >
                  {getAlertIcon()}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-lg text-gray-300 font-medium">
                  {event.company}
                </p>
                <p className="text-sm text-gray-400">
                  {event.date.toLocaleDateString()}
                  {event.time && ` at ${event.time}`}
                </p>
                {event.status && (
                  <p className="text-sm text-gray-400">
                    Status: {event.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => setActiveModal('job')}
              className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span>✏️</span>
              <span>Edit Job</span>
            </button>
            <button
              onClick={() => setActiveModal('application')}
              className="flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <span>📋</span>
              <span>Application</span>
            </button>
            <button
              onClick={() => setActiveModal('interview')}
              className="flex items-center justify-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <span>🎤</span>
              <span>Interviews</span>
            </button>
          </div>

          {/* Event Details */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Event Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="text-white ml-2 capitalize">
                  {event.type.replace('-', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Priority:</span>
                <span
                  className={`ml-2 ${
                    event.alerts.priority > 0 ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {event.alerts.priority > 0 ? 'High' : 'Normal'}
                </span>
              </div>
              {event.alerts.hasDeadline && (
                <div>
                  <span className="text-gray-400">Deadline:</span>
                  <span
                    className={`ml-2 ${
                      event.alerts.isOverdue
                        ? 'text-red-400'
                        : 'text-orange-400'
                    }`}
                  >
                    {event.alerts.isOverdue ? 'Overdue' : 'Approaching'}
                  </span>
                </div>
              )}
              {event.alerts.hasFollowUp && (
                <div>
                  <span className="text-gray-400">Follow-up:</span>
                  <span className="text-yellow-400 ml-2">Due</span>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Job Modal */}
      {activeModal === 'job' && job && (
        <EditJobModal
          job={job}
          open={true}
          onClose={() => setActiveModal(null)}
          onUpdated={handleEventUpdated}
        />
      )}

      {/* Application Modal */}
      {activeModal === 'application' && job && (
        <ApplicationModal
          job={job}
          application={application || undefined}
          open={true}
          onClose={() => setActiveModal(null)}
          onSaved={handleEventUpdated}
          resumes={resumes}
        />
      )}

      {/* Interview Modal */}
      {activeModal === 'interview' && job && (
        <InterviewModal
          open={true}
          interview={interview || undefined}
          job={job}
          onClose={() => setActiveModal(null)}
          onSaved={handleEventUpdated}
        />
      )}
    </>
  );
}
