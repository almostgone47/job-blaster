import {useQuery} from '@tanstack/react-query';
import {getSalaryAnalytics} from '../api';

export default function SalaryAnalytics() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['salary-analytics'],
    queryFn: getSalaryAnalytics,
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center text-gray-400 mt-2">
          Loading salary analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <p className="text-red-400 text-center">
          Failed to load salary analytics
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-center">No salary data available</p>
      </div>
    );
  }

  const {analytics, jobs, offers} = data;

  const formatSalary = (amount: number, currency: string = 'USD') => {
    // Format with "k" abbreviation for better readability
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h3 className="text-sm font-medium text-gray-400">
            Jobs with Salary
          </h3>
          <p className="text-2xl font-bold text-white">
            {analytics.totalJobsWithSalary}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h3 className="text-sm font-medium text-gray-400">Total Offers</h3>
          <p className="text-2xl font-bold text-white">
            {analytics.totalOffers}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h3 className="text-sm font-medium text-gray-400">Pending Offers</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {analytics.pendingOffers}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h3 className="text-sm font-medium text-gray-400">Accepted Offers</h3>
          <p className="text-2xl font-bold text-green-400">
            {analytics.acceptedOffers}
          </p>
        </div>
      </div>

      {/* Salary Range */}
      {analytics.salaryRange.min > 0 && analytics.salaryRange.max > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">
            Salary Range
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Minimum</p>
              <p className="text-xl font-bold text-white">
                {formatSalary(analytics.salaryRange.min)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Average</p>
              <p className="text-xl font-bold text-blue-400">
                {formatSalary(analytics.averageSalary)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Maximum</p>
              <p className="text-xl font-bold text-white">
                {formatSalary(analytics.salaryRange.max)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Offers */}
      {offers.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Offers
          </h3>
          <div className="space-y-3">
            {offers.slice(0, 5).map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600"
              >
                <div>
                  <p className="font-medium text-white">{offer.job.title}</p>
                  <p className="text-sm text-gray-400">{offer.job.company}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">
                    {formatSalary(offer.amount, offer.currency)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      offer.status === 'ACCEPTED'
                        ? 'bg-green-900 text-green-300'
                        : offer.status === 'PENDING'
                        ? 'bg-yellow-900 text-yellow-300'
                        : offer.status === 'REJECTED'
                        ? 'bg-red-900 text-red-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs with Salary Data */}
      {jobs.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">
            Jobs with Salary Data
          </h3>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600"
              >
                <div>
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="text-sm text-gray-400">
                    {job.company} • {job.location || 'Remote'}
                  </p>
                </div>
                <div className="text-right">
                  {job.salaryMin && job.salaryMax ? (
                    <p className="font-bold text-white">
                      {formatSalary(job.salaryMin, job.salaryCurrency)} -{' '}
                      {formatSalary(job.salaryMax, job.salaryCurrency)}
                    </p>
                  ) : (
                    <p className="text-gray-400">Salary not specified</p>
                  )}
                  <p className="text-xs text-gray-500">{job.salaryType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {jobs.length === 0 && offers.length === 0 && (
        <div className="bg-gray-800 p-12 rounded-lg border border-gray-600 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Salary Data Yet
          </h3>
          <p className="text-gray-400">
            Start tracking salaries by adding salary information to your job
            postings or recording salary offers.
          </p>
        </div>
      )}
    </div>
  );
}
