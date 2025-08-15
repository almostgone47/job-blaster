import {useMemo} from 'react';
import type {Job, Application, Interview, SalaryOffer} from '../../types';

interface JobListStatsProps {
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  salaryOffers: SalaryOffer[];
  isLoading?: boolean;
}

interface DashboardCounts {
  activePipeline: number;
  interviewsThisWeek: number;
  offers: number;
  rejections: number;
  responseRate?: number;
}

function getDashboardCounts(
  jobs: Job[],

  interviews: Interview[],
  salaryOffers: SalaryOffer[],
): DashboardCounts {
  // Active Pipeline: non-terminal JobStatus values (exclude REJECTED)
  const activePipeline = jobs.filter((job) => job.status !== 'REJECTED').length;

  // Interviews This Week: Interview.scheduledAt within current week (Mon-Sun)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  const interviewsThisWeek = interviews.filter((interview) => {
    const scheduledAt = new Date(interview.scheduledAt);
    return scheduledAt >= startOfWeek && scheduledAt <= endOfWeek;
  }).length;

  // Offers: count by SalaryOffer entities OR JobStatus == 'OFFER'
  const offersFromEntities = salaryOffers.length;
  const offersFromStatus = jobs.filter((job) => job.status === 'OFFER').length;
  const offers = Math.max(offersFromEntities, offersFromStatus);

  // Rejections: JobStatus == 'REJECTED'
  const rejections = jobs.filter((job) => job.status === 'REJECTED').length;

  // Response Rate: (INTERVIEW + OFFER + REJECTED) / APPLIED
  const appliedJobs = jobs.filter((job) => job.status === 'APPLIED').length;
  const respondedJobs = jobs.filter(
    (job) =>
      job.status === 'INTERVIEW' ||
      job.status === 'OFFER' ||
      job.status === 'REJECTED',
  ).length;

  const responseRate =
    appliedJobs >= 1
      ? Math.round((respondedJobs / appliedJobs) * 100)
      : undefined;

  return {
    activePipeline,
    interviewsThisWeek,
    offers,
    rejections,
    responseRate,
  };
}

export default function JobListStats({
  jobs,

  interviews,
  salaryOffers,
  isLoading = false,
}: JobListStatsProps) {
  const counts = useMemo(
    () => getDashboardCounts(jobs, interviews, salaryOffers),
    [jobs, interviews, salaryOffers],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 border border-gray-600 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Pipeline */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Active Pipeline</div>
          <div className="text-3xl font-bold text-blue-400">
            {counts.activePipeline}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            SAVED • APPLIED • INTERVIEW • OFFER
          </div>
        </div>

        {/* Interviews This Week */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Interviews This Week</div>
          <div className="text-3xl font-bold text-yellow-400">
            {counts.interviewsThisWeek}
          </div>
          <div className="text-xs text-gray-500 mt-1">Mon-Sun • Local Time</div>
        </div>

        {/* Offers */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Offers</div>
          <div className="text-3xl font-bold text-purple-400">
            {counts.offers}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Salary Offers + Status
          </div>
        </div>

        {/* Rejections */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Rejections</div>
          <div className="text-3xl font-bold text-red-400">
            {counts.rejections}
          </div>
          <div className="text-xs text-gray-500 mt-1">Job Status: REJECTED</div>
        </div>
      </div>

      {/* Response Rate (only show if denominator >= 1) */}
      {counts.responseRate !== undefined && (
        <div className="text-center">
          <span className="text-sm text-gray-400">
            Response Rate:{' '}
            <span className="text-green-400 font-medium">
              {counts.responseRate}%
            </span>{' '}
            (
            {
              jobs.filter(
                (j) =>
                  j.status === 'INTERVIEW' ||
                  j.status === 'OFFER' ||
                  j.status === 'REJECTED',
              ).length
            }{' '}
            of {jobs.filter((j) => j.status === 'APPLIED').length} applied jobs)
          </span>
        </div>
      )}

      {/* Empty state hint */}
      {counts.activePipeline === 0 && (
        <div className="text-center text-gray-400 text-sm">
          Add jobs to see pipeline stats
        </div>
      )}
    </div>
  );
}
