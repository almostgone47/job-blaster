import type {Job, JobStatus} from '../types';

const ORDER: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

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
  hasApplication,
}: {
  job: Job;
  onMove: (id: string, status: JobStatus) => void;
  onEdit: (job: Job) => void;
  onTrackApplication: (job: Job) => void;
  hasApplication: boolean;
}) {
  const right = nextStatus(job.status);
  const left = prevStatus(job.status);

  return (
    <div
      className="rounded-lg border border-gray-600 bg-gray-800 p-4 shadow-md hover:shadow-lg transition-all cursor-pointer group"
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

      {/* Display metadata if available */}
      {(job.salary || job.location || job.tags.length > 0) && (
        <div className="mt-3 space-y-2">
          {job.salary && (
            <div className="text-xs text-green-400 font-medium">
              💰 {job.salary}
            </div>
          )}
          {job.location && (
            <div className="text-xs text-blue-400">📍 {job.location}</div>
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
