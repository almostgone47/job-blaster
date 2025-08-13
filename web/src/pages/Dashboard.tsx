import {useState, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {listJobs, updateJob} from '../api';
import type {Job, JobStatus} from '../types';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';
import JobCard from '../components/JobCard';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import type {DropResult} from '@hello-pangea/dnd';

const COLUMNS: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

const headerColor: Record<JobStatus, string> = {
  SAVED: 'bg-blue-500 ',
  APPLIED: 'bg-green-500 ',
  INTERVIEW: 'bg-yellow-500 text-black',
  OFFER: 'bg-purple-500 ',
  REJECTED: 'bg-red-500 ',
};

export default function Dashboard() {
  const qc = useQueryClient();
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({queryKey: ['jobs'], queryFn: listJobs});

  const [addOpen, setAddOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);

  // Group jobs by status for quick render
  const jobsByStatus = useMemo(() => {
    const map: Record<JobStatus, Job[]> = {
      SAVED: [],
      APPLIED: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
    };
    for (const j of jobs) map[j.status].push(j);
    return map;
  }, [jobs]);

  // Move job (optimistic)
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
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['jobs'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({queryKey: ['jobs']}),
  });

  // Edit job functionality
  function handleEditJob(job: Job) {
    setEditJob(job);
  }

  function handleCloseEdit() {
    setEditJob(null);
  }

  function handleJobUpdated() {
    qc.invalidateQueries({queryKey: ['jobs']});
  }

  // CSV Export functionality
  const [exporting, setExporting] = useState(false);

  async function handleExportCSV() {
    if (jobs.length === 0) return;

    setExporting(true);
    try {
      // Create CSV content
      const headers = [
        'Title',
        'Company',
        'Status',
        'URL',
        'Source',
        'Location',
        'Salary',
        'Tags',
        'Notes',
        'Created Date',
        'Last Activity',
      ];

      const csvContent = [
        headers.join(','),
        ...jobs.map((job) =>
          [
            `"${job.title.replace(/"/g, '""')}"`,
            `"${job.company.replace(/"/g, '""')}"`,
            job.status,
            `"${job.url}"`,
            `"${job.source || ''}"`,
            `"${job.location || ''}"`,
            `"${job.salary || ''}"`,
            `"${job.tags.join('; ') || ''}"`,
            `"${job.notes || ''}"`,
            new Date(job.createdAt).toLocaleDateString(),
            new Date(job.lastActivityAt).toLocaleDateString(),
          ].join(','),
        ),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `job-applications-${new Date().toISOString().split('T')[0]}.csv`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      // You could add a toast notification here
    } finally {
      setExporting(false);
    }
  }

  // Drag handler
  function onDragEnd(result: DropResult) {
    const {destination, source, draggableId} = result;
    if (!destination) return;
    const destStatus = destination.droppableId as JobStatus;
    const sourceStatus = source.droppableId as JobStatus;
    if (destStatus === sourceStatus && destination.index === source.index)
      return;
    moveMutation.mutate({id: draggableId, status: destStatus});
  }

  if (isLoading) return <div className="p-4 ">Loading…</div>;
  if (error) {
    console.error('Jobs error:', error);
    return (
      <div className="p-4 text-red-600">
        Failed to load jobs. Error: {String(error)}
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-4 bg-gray-950 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold ">Dashboard</h2>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded bg-blue-500 px-3 py-1.5 text-sm "
          >
            Add Job
          </button>
        </div>
        <div className="flex gap-2">
          {/* You can wire Export CSV later */}
          <button
            onClick={handleExportCSV}
            className="rounded border px-3 py-1.5 text-sm"
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Horizontal Kanban with drag-and-drop */}
      <div className="w-full overflow-x-auto bg-gray-950 pl-1">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-row flex-nowrap gap-2 pb-4 items-start">
            {COLUMNS.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`w-1/5 flex-none rounded-xl border border-gray-600 bg-gray-900 shadow-sm transition-colors ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-900 border-blue-300'
                        : ''
                    }`}
                  >
                    <div
                      className={`border-b border-gray-600 px-4 py-3 text-sm font-semibold rounded-t-xl ${headerColor[status]}`}
                      style={{
                        backgroundColor:
                          status === 'SAVED'
                            ? '#3b82f6'
                            : status === 'APPLIED'
                            ? '#10b981'
                            : status === 'INTERVIEW'
                            ? '#f59e0b'
                            : status === 'OFFER'
                            ? '#8b5cf6'
                            : '#ef4444',
                        color: 'white',
                      }}
                    >
                      {status} ({jobsByStatus[status].length})
                    </div>
                    <div className="p-4 space-y-3 min-h-[400px]">
                      {jobsByStatus[status].length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-8">
                          No jobs
                        </div>
                      ) : (
                        jobsByStatus[status].map((j, index) => (
                          <Draggable
                            draggableId={j.id}
                            index={index}
                            key={j.id}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`${
                                  dragSnapshot.isDragging
                                    ? 'opacity-75 rotate-2'
                                    : ''
                                }`}
                              >
                                <JobCard
                                  job={j}
                                  onEdit={handleEditJob}
                                  onMove={(id, status) =>
                                    moveMutation.mutate({id, status})
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      <AddJobModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => qc.invalidateQueries({queryKey: ['jobs']})}
      />
      <EditJobModal
        open={!!editJob}
        job={editJob}
        onClose={handleCloseEdit}
        onUpdated={handleJobUpdated}
      />
    </div>
  );
}
