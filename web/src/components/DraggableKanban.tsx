import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import type {DropResult} from '@hello-pangea/dnd';
import type {Job, JobStatus} from '../types';
import JobCard from './JobCard';

const COLUMNS: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

interface DraggableKanbanProps {
  jobs: Job[];
  onMove: (id: string, status: JobStatus) => void;
  onMarkApplied: (id: string) => void;
}

export default function DraggableKanban({
  jobs,
  onMove,
  onMarkApplied,
}: DraggableKanbanProps) {
  const jobsByStatus = Object.fromEntries(
    COLUMNS.map((s) => [s, jobs.filter((j) => j.status === s)]),
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const {draggableId, destination} = result;
    const newStatus = destination.droppableId as JobStatus;

    onMove(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <div
            key={status}
            className="flex-shrink-0 w-80 rounded-xl border border-gray-200 bg-gray-100 shadow-sm"
          >
            <div className="border-b border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 rounded-t-xl">
              {status} ({jobsByStatus[status].length})
            </div>
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-[400px] ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {jobsByStatus[status].length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8">
                      No jobs
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobsByStatus[status].map((job, index) => (
                        <Draggable
                          key={job.id}
                          draggableId={job.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging ? 'opacity-75 rotate-2' : ''
                              }`}
                            >
                              <JobCard
                                job={job}
                                onMove={onMove}
                                onMarkApplied={onMarkApplied}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
