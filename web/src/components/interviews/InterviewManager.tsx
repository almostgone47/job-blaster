import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Interview, Job} from '../types';
import {listInterviews} from '../api';
import InterviewModal from './InterviewModal';
import InterviewCalendar from './InterviewCalendar';

export default function InterviewManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(
    null,
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const {
    data: interviews = [],
    isLoading,
    error,
  } = useQuery({queryKey: ['interviews'], queryFn: listInterviews});

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setSelectedJob({
      id: interview.job.id,
      title: interview.job.title,
      company: interview.job.company,
      status: interview.job.status as any,
      userId: '',
      url: '',
      tags: [],
      createdAt: '',
      updatedAt: '',
      lastActivityAt: '',
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingInterview(null);
    setSelectedJob(null);
  };

  const handleSaved = () => {
    // This will trigger a refetch of interviews
  };

  // Group interviews by date for calendar-like view
  const groupInterviewsByDate = (interviews: Interview[]) => {
    const groups: Record<string, Interview[]> = {};

    interviews.forEach((interview) => {
      const date = new Date(interview.scheduledAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(interview);
    });

    // Sort dates and interviews within each date
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, dateInterviews]) => ({
        date,
        interviews: dateInterviews.sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        ),
      }));
  };

  const formatInterviewTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatInterviewDate = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-600';
      case 'CONFIRMED':
        return 'bg-green-600';
      case 'COMPLETED':
        return 'bg-gray-600';
      case 'CANCELLED':
        return 'bg-red-600';
      case 'RESCHEDULED':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TECHNICAL':
        return 'bg-purple-600';
      case 'BEHAVIORAL':
        return 'bg-blue-600';
      case 'PHONE_SCREEN':
        return 'bg-green-600';
      case 'SYSTEM_DESIGN':
        return 'bg-orange-600';
      case 'CODING_CHALLENGE':
        return 'bg-red-600';
      case 'ONSITE':
        return 'bg-indigo-600';
      case 'FINAL_ROUND':
        return 'bg-pink-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400">Loading interviews...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        Failed to load interviews: {String(error)}
      </div>
    );
  }

  const groupedInterviews = groupInterviewsByDate(interviews);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Interview Schedule</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            {interviews.length} interview{interviews.length !== 1 ? 's' : ''}{' '}
            scheduled
          </div>

          {/* View Toggle */}
          <div className="flex border border-gray-600 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📅 Calendar View
            </button>
          </div>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">No interviews scheduled yet</div>
          <p className="text-sm text-gray-500 mb-4">
            Schedule your first interview to start tracking your interview
            process.
          </p>
          <div className="text-xs text-gray-600">
            Use the "📅 Schedule Interview" button on any job card to get
            started.
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <>
              {/* Quick Overview - Next 3 interviews */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-white mb-3">
                  📅 Upcoming Interviews
                </h4>
                <div className="grid gap-3">
                  {interviews.slice(0, 3).map((interview) => (
                    <div
                      key={interview.id}
                      className="p-3 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-bold text-blue-400">
                          {new Date(interview.scheduledAt).getDate()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(interview.scheduledAt).toLocaleDateString(
                            [],
                            {
                              month: 'short',
                            },
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {interview.title}
                        </div>
                        <div className="text-sm text-gray-300">
                          {interview.job.title} at {interview.job.company}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatInterviewTime(interview.scheduledAt)} •{' '}
                          {interview.duration} min
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 text-xs text-white rounded ${getTypeColor(
                            interview.type,
                          )}`}
                        >
                          {interview.type.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleEdit(interview)}
                          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-600 hover:bg-blue-600/20 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {interviews.length > 3 && (
                  <div className="text-center mt-3">
                    <button
                      onClick={() =>
                        window.scrollTo({top: 0, behavior: 'smooth'})
                      }
                      className="text-sm text-gray-400 hover:text-gray-300 px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                    >
                      View All {interviews.length} Interviews
                    </button>
                  </div>
                )}
              </div>

              {/* Full List View */}
              <div>
                <h4 className="text-md font-medium text-white mb-3">
                  📋 All Interviews
                </h4>
                <div className="space-y-6">
                  {groupedInterviews.map(({date, interviews}) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
                        <div className="text-2xl font-bold text-white">
                          {new Date(date).getDate()}
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-white">
                            {formatInterviewDate(interviews[0].scheduledAt)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(date).toLocaleDateString([], {
                              weekday: 'long',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <div className="text-sm text-gray-300 bg-gray-600 px-2 py-1 rounded">
                          {interviews.length} interview
                          {interviews.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="space-y-3 ml-4">
                        {interviews.map((interview) => (
                          <div
                            key={interview.id}
                            className="p-4 rounded border border-gray-600 bg-gray-800 hover:bg-gray-750 transition-colors relative"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-white">
                                    {interview.title}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 text-xs text-white rounded ${getTypeColor(
                                      interview.type,
                                    )}`}
                                  >
                                    {interview.type.replace('_', ' ')}
                                  </span>
                                  <span
                                    className={`px-2 py-1 text-xs text-white rounded ${getStatusColor(
                                      interview.status,
                                    )}`}
                                  >
                                    {interview.status}
                                  </span>
                                </div>

                                <div className="text-sm text-gray-300 mb-2">
                                  📋 {interview.job.title} at{' '}
                                  {interview.job.company}
                                </div>

                                <div className="text-sm text-gray-400 mb-3">
                                  🕐{' '}
                                  {formatInterviewTime(interview.scheduledAt)} •{' '}
                                  {interview.duration} minutes
                                  {interview.location &&
                                    ` • 📍 ${interview.location}`}
                                  {interview.participants &&
                                    ` • 👥 ${interview.participants}`}
                                </div>

                                {interview.notes && (
                                  <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded border border-gray-700">
                                    {interview.notes}
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 flex gap-2">
                                <button
                                  onClick={() => handleEdit(interview)}
                                  className="text-sm text-blue-400 hover:text-blue-300 px-3 py-1 rounded border border-blue-600 hover:bg-blue-600/20 transition-colors"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Calendar View */
            <InterviewCalendar
              interviews={interviews}
              onInterviewClick={handleEdit}
            />
          )}
        </>
      )}

      {isModalOpen && selectedJob && (
        <InterviewModal
          open={isModalOpen}
          interview={editingInterview}
          job={selectedJob}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
