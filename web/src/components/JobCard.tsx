import {useQuery} from '@tanstack/react-query';
import type {Job, JobStatus, CompanyResearch} from '../types';
import CompanyResearchDisplay from './CompanyResearchDisplay';
import {getCompanyResearch} from '../api';

const ORDER: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

// Helper functions for deadline formatting
function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${
      Math.abs(diffDays) !== 1 ? 's' : ''
    }`;
  } else if (diffDays === 0) {
    return 'Due today!';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else {
    return date.toLocaleDateString();
  }
}

function getDeadlineStyle(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'text-red-400'; // Overdue - red
  } else if (diffDays <= 1) {
    return 'text-orange-400'; // Due today/tomorrow - orange
  } else if (diffDays <= 7) {
    return 'text-yellow-400'; // Due this week - yellow
  } else {
    return 'text-gray-400'; // Due later - gray
  }
}

function nextStatus(s: JobStatus): JobStatus | null {
  const i = ORDER.indexOf(s);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null;
}

function prevStatus(s: JobStatus): JobStatus | null {
  const i = ORDER.indexOf(s);
  return i > 0 ? ORDER[i - 1] : null;
}

export default function JobCard({
  job,
  onMove,
  onEdit,
  onTrackApplication,
  onScheduleInterview,
  hasApplication,
  isSnoozed = false,
  onUnsnooze,
}: {
  job: Job;
  onMove: (id: string, status: JobStatus) => void;
  onEdit: (job: Job) => void;
  onTrackApplication: (job: Job) => void;
  onScheduleInterview: (job: Job) => void;
  hasApplication: boolean;
  isSnoozed?: boolean;
  onUnsnooze?: () => void;
}) {
  // Fetch company research for this job
  const {data: companyResearch} = useQuery({
    queryKey: ['company-research', job.company],
    queryFn: () => getCompanyResearch(job.company),
    enabled: !!job.company,
  });
  const right = nextStatus(job.status);
  const left = prevStatus(job.status);

  // Check if job has urgent deadline for border styling
  // const hasUrgentDeadline =
  //   job.deadline &&
  //   (() => {
  //     const deadline = new Date(job.deadline);
  //     const now = new Date();
  //     const diffDays = Math.ceil(
  //       (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  //     );
  //     return diffDays <= 3; // Overdue, today, tomorrow, or this week
  //   })();

  const getBorderStyle = () => {
    if (!job.deadline) return 'border-gray-600';
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffDays = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return 'border-red-500 shadow-lg shadow-red-500/20'; // Overdue - red with glow
    if (diffDays <= 1)
      return 'border-orange-500 shadow-lg shadow-orange-500/20'; // Due today/tomorrow - orange with glow
    if (diffDays <= 7) return 'border-yellow-500'; // Due this week - yellow
    return 'border-gray-600'; // Due later - normal
  };

  return (
    <div
      className={`rounded-lg border-2 ${getBorderStyle()} bg-gray-800 p-4 shadow-md hover:shadow-lg transition-all cursor-pointer group`}
      onClick={() => onEdit(job)}
    >
      <div className="flex items-start gap-3">
        {job.faviconUrl ? (
          <img
            src={job.faviconUrl}
            className="h-6 w-6 rounded-sm flex-shrink-0"
            alt={`${job.company} logo`}
          />
        ) : (
          <div className="h-6 w-6 rounded-sm bg-gray-600 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-white group-hover:text-blue-300 transition-colors">
            {job.title}
          </div>
          <div className="truncate text-sm text-gray-300">{job.company}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(job);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-400 p-1"
          title="Edit job"
        >
          ✏️
        </button>
      </div>

      {job.notes && (
        <div className="mt-3 p-2 bg-gray-700/50 rounded text-sm text-gray-300 border-l-2 border-blue-500">
          {job.notes}
        </div>
      )}

      {isSnoozed && (
        <div className="mt-3 p-2 bg-gray-700/50 rounded text-sm text-gray-400 border-l-2 border-gray-500 flex items-center justify-between">
          <span>🔕 Snoozed - Not showing in urgent alerts</span>
          {onUnsnooze && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnsnooze();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
              title="Show in urgent alerts again"
            >
              Wake Up
            </button>
          )}
        </div>
      )}

      {/* Display metadata if available */}
      {(job.salary || job.location || job.tags.length > 0 || job.deadline) && (
        <div className="mt-3 space-y-2">
          {job.salary && (
            <div className="text-xs text-green-400 font-medium">
              💰 {job.salary}
            </div>
          )}
          {job.location && (
            <div className="text-xs text-blue-400">📍 {job.location}</div>
          )}
          {job.deadline && (
            <div
              className={`text-xs font-medium ${getDeadlineStyle(
                job.deadline,
              )}`}
            >
              ⏰ {formatDeadline(job.deadline)}
            </div>
          )}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full border border-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Company Research Display */}
      {companyResearch && (
        <CompanyResearchDisplay research={companyResearch} compact={true} />
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {!hasApplication && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrackApplication(job);
            }}
            className="rounded-md bg-purple-600 px-3 py-1.5 text-xs text-white font-medium hover:bg-purple-700 transition-colors"
          >
            Track Application
          </button>
        )}

        {hasApplication && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrackApplication(job);
            }}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Application Details
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onScheduleInterview(job);
          }}
          className="rounded-md bg-orange-600 px-3 py-1.5 text-xs text-white font-medium hover:bg-orange-700 transition-colors"
        >
          📅 Schedule Interview
        </button>

        <div className="ml-auto flex gap-1">
          {left && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove(job.id, left);
              }}
              className="rounded border border-gray-500 px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              title={`Move to ${left}`}
            >
              ← {left}
            </button>
          )}
          {right && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (right === 'APPLIED') {
                  // If moving to APPLIED, move the job AND open application modal
                  onMove(job.id, right);
                  // The modal will open automatically via the onSuccess callback in Dashboard
                } else {
                  // For other statuses, just move the job
                  onMove(job.id, right);
                }
              }}
              className="rounded bg-green-600 px-2 py-1 text-xs text-white font-medium hover:bg-green-700 transition-colors"
              title={`Move to ${right}`}
            >
              {right} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
