import {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Interview} from '../types';
import {listInterviews} from '../api';

interface InterviewBannerProps {
  onInterviewClick: (interview: Interview) => void;
}

export default function InterviewBanner({
  onInterviewClick,
}: InterviewBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [urgentInterviews, setUrgentInterviews] = useState<Interview[]>([]);

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
    const next6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // Filter for interviews in the next 6 hours that are scheduled or confirmed
    const urgent = interviews.filter((interview) => {
      const interviewTime = new Date(interview.scheduledAt);
      const isUrgent = interviewTime >= now && interviewTime <= next6Hours;
      const isActive =
        interview.status === 'SCHEDULED' || interview.status === 'CONFIRMED';
      return isUrgent && isActive;
    });

    // Sort by time (earliest first)
    urgent.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

    if (urgent.length > 0) {
      setUrgentInterviews(urgent);
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

  const getUrgencyColor = (scheduledAt: string) => {
    const now = new Date();
    const interviewTime = new Date(scheduledAt);
    const diffMs = interviewTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'bg-red-600 border-red-500';
    if (diffHours < 3) return 'bg-orange-600 border-orange-500';
    return 'bg-yellow-600 border-yellow-500';
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 border-b-4 border-red-500 p-4 text-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🚨</div>
            <div>
              <h2 className="text-lg font-bold">
                URGENT: {urgentInterviews.length} Interview
                {urgentInterviews.length !== 1 ? 's' : ''} Coming Up Soon!
              </h2>
              <p className="text-sm opacity-90">
                You have interviews scheduled in the next 6 hours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm opacity-90">Next interview in:</div>
              <div className="text-2xl font-bold">
                {urgentInterviews.length > 0 &&
                  formatTimeUntil(urgentInterviews[0].scheduledAt)}
              </div>
            </div>

            <button
              onClick={() => {
                if (urgentInterviews.length > 0) {
                  onInterviewClick(urgentInterviews[0]);
                }
              }}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Quick preview of urgent interviews */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {urgentInterviews.slice(0, 3).map((interview) => (
            <div
              key={interview.id}
              className={`p-3 rounded border-2 ${getUrgencyColor(
                interview.scheduledAt,
              )} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => onInterviewClick(interview)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">
                    {interview.title}
                  </div>
                  <div className="text-sm opacity-90">
                    {interview.job.title} at {interview.job.company}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatInterviewTime(interview.scheduledAt)} •{' '}
                    {interview.duration} min
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatTimeUntil(interview.scheduledAt)}
                  </div>
                  <div className="text-xs opacity-75">until</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {urgentInterviews.length > 3 && (
          <div className="mt-3 text-center">
            <div className="text-sm opacity-90">
              +{urgentInterviews.length - 3} more urgent interview
              {urgentInterviews.length - 3 !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
