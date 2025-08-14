import {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Interview} from '../types';
import {listInterviews} from '../api';

interface InterviewNotificationsProps {
  onInterviewClick: (interview: Interview) => void;
}

export default function InterviewNotifications({
  onInterviewClick,
}: InterviewNotificationsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);

  // Fetch all interviews
  const {data: interviews = []} = useQuery({
    queryKey: ['interviews'],
    queryFn: listInterviews,
  });

  useEffect(() => {
    if (interviews.length === 0) {
      setIsVisible(false);
      return;
    }

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Filter for interviews in the next 24 hours that are scheduled or confirmed
    const upcoming = interviews.filter((interview) => {
      const interviewTime = new Date(interview.scheduledAt);
      const isUpcoming = interviewTime >= now && interviewTime <= next24Hours;
      const isActive =
        interview.status === 'SCHEDULED' || interview.status === 'CONFIRMED';
      return isUpcoming && isActive;
    });

    // Sort by time (earliest first)
    upcoming.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

    if (upcoming.length > 0) {
      setUpcomingInterviews(upcoming);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [interviews]);

  if (!isVisible) return null;

  const formatTimeUntil = (scheduledAt: string) => {
    const now = new Date();
    const interviewTime = new Date(scheduledAt);
    const diffMs = interviewTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`;
    } else {
      return 'Now';
    }
  };

  const formatInterviewTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500';
      case 'CONFIRMED':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (scheduledAt: string) => {
    const now = new Date();
    const interviewTime = new Date(scheduledAt);
    const diffMs = interviewTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'border-red-500 bg-red-900/20';
    if (diffHours < 3) return 'border-orange-500 bg-orange-900/20';
    if (diffHours < 6) return 'border-yellow-500 bg-yellow-900/20';
    return 'border-blue-500 bg-blue-900/20';
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🔔 Upcoming Interviews
            <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">
              {upcomingInterviews.length}
            </span>
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {upcomingInterviews.map((interview) => (
            <div
              key={interview.id}
              className={`p-3 rounded border ${getUrgencyColor(
                interview.scheduledAt,
              )} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => onInterviewClick(interview)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {interview.title}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs text-white rounded ${getStatusColor(
                        interview.status,
                      )}`}
                    >
                      {interview.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300 mb-1">
                    📋 {interview.job.title} at {interview.job.company}
                  </div>

                  <div className="text-sm text-gray-400">
                    🕐 {formatInterviewTime(interview.scheduledAt)} •{' '}
                    {interview.duration} min
                    {interview.location && ` • 📍 ${interview.location}`}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {formatTimeUntil(interview.scheduledAt)}
                  </div>
                  <div className="text-xs text-gray-400">until</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="text-xs text-gray-400 text-center">
            Click on any interview to view/edit details
          </div>
        </div>
      </div>
    </div>
  );
}
