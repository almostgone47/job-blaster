import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {listJobs, updateJob} from '../api';
import JobCard from '../components/JobCard';
import AddJobModal from '../components/AddJobModal';
import type {Job, JobStatus} from '../types';

const COLUMNS: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

export default function Dashboard() {
  const qc = useQueryClient();
  const {data, isLoading, error} = useQuery({
    queryKey: ['jobs'],
    queryFn: listJobs,
  });

  const [open, setOpen] = useState(false);

  const moveMutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: JobStatus}) =>
      updateJob(id, {status}),
    onMutate: async (vars) => {
      await qc.cancelQueries({queryKey: ['jobs']});
      const prev = qc.getQueryData<Job[]>(['jobs']);
      if (prev) {
        qc.setQueryData<Job[]>(
          ['jobs'],
          prev.map((j) => (j.id === vars.id ? {...j, status: vars.status} : j)),
        );
      }
      return {prev};
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['jobs'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({queryKey: ['jobs']}),
  });

  function onMove(id: string, status: JobStatus) {
    moveMutation.mutate({id, status});
  }

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Failed to load jobs.</div>;

  const jobsByStatus = Object.fromEntries(
    COLUMNS.map((s) => [s, (data ?? []).filter((j) => j.status === s)]),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white"
        >
          Add Job
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((status) => (
          <div key={status} className="rounded-xl border bg-white">
            <div className="border-b px-3 py-2 text-sm font-medium">
              {status}
            </div>
            <div className="space-y-2 p-3">
              {jobsByStatus[status].length === 0 ? (
                <div className="text-xs text-gray-500">No items</div>
              ) : (
                jobsByStatus[status].map((j: Job) => (
                  <JobCard key={j.id} job={j} onMove={onMove} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <AddJobModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => qc.invalidateQueries({queryKey: ['jobs']})}
      />
    </div>
  );
}
