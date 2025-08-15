import {useState, useMemo} from 'react';
import type {Job, Application, Interview, SalaryOffer} from '../../types';
import type {JobListFilters} from '../../hooks/useJobListFilters';
import {EditJobModal, ApplicationModal} from '../jobs';

interface JobListTableProps {
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  salaryOffers: SalaryOffer[];
  filters: JobListFilters;
  isLoading?: boolean;
}

type SortField =
  | 'company'
  | 'title'
  | 'status'
  | 'appliedAt'
  | 'lastActivityAt';
type SortDirection = 'asc' | 'desc';

interface JobWithDetails extends Job {
  application?: Application;
  nextInterview?: Interview;
  salaryOffer?: SalaryOffer;
}

export default function JobListTable({
  jobs,
  applications,
  interviews,
  salaryOffers,
  filters,
  isLoading = false,
}: JobListTableProps) {
  const [sortField, setSortField] = useState<SortField>('lastActivityAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Enrich jobs with related data
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

      return {
        ...job,
        application,
        nextInterview,
        salaryOffer,
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
      let aValue: string | Date, bValue: string | Date;

      switch (sortField) {
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
        case 'lastActivityAt':
          aValue = new Date(a.lastActivityAt);
          bValue = new Date(b.lastActivityAt);
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
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
                  Next Interview
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
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort('lastActivityAt')}
                >
                  Last Activity
                  {sortField === 'lastActivityAt' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {sortedJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {job.faviconUrl && (
                        <img
                          src={job.faviconUrl}
                          alt=""
                          className="w-4 h-4 mr-2"
                        />
                      )}
                      <span className="text-white">{job.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{job.title}</div>
                    {job.source && (
                      <div className="text-xs text-gray-400">{job.source}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        job.status,
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {job.application?.appliedAt
                      ? formatDate(job.application.appliedAt)
                      : formatDate(job.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {job.nextInterview ? (
                      <div>
                        <div>{formatDate(job.nextInterview.scheduledAt)}</div>
                        <div className="text-xs text-gray-400">
                          {job.nextInterview.type}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  {salaryOffers.length > 0 && (
                    <td className="px-4 py-3 text-gray-300">
                      {job.salaryOffer ? (
                        <div>
                          <div className="text-green-400">Yes</div>
                          <div className="text-xs">
                            ${(job.salaryOffer.amount / 100).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-300">
                    <div>
                      {job.locationCity && job.locationState && (
                        <div>
                          {job.locationCity}, {job.locationState}
                        </div>
                      )}
                      {job.isRemote && (
                        <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                          Remote
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(job.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditJob(job)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setApplicationModalOpen(true);
                        }}
                        className="text-green-400 hover:text-green-300 text-sm"
                      >
                        Application
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
    </>
  );
}
