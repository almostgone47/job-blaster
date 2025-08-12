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
  onMarkApplied,
}: {
  job: Job;
  onMove: (id: string, status: JobStatus) => void;
  onMarkApplied: (id: string) => void;
}) {
  const right = nextStatus(job.status);
  const left = prevStatus(job.status);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        {job.faviconUrl ? (
          <img
            src={job.faviconUrl}
            className="h-6 w-6 rounded-sm flex-shrink-0"
          />
        ) : (
          <div className="h-6 w-6 rounded-sm bg-gray-200 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-gray-900">{job.title}</div>
          <div className="truncate text-sm text-gray-600">{job.company}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          Open Job
        </a>
        {job.status === 'SAVED' && (
          <button
            onClick={() => onMarkApplied(job.id)}
            className="rounded-md bg-green-600 px-3 py-1.5 text-xs text-white font-medium hover:bg-green-700 transition-colors"
          >
            Mark Applied
          </button>
        )}
        <div className="ml-auto flex gap-1">
          {left && (
            <button
              onClick={() => onMove(job.id, left)}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              title={`Move to ${left}`}
            >
              ← {left}
            </button>
          )}
          {right && (
            <button
              onClick={() => onMove(job.id, right)}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
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
