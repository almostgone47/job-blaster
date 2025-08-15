import {useQuery} from '@tanstack/react-query';
import {listJobs, listApplications, listInterviews} from '../../api';
import JobListStats from '../job-list/JobListStats';
import JobListTable from '../job-list/JobListTable';
import JobListFilters from '../job-list/JobListFilters';
import {useJobListFilters} from '../../hooks/useJobListFilters';

export default function ListView() {
  const {data: jobs = [], isLoading: jobsLoading} = useQuery({
    queryKey: ['jobs'],
    queryFn: listJobs,
  });

  const {data: applications = [], isLoading: applicationsLoading} = useQuery({
    queryKey: ['applications'],
    queryFn: listApplications,
  });

  const {data: interviews = [], isLoading: interviewsLoading} = useQuery({
    queryKey: ['interviews'],
    queryFn: listInterviews,
  });

  const {data: salaryOffers = [], isLoading: salaryOffersLoading} = useQuery({
    queryKey: ['salary-offers'],
    queryFn: () => Promise.resolve([]), // TODO: Implement salary offers API
  });

  const isLoading =
    jobsLoading ||
    applicationsLoading ||
    interviewsLoading ||
    salaryOffersLoading;

  // Use the proper filters hook
  const {filters, updateFilter, resetFilters, hasActiveFilters} =
    useJobListFilters();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-400">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Job List View</h1>
          <p className="text-gray-400 mt-2">
            Detailed view of all your job applications and opportunities
          </p>
        </div>
      </div>

      {/* Stats */}
      <JobListStats
        jobs={jobs}
        applications={applications}
        interviews={interviews}
        salaryOffers={salaryOffers}
      />

      {/* Filters */}
      <JobListFilters
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Table */}
      <JobListTable
        jobs={jobs}
        applications={applications}
        interviews={interviews}
        salaryOffers={salaryOffers}
        filters={filters}
        isLoading={isLoading}
      />
    </div>
  );
}
