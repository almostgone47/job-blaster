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
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2">
        {job.faviconUrl ? (
          <img src={job.faviconUrl} className="h-5 w-5 rounded-sm" />
        ) : (
          <div className="h-5 w-5 rounded-sm bg-gray-200" />
        )}
        <div className="min-w-0">
          <div className="truncate font-medium">{job.title}</div>
          <div className="truncate text-sm text-gray-600">{job.company}</div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <a
          href={job.url}
          target="_blank"
          className="text-xs text-blue-600 hover:underline"
        >
          Open
        </a>
        {job.status === 'SAVED' && (
          <button
            onClick={() => onMarkApplied(job.id)}
            className="rounded bg-green-600 px-2 py-1 text-xs text-white"
          >
            Mark Applied
          </button>
        )}
        <div className="ml-auto flex gap-2">
          {left && (
            <button
              onClick={() => onMove(job.id, left)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              title={`Move to ${left}`}
            >
              ← {left}
            </button>
          )}
          {right && (
            <button
              onClick={() => onMove(job.id, right)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
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
