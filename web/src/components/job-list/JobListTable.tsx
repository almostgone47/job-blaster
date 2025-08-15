import {useState, useMemo} from 'react';
import type {Job, Application, Interview, SalaryOffer} from '../../types';
import type {JobListFilters} from '../../hooks/useJobListFilters';
import {EditJobModal, ApplicationModal} from '../jobs';
import InterviewModal from '../interviews/InterviewModal';

interface JobListTableProps {
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  salaryOffers: SalaryOffer[];
  filters: JobListFilters;
  isLoading?: boolean;
}

type SortField = 'alerts' | 'company' | 'title' | 'status' | 'appliedAt';
type SortDirection = 'asc' | 'desc';

interface JobWithDetails extends Job {
  application?: Application;
  nextInterview?: Interview;
  salaryOffer?: SalaryOffer;
  alerts: {
    hasDeadline: boolean;
    hasFollowUp: boolean;
    hasInterview: boolean;
    isOverdue: boolean;
    priority: number;
  };
}

export default function JobListTable({
  jobs,
  applications,
  interviews,
  salaryOffers,
  filters,
  isLoading = false,
}: JobListTableProps) {
  const [sortField, setSortField] = useState<SortField>('alerts');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );

  // Enrich jobs with related data and alerts
  const enrichedJobs = useMemo((): JobWithDetails[] => {
    return jobs.map((job) => {
      const application = applications.find((app) => app.jobId === job.id);
      const nextInterview = interviews
        .filter((int) => int.jobId === job.id && int.status === 'SCHEDULED')
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        )[0];
      const salaryOffer = salaryOffers.find((offer) => offer.jobId === job.id);

      // Calculate alerts and priority
      const now = new Date();
      const hasDeadline = !!job.deadline;
      const hasFollowUp = application?.nextAction
        ? new Date(application.nextAction) <= now
        : false;
      const hasInterview = !!nextInterview;
      const isOverdue =
        hasDeadline && job.deadline ? new Date(job.deadline) < now : false;

      // Priority: 0 = no alerts, higher = more urgent
      let priority = 0;
      if (isOverdue) priority += 100;
      if (hasFollowUp) priority += 50;
      if (hasDeadline && !isOverdue) priority += 25;
      if (hasInterview) priority += 10;

      return {
        ...job,
        application,
        nextInterview,
        salaryOffer,
        alerts: {
          hasDeadline,
          hasFollowUp,
          hasInterview,
          isOverdue,
          priority,
        },
      };
    });
  }, [jobs, applications, interviews, salaryOffers]);

  // Apply filters
  const filteredJobs = useMemo(() => {
    return enrichedJobs.filter((job) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(job.status)) {
        return false;
      }

      // Company filter
      if (
        filters.company &&
        !job.company.toLowerCase().includes(filters.company.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const appliedDate = job.application?.appliedAt || job.createdAt;
        const date = new Date(appliedDate);

        if (filters.dateFrom && date < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters.dateTo && date > new Date(filters.dateTo)) {
          return false;
        }
      }

      // Remote filter
      if (filters.isRemote !== null && job.isRemote !== filters.isRemote) {
        return false;
      }

      // Location filters
      if (
        filters.locationCity &&
        job.locationCity &&
        !job.locationCity
          .toLowerCase()
          .includes(filters.locationCity.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.locationState &&
        job.locationState &&
        !job.locationState
          .toLowerCase()
          .includes(filters.locationState.toLowerCase())
      ) {
        return false;
      }

      // Salary filters
      if (
        filters.salaryMin &&
        job.salaryMin &&
        job.salaryMin < parseInt(filters.salaryMin)
      ) {
        return false;
      }
      if (
        filters.salaryMax &&
        job.salaryMax &&
        job.salaryMax > parseInt(filters.salaryMax)
      ) {
        return false;
      }

      return true;
    });
  }, [enrichedJobs, filters]);

  // Apply sorting
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      let aValue: string | Date | number, bValue: string | Date | number;

      switch (sortField) {
        case 'alerts':
          aValue = a.alerts.priority;
          bValue = b.alerts.priority;
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'appliedAt':
          aValue = new Date(a.application?.appliedAt || a.createdAt);
          bValue = new Date(b.application?.appliedAt || b.createdAt);
          break;

        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredJobs, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntil = (dateString: string) => {
    const now = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return '';
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return '';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SAVED: 'bg-blue-500',
      APPLIED: 'bg-green-500',
      INTERVIEW: 'bg-yellow-500 text-black',
      OFFER: 'bg-purple-500',
      REJECTED: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      SAVED: '💾',
      APPLIED: '📝',
      INTERVIEW: '🎯',
      OFFER: '💰',
      REJECTED: '❌',
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const getAlertIcon = (alerts: JobWithDetails['alerts']) => {
    if (alerts.isOverdue) return '🔴';
    if (alerts.hasFollowUp) return '🟡';
    if (alerts.hasDeadline) return '🟠';
    if (alerts.hasInterview) return '🔵';
    return '⚪';
  };

  const getAlertColor = (alerts: JobWithDetails['alerts']) => {
    if (alerts.isOverdue) return 'text-red-400';
    if (alerts.hasFollowUp) return 'text-yellow-400';
    if (alerts.hasDeadline) return 'text-orange-400';
    if (alerts.hasInterview) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getAlertTooltip = (alerts: JobWithDetails['alerts']) => {
    const messages = [];
    if (alerts.isOverdue) messages.push('Deadline overdue');
    if (alerts.hasFollowUp) messages.push('Follow-up due');
    if (alerts.hasDeadline && !alerts.isOverdue)
      messages.push('Deadline approaching');
    if (alerts.hasInterview) messages.push('Interview scheduled');
    return messages.length > 0 ? messages.join(', ') : 'No alerts';
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setEditJob(job);
  };

  const handleInterviewClick = (job: Job) => {
    setSelectedJob(job);
    setSelectedInterview(null);
    setInterviewModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-600 p-4">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sortedJobs.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          No jobs found matching your filters
        </div>
        <button
          onClick={() => {
            /* TODO: Add job functionality */
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Add Job
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
        {/* Alerts Summary */}
        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Alerts Summary:</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="text-red-400">🔴</span>
                  <span className="text-gray-300">
                    {sortedJobs.filter((job) => job.alerts.isOverdue).length}{' '}
                    Overdue
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">🟡</span>
                  <span className="text-gray-300">
                    {sortedJobs.filter((job) => job.alerts.hasFollowUp).length}{' '}
                    Follow-ups
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-orange-400">🟠</span>
                  <span className="text-gray-300">
                    {
                      sortedJobs.filter(
                        (job) =>
                          job.alerts.hasDeadline && !job.alerts.isOverdue,
                      ).length
                    }{' '}
                    Deadlines
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-400">🔵</span>
                  <span className="text-gray-300">
                    {sortedJobs.filter((job) => job.alerts.hasInterview).length}{' '}
                    Interviews
                  </span>
                </span>
              </div>
            </div>
            <div className="text-gray-400">
              Total:{' '}
              {sortedJobs.filter((job) => job.alerts.priority > 0).length} jobs
              with alerts
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th
                  className="px-2 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort('alerts')}
                  title="Click to sort by alert priority"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>🚨</span>
                    {sortField === 'alerts' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort('company')}
                >
                  Company
                  {sortField === 'company' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort('title')}
                >
                  Title
                  {sortField === 'title' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort('appliedAt')}
                >
                  Applied Date
                  {sortField === 'appliedAt' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Next Important Date
                </th>
                {salaryOffers.length > 0 && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Offer
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Salary
                </th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {sortedJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`hover:bg-gray-700 transition-colors cursor-pointer ${
                    job.alerts.priority > 0
                      ? 'border-l-4 border-l-red-500 bg-red-900/10'
                      : ''
                  }`}
                  onClick={() => handleJobClick(job)}
                >
                  <td className="px-2 py-3">
                    <div
                      className="flex items-center justify-center"
                      title={getAlertTooltip(job.alerts)}
                    >
                      <span className={`text-lg ${getAlertColor(job.alerts)}`}>
                        {getAlertIcon(job.alerts)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {job.faviconUrl && (
                        <img
                          src={job.faviconUrl}
                          alt=""
                          className="w-5 h-5 rounded"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {job.company}
                        </span>
                        {job.source && (
                          <span className="text-xs text-gray-400">
                            via {job.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-white font-medium">{job.title}</div>
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {job.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{job.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        job.status,
                      )}`}
                    >
                      <span>{getStatusIcon(job.status)}</span>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>
                          {job.application?.appliedAt
                            ? formatDate(job.application.appliedAt)
                            : formatDate(job.createdAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.application?.appliedAt
                          ? `${getDaysUntil(
                              job.application.appliedAt,
                            )} days ago`
                          : `${getDaysUntil(job.createdAt)} days ago`}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {(() => {
                      // Priority: Future events only, with smart ordering
                      const now = new Date();

                      // Check for upcoming interview (most important future event)
                      if (job.nextInterview) {
                        const interviewDate = new Date(
                          job.nextInterview.scheduledAt,
                        );
                        if (interviewDate > now) {
                          return (
                            <div className="text-blue-400">
                              <div className="flex items-center gap-1">
                                <span>🎯</span>
                                <span className="text-xs">Interview</span>
                              </div>
                              <div className="text-sm">
                                {formatDate(job.nextInterview.scheduledAt)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {job.nextInterview.type}
                              </div>
                            </div>
                          );
                        }
                      }

                      // Check for upcoming deadline
                      if (job.deadline) {
                        const deadlineDate = new Date(job.deadline);
                        if (deadlineDate > now) {
                          const daysUntil = getDaysUntil(job.deadline);
                          return (
                            <div className="text-orange-400">
                              <div className="flex items-center gap-1">
                                <span>⏰</span>
                                <span className="text-xs">
                                  {daysUntil <= 3 ? 'Urgent' : 'Due'}
                                </span>
                              </div>
                              <div className="text-sm">
                                {formatDate(job.deadline)}
                              </div>
                            </div>
                          );
                        }
                      }

                      // Check for upcoming follow-up
                      if (job.application?.nextAction) {
                        const followUpDate = new Date(
                          job.application.nextAction,
                        );
                        if (followUpDate > now) {
                          return (
                            <div className="text-yellow-400">
                              <div className="flex items-center gap-1">
                                <span>📞</span>
                                <span className="text-xs">Follow-up</span>
                              </div>
                              <div className="text-sm">
                                {formatDate(job.application.nextAction)}
                              </div>
                            </div>
                          );
                        }
                      }

                      // Check for overdue items (past but still need attention)
                      if (job.alerts.isOverdue) {
                        return (
                          <div className="text-red-400">
                            <div className="flex items-center gap-1">
                              <span>⏰</span>
                              <span className="text-xs">Overdue</span>
                            </div>
                            <div className="text-sm">
                              {formatDate(job.deadline!)}
                            </div>
                          </div>
                        );
                      }

                      if (job.alerts.hasFollowUp) {
                        return (
                          <div className="text-yellow-400">
                            <div className="flex items-center gap-1">
                              <span>📞</span>
                              <span className="text-xs">Follow-up Due</span>
                            </div>
                            <div className="text-sm">
                              {formatDate(job.application!.nextAction!)}
                            </div>
                          </div>
                        );
                      }

                      return <span className="text-gray-500">-</span>;
                    })()}
                  </td>
                  {salaryOffers.length > 0 && (
                    <td className="px-4 py-3 text-gray-300">
                      {job.salaryOffer ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span className="text-green-400">Yes</span>
                          </div>
                          <div className="text-xs">
                            ${(job.salaryOffer.amount / 100).toLocaleString()}
                          </div>
                          {job.salaryOffer.expiresAt && (
                            <div className="text-xs text-gray-500">
                              Expires: {formatDate(job.salaryOffer.expiresAt)}
                              {getDaysUntil(job.salaryOffer.expiresAt) < 0 && (
                                <div className="text-red-500">Expired</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-300">
                    <div className="space-y-1">
                      {job.locationCity && job.locationState && (
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>
                            {job.locationCity}, {job.locationState}
                          </span>
                        </div>
                      )}
                      {job.isRemote && (
                        <div className="flex items-center gap-1">
                          <span>🏠</span>
                          <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                            Remote
                          </span>
                        </div>
                      )}
                      {!job.locationCity && !job.isRemote && (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatSalary(job.salaryMin, job.salaryMax) ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span>💵</span>
                          <span>
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </div>
                        {job.salaryType && (
                          <div className="text-xs text-gray-400">
                            {job.salaryType}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div
                      className="flex space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setApplicationModalOpen(true);
                        }}
                        className="text-green-400 hover:text-green-300 text-sm px-2 py-1 rounded hover:bg-green-900/20 transition-colors"
                        title="View/edit application"
                      >
                        Application
                      </button>
                      <button
                        onClick={() => handleInterviewClick(job)}
                        className="text-purple-400 hover:text-purple-300 text-sm px-2 py-1 rounded hover:bg-purple-900/20 transition-colors"
                        title="Manage interviews"
                      >
                        Interview
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Job Modal */}
      {editJob && (
        <EditJobModal
          job={editJob}
          open={!!editJob}
          onClose={() => setEditJob(null)}
          onUpdated={() => {
            setEditJob(null);
            // TODO: Invalidate queries
          }}
        />
      )}

      {/* Application Modal */}
      {applicationModalOpen && selectedJob && (
        <ApplicationModal
          job={selectedJob}
          application={applications.find((app) => app.jobId === selectedJob.id)}
          open={applicationModalOpen}
          onClose={() => {
            setApplicationModalOpen(false);
            setSelectedJob(null);
          }}
          onSaved={() => {
            setApplicationModalOpen(false);
            setSelectedJob(null);
            // TODO: Invalidate queries
          }}
          resumes={[]} // TODO: Pass actual resumes from props
        />
      )}

      {/* Interview Modal */}
      {interviewModalOpen && selectedJob && (
        <InterviewModal
          open={interviewModalOpen}
          interview={selectedInterview}
          job={selectedJob}
          onClose={() => {
            setInterviewModalOpen(false);
            setSelectedJob(null);
            setSelectedInterview(null);
          }}
          onSaved={() => {
            setInterviewModalOpen(false);
            setSelectedJob(null);
            setSelectedInterview(null);
            // TODO: Invalidate queries
          }}
        />
      )}
    </>
  );
}
