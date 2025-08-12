import {useState, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {listJobs, updateJob, createApplication} from '../api';
import type {Job, JobStatus} from '../types';
import AddJobModal from '../components/AddJobModal';
import QuickApplyModal from '../components/QuickApplyModal';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import type {DropResult} from '@hello-pangea/dnd';

const COLUMNS: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

export default function Dashboard() {
  const qc = useQueryClient();
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({queryKey: ['jobs'], queryFn: listJobs});

  const [addOpen, setAddOpen] = useState(false);
  const [applyForJobId, setApplyForJobId] = useState<string | null>(null);

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

  // Create application + auto-move to APPLIED
  const applyMutation = useMutation({
    mutationFn: ({jobId, coverNote}: {jobId: string; coverNote?: string}) =>
      createApplication({jobId, coverNote}),
    onSuccess: () => qc.invalidateQueries({queryKey: ['jobs']}),
  });

  function onMarkApplied(jobId: string) {
    setApplyForJobId(jobId);
  }
  async function confirmApply(coverNote?: string) {
    if (!applyForJobId) return;
    await applyMutation.mutateAsync({jobId: applyForJobId, coverNote});
    setApplyForJobId(null);
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

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (error)
    return <div className="p-4 text-red-600">Failed to load jobs.</div>;

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <div className="flex gap-2">
          {/* You can wire Export CSV later */}
          <button className="rounded border px-3 py-1.5 text-sm">
            Export CSV
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white"
          >
            Add Job
          </button>
        </div>
      </div>

      {/* Horizontal Kanban with drag-and-drop */}
      <div className="w-full overflow-x-auto border-2 border-red-500 bg-yellow-100 p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-container pb-4">
            {COLUMNS.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column rounded-xl border-2 border-blue-500 bg-gray-50 shadow-sm transition-colors ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50 border-blue-300'
                        : ''
                    }`}
                  >
                    <div className="border-b border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 rounded-t-xl">
                      {status} ({jobsByStatus[status].length})
                    </div>
                    <div className="p-4 space-y-3 min-h-[400px]">
                      {jobsByStatus[status].length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-8">
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
                                className={`rounded-lg border border-gray-200 bg-white p-4 shadow-md hover:shadow-lg transition-all ${
                                  dragSnapshot.isDragging
                                    ? 'opacity-75 rotate-2 shadow-xl'
                                    : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {j.faviconUrl ? (
                                    <img
                                      src={j.faviconUrl}
                                      className="h-6 w-6 rounded-sm flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="h-6 w-6 rounded-sm bg-gray-200 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium text-gray-900">
                                      {j.title}
                                    </div>
                                    <div className="truncate text-sm text-gray-600">
                                      {j.company}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                  <a
                                    href={j.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                  >
                                    Open Job
                                  </a>
                                  {j.status === 'SAVED' && (
                                    <button
                                      onClick={() => onMarkApplied(j.id)}
                                      className="ml-auto rounded-md bg-green-600 px-3 py-1.5 text-xs text-white font-medium hover:bg-green-700 transition-colors"
                                    >
                                      Mark Applied
                                    </button>
                                  )}
                                </div>
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
      <QuickApplyModal
        open={applyForJobId !== null}
        onClose={() => setApplyForJobId(null)}
        onSubmit={(note) => confirmApply(note)}
      />
    </div>
  );
}
