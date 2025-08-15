import {useState, useMemo, useEffect} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {updateJob, listJobs} from '../../api';
import type {Job, JobStatus, Resume, Interview} from '../../types';
import {AddJobModal, EditJobModal, ApplicationModal, JobCard} from '../jobs';
import ResumeModal from '../ResumeModal';
import {
  InterviewManager,
  InterviewModal,
  InterviewNotifications,
  InterviewBanner,
} from '../interviews';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import type {DropResult} from '@hello-pangea/dnd';
import {
  usePersistentBoolean,
  usePersistentSet,
} from '../../hooks/usePersistentState';

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

interface KanbanViewProps {
  addOpen: boolean;
  onAddClose: () => void;
  interviewManagerOpen: boolean;
  setInterviewManagerOpen: (open: boolean) => void;
  scrollToJobId?: string | null; // New prop for scrolling to specific job
}

export default function KanbanView({
  addOpen,
  onAddClose,
  interviewManagerOpen,
  setInterviewManagerOpen,
  scrollToJobId,
}: KanbanViewProps) {
  const qc = useQueryClient();
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({queryKey: ['jobs'], queryFn: listJobs});

  const [editJob, setEditJob] = useState<Job | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeModalOpen, setResumeModalOpen] = usePersistentBoolean(
    'resumeModalOpen',
    false,
  );
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedJobForInterview, setSelectedJobForInterview] =
    useState<Job | null>(null);
  const [snoozedDeadlines, setSnoozedDeadlines] =
    usePersistentSet<string>('snoozedDeadlines');

  // Scroll to specific job when scrollToJobId changes
  useEffect(() => {
    if (scrollToJobId) {
      const jobElement = document.querySelector(
        `[data-job-id="${scrollToJobId}"]`,
      );
      if (jobElement) {
        // Scroll the job into view with smooth animation
        jobElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });

        // Remove the highlight after a few seconds
        const timer = setTimeout(() => {
          // The highlight will be removed when scrollToJobId changes
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [scrollToJobId]);

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

  // Check if a job has an application (simplified - we'll enhance this later)
  const hasApplication = (job: Job) => {
    // A job has an application if it's been moved beyond SAVED status
    // This means the user has taken action on it
    return job.status !== 'SAVED';
  };

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
    onSuccess: (_data, vars) => {
      // If job was moved to APPLIED, automatically open application modal
      if (vars.status === 'APPLIED') {
        const job = jobs.find((j) => j.id === vars.id);
        if (job) {
          setSelectedJob(job);
          setApplicationModalOpen(true);
        }
      }

      // If job was moved to INTERVIEW, automatically open interview modal
      if (vars.status === 'INTERVIEW') {
        const job = jobs.find((j) => j.id === vars.id);
        if (job) {
          setSelectedJobForInterview(job);
          setInterviewModalOpen(true);
        }
      }
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

  // Track application functionality
  function handleTrackApplication(job: Job) {
    setSelectedJob(job);
    setApplicationModalOpen(true);
  }

  // Schedule interview functionality
  function handleScheduleInterview(job: Job) {
    setSelectedJobForInterview(job);
    setInterviewModalOpen(true);
  }

  // Handle interview notification click
  function handleInterviewNotificationClick(interview: Interview) {
    // Find the full job object from the jobs array
    const fullJob = jobs.find((job) => job.id === interview.jobId);
    if (fullJob) {
      setSelectedJobForInterview(fullJob);
      setInterviewModalOpen(true);
    }
    // TODO: In a future update, we could pre-fill the form with the interview data
  }

  // Unsnooze a specific job
  function unsnoozeJob(jobId: string) {
    setSnoozedDeadlines((prev) => {
      const newSet = new Set(prev);
      newSet.delete(jobId);
      return newSet;
    });
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

  if (isLoading) return <div className="p-4 text-white">Loading…</div>;
  if (error) {
    console.error('Jobs error:', error);
    return (
      <div className="p-4 text-red-600">
        Failed to load jobs. Error: {String(error)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Interview Banner for urgent interviews */}
      <InterviewBanner onInterviewClick={handleInterviewNotificationClick} />

      {/* Interview Notifications */}
      <InterviewNotifications
        onInterviewClick={handleInterviewNotificationClick}
      />

      {/* Horizontal Kanban with drag-and-drop */}
      <div className="w-full overflow-x-auto bg-gray-950 pl-1">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-row flex-nowrap gap-2 pb-4 items-start">
            {COLUMNS.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-1/5 flex-none rounded-xl border border-gray-600 bg-gray-900 shadow-sm transition-colors"
                  >
                    <div
                      className={`border-b border-gray-600 px-4 py-3 text-sm font-semibold rounded-t-xl ${headerColor[status]}`}
                    >
                      {status} ({jobsByStatus[status].length})
                    </div>
                    <div className="p-2 space-y-3 min-h-[400px]">
                      {jobsByStatus[status].length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-8">
                          No jobs
                        </div>
                      ) : (
                        jobsByStatus[status].map((job, index) => (
                          <Draggable
                            key={job.id}
                            draggableId={job.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                data-job-id={job.id}
                                className={
                                  scrollToJobId === job.id
                                    ? 'ring-2 ring-blue-400 ring-opacity-75 animate-pulse'
                                    : ''
                                }
                              >
                                <JobCard
                                  job={job}
                                  onMove={(id, status) =>
                                    moveMutation.mutate({id, status})
                                  }
                                  onEdit={handleEditJob}
                                  onTrackApplication={handleTrackApplication}
                                  onScheduleInterview={handleScheduleInterview}
                                  hasApplication={hasApplication(job)}
                                  isSnoozed={snoozedDeadlines.has(job.id)}
                                  onUnsnooze={() => unsnoozeJob(job.id)}
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

      {/* Modals */}
      <AddJobModal
        open={addOpen}
        onClose={onAddClose}
        onCreated={() => {
          onAddClose();
          qc.invalidateQueries({queryKey: ['jobs']});
        }}
      />

      <EditJobModal
        job={editJob}
        open={!!editJob}
        onClose={handleCloseEdit}
        onUpdated={handleJobUpdated}
      />

      {selectedJob && (
        <ApplicationModal
          open={applicationModalOpen}
          onClose={() => setApplicationModalOpen(false)}
          job={selectedJob}
          resumes={[]} // TODO: Get resumes from API
          onSaved={() => {
            setApplicationModalOpen(false);
            setSelectedJob(null);
            qc.invalidateQueries({queryKey: ['applications']});
          }}
        />
      )}

      <ResumeModal
        resume={selectedResume}
        open={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onSaved={() => {
          setResumeModalOpen(false);
          setSelectedResume(null);
          qc.invalidateQueries({queryKey: ['resumes']});
        }}
      />

      {selectedJobForInterview && (
        <InterviewModal
          open={interviewModalOpen}
          onClose={() => setInterviewModalOpen(false)}
          job={selectedJobForInterview}
          onSaved={() => {
            setInterviewModalOpen(false);
            setSelectedJobForInterview(null);
            qc.invalidateQueries({queryKey: ['interviews']});
          }}
        />
      )}

      {interviewManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setInterviewManagerOpen(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Interview Manager
              </h2>
              <button
                onClick={() => setInterviewManagerOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <InterviewManager scrollToInterviewId={scrollToJobId} />
          </div>
        </div>
      )}
    </div>
  );
}
