import {useConsolidatedSalaryData} from '../lib/salaryAnalytics';
import TimelineChart from '../components/analytics/TimelineChart';
import RemoteSplit from '../components/analytics/RemoteSplit';
import Recommendations from '../components/analytics/Recommendations';
import {ErrorBoundary} from '../components/ErrorBoundary';

import {CollectMoreData} from '../components/analytics/CollectMoreData';
import {useFormatting} from '../contexts/UserPreferences';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {PreferencesSettings} from '../components/PreferencesSettings';
import {
  generateMarkdown,
  generateCSV,
  downloadFile,
} from '../utils/exportUtils';
import {getCompanyResearch} from '../api';
import type {CompanyResearch} from '../types';

export default function SalaryAnalytics() {
  // Use consolidated hook for better performance - only ONE API call!
  const {data, isLoading, error: hasError} = useConsolidatedSalaryData();
  const {formatCurrency} = useFormatting();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [exportingMarkdown, setExportingMarkdown] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  // Extract data from consolidated response
  const stats = data?.stats;
  const companies = data?.companies;
  const locations = data?.locations;
  const timelineData = data?.timeline;
  const remoteSplitData = data?.remoteSplit;
  const offers = data?.offers;

  // Fetch company research data for companies in the leaderboard
  const {data: companyResearch} = useQuery({
    queryKey: ['company-research'],
    queryFn: () => getCompanyResearch(),
    enabled: !!companies && companies.length > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-800 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto mb-8"></div>
          </div>

          {/* Loading Progress */}
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-8 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Loading Salary Analytics
            </h2>
            <p className="text-gray-400 mb-4">
              Analyzing your data and generating insights...
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full animate-pulse"
                style={{width: '60%'}}
              ></div>
            </div>

            <p className="text-sm text-gray-500">
              This may take a few seconds for the first load
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Failed to Load Salary Analytics
            </h2>
            <p className="text-red-300">
              There was an error loading your salary data. Please try again
              later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || !offers) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <p className="text-gray-400 text-center">
              No salary data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasLowSignal = offers?.length < 5;
  const hasInsufficientData = offers?.length < 3;

  // Use the formatCurrency function from user preferences
  const formatSalary = (amount: number, currency?: string) => {
    return formatCurrency(amount, currency);
  };

  // Export functions
  const handleExportMarkdown = async () => {
    if (!stats || !companies || !offers) return;

    setExportingMarkdown(true);
    try {
      const exportData = {stats, companies, offers, companyResearch};
      const markdown = generateMarkdown(exportData);
      const filename = `salary-analytics-${
        new Date().toISOString().split('T')[0]
      }.md`;

      downloadFile(markdown, filename, 'text/markdown');
    } finally {
      setExportingMarkdown(false);
    }
  };

  const handleExportCSV = async () => {
    if (!stats || !companies || !offers) return;

    setExportingCSV(true);
    try {
      const exportData = {stats, companies, offers, companyResearch};
      const csv = generateCSV(exportData);
      const filename = `salary-analytics-${
        new Date().toISOString().split('T')[0]
      }.csv`;

      downloadFile(csv, filename, 'text/csv');
    } finally {
      setExportingCSV(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center relative">
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setPreferencesOpen(true)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors text-sm"
              title="Display Preferences"
            >
              ⚙️ Display Settings
            </button>
          </div>

          <p className="text-xl text-gray-300 mb-6">
            Turn your job data into negotiation power.
          </p>

          {hasLowSignal && !hasInsufficientData && (
            <div className="mt-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-yellow-200">
                  Add more offers for stronger insights
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Show Collect More Data when insufficient data */}
        {hasInsufficientData && (
          <CollectMoreData offerCount={offers?.length || 0} />
        )}

        {/* Headline Stats Card - Always show */}
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Salary Position
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400 mb-2">
                {formatSalary(stats.averageSalary)}
              </p>
              <p className="text-gray-400">Your Average</p>
            </div>

            <div className="text-center">
              <p className="text-4xl font-bold text-green-400 mb-2">
                {formatSalary(stats.medianSalary)}
              </p>
              <p className="text-gray-400">Median</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            {offers?.length >= 7 ? (
              <p className="text-gray-300">
                Your top offers sit around the 75th percentile (≈{' '}
                {formatSalary(stats.p75)}).
              </p>
            ) : (
              <p className="text-gray-300">
                Limited data—add more offers to improve accuracy.
              </p>
            )}
          </div>

          <div className="mt-4 text-center">
            {stats.averageSalary > stats.medianSalary ? (
              <p className="text-blue-300">
                💡 You have several high outliers—use them to anchor
                negotiations.
              </p>
            ) : (
              <p className="text-yellow-300">
                💡 Most offers cluster below your typical target—consider
                raising the bar.
              </p>
            )}
          </div>
        </div>

        {/* Range & Distribution Card - Show if sufficient data */}
        {!hasInsufficientData && (
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Salary Range & Distribution
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400 mb-2">
                  {formatSalary(stats.minSalary)}
                </p>
                <p className="text-gray-400">Minimum</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400 mb-2">
                  {formatSalary(stats.p25)}
                </p>
                <p className="text-gray-400">25th Percentile</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-green-400 mb-2">
                  {formatSalary(stats.p75)}
                </p>
                <p className="text-gray-400">75th Percentile</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400 mb-2">
                  {formatSalary(stats.maxSalary)}
                </p>
                <p className="text-gray-400">Maximum</p>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-center">
                Most offers fall between {formatSalary(stats.p25)}–
                {formatSalary(stats.p75)}. Use this band as your realistic
                expectation zone.
              </p>
            </div>
          </div>
        )}

        {/* Company Leaderboard - Show if sufficient data */}
        {!hasInsufficientData && companies && companies.length > 0 && (
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Company Leaderboard
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 text-gray-300 font-medium">
                      Company
                    </th>
                    <th className="text-center p-3 text-gray-300 font-medium">
                      Offers
                    </th>
                    <th className="text-center p-3 text-gray-300 font-medium">
                      Average
                    </th>
                    <th className="text-center p-3 text-gray-300 font-medium">
                      Range
                    </th>
                    <th className="text-center p-3 text-gray-300 font-medium">
                      Research
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr
                      key={company.company}
                      className="border-b border-gray-700"
                    >
                      <td className="p-3 text-white font-medium">
                        {company.company}
                      </td>
                      <td className="p-3 text-center text-gray-300">
                        {company.offer_count}
                      </td>
                      <td className="p-3 text-center text-green-400 font-semibold">
                        {formatSalary(company.avgSalary)}
                      </td>
                      <td className="p-3 text-center text-gray-300">
                        {formatSalary(company.minSalary)}–
                        {formatSalary(company.maxSalary)}
                      </td>
                      <td className="p-3 text-center">
                        {companyResearch?.find(
                          (r: CompanyResearch) =>
                            r.companyName === company.company,
                        ) ? (
                          <span className="text-green-400 text-sm">🔍</span>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                💡 Tip: Lead with data from top-paying companies to justify your
                ask.
              </p>
            </div>
          </div>
        )}

        {/* Location Breakdown - Show if sufficient data */}
        {!hasInsufficientData && locations && locations.length > 0 && (
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Salary by Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <div
                  key={location.location}
                  className="bg-gray-700 rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {location.location}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Offers:</span>
                      <span className="text-white">{location.offer_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average:</span>
                      <span className="text-green-400 font-semibold">
                        {formatSalary(location.avgSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Range:</span>
                      <span className="text-gray-300">
                        {formatSalary(location.minSalary)}–
                        {formatSalary(location.maxSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Offers - Show if sufficient data */}
        {!hasInsufficientData && offers && offers.length > 0 && (
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Recent Offers
            </h2>

            <div className="space-y-4">
              {offers?.slice(0, 8).map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <div>
                    <p className="font-medium text-white">{offer.job.title}</p>
                    <p className="text-sm text-gray-400">{offer.job.company}</p>
                    {offer.job.location && (
                      <p className="text-sm text-gray-500">
                        {offer.job.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">
                      {formatSalary(offer.amount, offer.currency)}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 text-xs rounded-full ${
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

        {/* Timeline Chart - Show if sufficient data */}
        {!hasInsufficientData && timelineData && timelineData.length > 0 && (
          <ErrorBoundary>
            <TimelineChart data={timelineData} />
          </ErrorBoundary>
        )}

        {/* Remote vs Onsite Comparison - Show if sufficient data */}
        {!hasInsufficientData &&
          remoteSplitData &&
          (remoteSplitData.remote.count > 0 ||
            remoteSplitData.onsite.count > 0) && (
            <ErrorBoundary>
              <RemoteSplit data={remoteSplitData} />
            </ErrorBoundary>
          )}

        {/* Smart Recommendations - Show if sufficient data */}
        {!hasInsufficientData &&
          companies &&
          companies.length > 0 &&
          stats &&
          offers && (
            <ErrorBoundary>
              <Recommendations
                companies={companies}
                stats={stats}
                offers={offers}
              />
            </ErrorBoundary>
          )}

        {/* Export Section */}
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Export Your Data
          </h2>
          <p className="text-gray-300 mb-6">
            Download your salary analytics summary for negotiations and career
            planning.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleExportMarkdown}
              disabled={!stats || !companies || !offers || exportingMarkdown}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {exportingMarkdown ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Exporting...
                </>
              ) : (
                '📄 Export as Markdown'
              )}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!stats || !companies || !offers || exportingCSV}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {exportingCSV ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Exporting...
                </>
              ) : (
                '📊 Export as CSV'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Settings Modal */}
      <PreferencesSettings
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </div>
  );
}
