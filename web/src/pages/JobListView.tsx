import {useQuery} from '@tanstack/react-query';
import {listJobs, listApplications, listFollowUps} from '../api';
import type {Interview, SalaryOffer, FollowUp} from '../types';
import {
  JobListStats,
  JobListFilters,
  JobListTable,
} from '../components/job-list';
import {useJobListFilters} from '../hooks/useJobListFilters';

export default function JobListView() {
  const {filters, updateFilter, resetFilters, hasActiveFilters} =
    useJobListFilters();

  // Fetch all required data
  const {data: jobs = [], isLoading: jobsLoading} = useQuery({
    queryKey: ['jobs'],
    queryFn: listJobs,
  });

  const {data: applications = [], isLoading: applicationsLoading} = useQuery({
    queryKey: ['applications'],
    queryFn: listApplications,
  });

  const {data: followUps = [], isLoading: followUpsLoading} = useQuery({
    queryKey: ['follow-ups'],
    queryFn: listFollowUps,
  });

  // TODO: Add these API calls when they're implemented
  const interviews: Interview[] = [];
  const salaryOffers: SalaryOffer[] = [];

  const isLoading = jobsLoading || applicationsLoading || followUpsLoading;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Job List View</h1>
          <p className="text-gray-400">
            Comprehensive overview of all your job applications and pipeline
          </p>
        </div>

        {/* Stats Widgets */}
        <JobListStats
          jobs={jobs}
          applications={applications}
          interviews={interviews}
          salaryOffers={salaryOffers}
          followUps={followUps}
          isLoading={isLoading}
        />

        {/* Filters */}
        <JobListFilters
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Data Table */}
        <JobListTable
          jobs={jobs}
          applications={applications}
          interviews={interviews}
          salaryOffers={salaryOffers}
          filters={filters}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
