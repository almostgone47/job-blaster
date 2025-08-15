import {useState, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {listJobs, updateJob, listApplications, listResumes} from '../api';
import type {Job, JobStatus, Application, Resume, Interview} from '../types';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';
import ApplicationModal from '../components/ApplicationModal';
import ResumeModal from '../components/ResumeModal';
import TemplateManager from '../components/TemplateManager';
import InterviewManager from '../components/InterviewManager';
import InterviewModal from '../components/InterviewModal';
import InterviewNotifications from '../components/InterviewNotifications';
import InterviewBanner from '../components/InterviewBanner';
import JobCard from '../components/JobCard';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import type {DropResult} from '@hello-pangea/dnd';
import {
  usePersistentBoolean,
  usePersistentSet,
} from '../hooks/usePersistentState';

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

  const {data: applications = []} = useQuery({
    queryKey: ['applications'],
    queryFn: listApplications,
  });

  const {data: resumes = []} = useQuery({
    queryKey: ['resumes'],
    queryFn: listResumes,
  });

  const [addOpen, setAddOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeModalOpen, setResumeModalOpen] = usePersistentBoolean(
    'resumeModalOpen',
    false,
  );
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedJobForInterview, setSelectedJobForInterview] =
    useState<Job | null>(null);
  const [interviewManagerOpen, setInterviewManagerOpen] = useState(false);
  const [deadlineAlertsOpen, setDeadlineAlertsOpen] = usePersistentBoolean(
    'deadlineAlertsOpen',
    false,
  );
  const [snoozedJobsModalOpen, setSnoozedJobsModalOpen] = useState(false);
  const [snoozedDeadlines, setSnoozedDeadlines] =
    usePersistentSet<string>('snoozedDeadlines');

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

  // Find application for a specific job
  const getApplicationForJob = (jobId: string): Application | null => {
    return applications.find((app) => app.jobId === jobId) || null;
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

  // Clear all snoozed deadlines
  function clearSnoozedDeadlines() {
    setSnoozedDeadlines(new Set());
  }

  // Unsnooze a specific job
  function unsnoozeJob(jobId: string) {
    setSnoozedDeadlines((prev) => {
      const newSet = new Set(prev);
      newSet.delete(jobId);
      return newSet;
    });
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
        'Deadline',
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
            job.deadline ? new Date(job.deadline).toLocaleDateString() : '',
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
    <div className="min-h-full space-y-4 bg-gray-950">
      {/* Interview Banner for urgent interviews */}
      <InterviewBanner onInterviewClick={handleInterviewNotificationClick} />

      {/* Interview Notifications */}
      <InterviewNotifications
        onInterviewClick={handleInterviewNotificationClick}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="rounded bg-gray-900 border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-800 transition-colors"
          >
            Add Job
          </button>
          <button
            onClick={() => {
              setSelectedResume(null);
              setResumeModalOpen(true);
            }}
            className="rounded border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            Manage Resumes
          </button>
          <button
            onClick={() => setTemplateManagerOpen(true)}
            className="rounded border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            Manage Templates
          </button>
          <button
            onClick={() => setInterviewManagerOpen(true)}
            className="rounded border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            📅 View Interviews
          </button>
        </div>
        <div className="flex gap-2">
          {/* Deadline Alerts Bell */}
          {(() => {
            const now = new Date();
            const urgentDeadlines = jobs.filter((job) => {
              if (!job.deadline || snoozedDeadlines.has(job.id)) return false;
              const deadline = new Date(job.deadline);
              const diffDays = Math.ceil(
                (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );
              return diffDays <= 3; // Show count for overdue, today, tomorrow, and this week
            });

            if (urgentDeadlines.length === 0) return null;

            return (
              <button
                onClick={() => setDeadlineAlertsOpen(true)}
                className="relative rounded border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700 transition-colors"
                title="View deadline alerts"
              >
                🔔
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {urgentDeadlines.length}
                </span>
              </button>
            );
          })()}

          {snoozedDeadlines.size > 0 && (
            <button
              onClick={() => setSnoozedJobsModalOpen(true)}
              className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded flex items-center justify-center hover:bg-gray-700 hover:text-gray-300 transition-colors cursor-pointer"
              title={`View ${snoozedDeadlines.size} snoozed deadline alert${
                snoozedDeadlines.size !== 1 ? 's' : ''
              }`}
            >
              {snoozedDeadlines.size} snoozed alert
              {snoozedDeadlines.size !== 1 ? 's' : ''}
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors"
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
                    <div className="p-2 space-y-3 min-h-[400px]">
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
                                  onTrackApplication={handleTrackApplication}
                                  onScheduleInterview={handleScheduleInterview}
                                  hasApplication={hasApplication(j)}
                                  isSnoozed={snoozedDeadlines.has(j.id)}
                                  onUnsnooze={() => unsnoozeJob(j.id)}
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
      <ApplicationModal
        open={applicationModalOpen && selectedJob !== null}
        job={selectedJob!}
        application={selectedJob ? getApplicationForJob(selectedJob.id) : null}
        resumes={resumes}
        onClose={() => {
          setApplicationModalOpen(false);
          setSelectedJob(null);
        }}
        onSaved={() => {
          qc.invalidateQueries({queryKey: ['jobs']});
          qc.invalidateQueries({queryKey: ['applications']});
          setApplicationModalOpen(false);
          setSelectedJob(null);
        }}
      />
      <ResumeModal
        open={resumeModalOpen}
        resume={selectedResume}
        onClose={() => {
          setResumeModalOpen(false);
          setSelectedResume(null);
        }}
        onSaved={() => {
          qc.invalidateQueries({queryKey: ['resumes']});
          setResumeModalOpen(false);
          setSelectedResume(null);
        }}
      />

      {templateManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Template Manager
              </h2>
              <button
                onClick={() => setTemplateManagerOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <TemplateManager />
          </div>
        </div>
      )}

      {interviewManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Interview Manager
              </h2>
              <button
                onClick={() => setInterviewManagerOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <InterviewManager />
          </div>
        </div>
      )}

      {interviewModalOpen && selectedJobForInterview && (
        <InterviewModal
          open={interviewModalOpen}
          interview={null}
          job={selectedJobForInterview}
          onClose={() => {
            setInterviewModalOpen(false);
            setSelectedJobForInterview(null);
          }}
          onSaved={() => {
            qc.invalidateQueries({queryKey: ['interviews']});
            setInterviewModalOpen(false);
            setSelectedJobForInterview(null);
          }}
        />
      )}

      {/* Deadline Alerts Modal */}
      {(() => {
        const now = new Date();
        const allDeadlines = jobs
          .filter((job) => job.deadline && !snoozedDeadlines.has(job.id))
          .sort(
            (a, b) =>
              new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
          );

        if (allDeadlines.length === 0) return null;

        return (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 ${
              deadlineAlertsOpen ? '' : 'hidden'
            }`}
          >
            <div className="w-full max-w-2xl rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  ⏰ Deadline Alerts
                </h2>
                <div className="flex items-center gap-2">
                  {snoozedDeadlines.size > 0 && (
                    <button
                      onClick={clearSnoozedDeadlines}
                      className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                      title={`Clear ${snoozedDeadlines.size} snoozed alerts`}
                    >
                      Clear Snoozed ({snoozedDeadlines.size})
                    </button>
                  )}
                  <button
                    onClick={() => setDeadlineAlertsOpen(false)}
                    className="text-sm text-gray-400 hover:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allDeadlines.map((job) => {
                  const deadline = new Date(job.deadline!);
                  const diffDays = Math.ceil(
                    (deadline.getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isOverdue = diffDays < 0;
                  const isUrgent = diffDays <= 3;

                  return (
                    <div
                      key={job.id}
                      className={`p-3 rounded border text-sm cursor-pointer hover:bg-gray-700/50 transition-colors ${
                        isOverdue
                          ? 'bg-red-900/20 border-red-600/50 text-red-300'
                          : isUrgent
                          ? 'bg-orange-900/20 border-orange-600/50 text-orange-300'
                          : 'bg-gray-800/50 border-gray-600/50 text-gray-300'
                      }`}
                      onClick={() => {
                        setEditJob(job);
                        setDeadlineAlertsOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-gray-400">{job.company}</div>
                          <div className="mt-1">
                            {isOverdue
                              ? `Overdue by ${Math.abs(diffDays)} day${
                                  Math.abs(diffDays) !== 1 ? 's' : ''
                                }`
                              : diffDays === 0
                              ? 'Due today!'
                              : diffDays === 1
                              ? 'Due tomorrow'
                              : `Due in ${diffDays} days`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="text-xs text-gray-400">
                            {deadline.toLocaleDateString()}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSnoozedDeadlines(
                                (prev) => new Set([...prev, job.id]),
                              );
                            }}
                            className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                            title="Snooze this alert"
                          >
                            Snooze ⏰
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Snoozed Jobs Modal */}
      {snoozedJobsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-2xl rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                🔕 Snoozed Deadline Alerts
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSnoozedDeadlines}
                  className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                  title="Clear all snoozed alerts"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setSnoozedJobsModalOpen(false)}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobs
                .filter((job) => job.deadline && snoozedDeadlines.has(job.id))
                .map((job) => {
                  const deadline = new Date(job.deadline!);
                  const now = new Date();
                  const diffDays = Math.ceil(
                    (deadline.getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isOverdue = diffDays < 0;

                  return (
                    <div
                      key={job.id}
                      className={`p-3 rounded border text-sm cursor-pointer hover:bg-gray-700/50 transition-colors ${
                        isOverdue
                          ? 'bg-red-900/20 border-red-600/50 text-red-300'
                          : 'bg-gray-800/50 border-gray-600/50 text-gray-300'
                      }`}
                      onClick={() => {
                        setEditJob(job);
                        setSnoozedJobsModalOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-gray-400">{job.company}</div>
                          <div className="mt-1">
                            {isOverdue
                              ? `Overdue by ${Math.abs(diffDays)} day${
                                  Math.abs(diffDays) !== 1 ? 's' : ''
                                }`
                              : diffDays === 0
                              ? 'Due today!'
                              : diffDays === 1
                              ? 'Due tomorrow'
                              : `Due in ${diffDays} days`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="text-xs text-gray-400">
                            {deadline.toLocaleDateString()}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              unsnoozeJob(job.id);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                            title="Unsnooze this alert"
                          >
                            Unsnooze 🔔
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
