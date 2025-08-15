import {useState} from 'react';
import type {JobStatus} from '../../types';
import type {JobListFilters} from '../../hooks/useJobListFilters';

const JOB_STATUS_OPTIONS: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

interface JobListFiltersProps {
  filters: JobListFilters;
  updateFilter: (key: keyof JobListFilters, value: any) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function JobListFilters({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
}: JobListFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusToggle = (status: JobStatus) => {
    const currentStatuses = filters.status;
    if (currentStatuses.includes(status)) {
      updateFilter(
        'status',
        currentStatuses.filter((s) => s !== status),
      );
    } else {
      updateFilter('status', [...currentStatuses, status]);
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const num = parseInt(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const parseCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num || '';
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-400 hover:text-gray-300 px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-400 hover:text-gray-300 px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {JOB_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Company Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => updateFilter('company', e.target.value)}
              placeholder="Search companies..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Remote
              </label>
              <select
                value={
                  filters.isRemote === null ? '' : filters.isRemote.toString()
                }
                onChange={(e) =>
                  updateFilter(
                    'isRemote',
                    e.target.value === '' ? null : e.target.value === 'true',
                  )
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="true">Remote</option>
                <option value="false">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={filters.locationCity}
                onChange={(e) => updateFilter('locationCity', e.target.value)}
                placeholder="City..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State
              </label>
              <input
                type="text"
                value={filters.locationState}
                onChange={(e) => updateFilter('locationState', e.target.value)}
                placeholder="State..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Salary
              </label>
              <input
                type="text"
                value={formatCurrency(filters.salaryMin)}
                onChange={(e) =>
                  updateFilter('salaryMin', parseCurrency(e.target.value))
                }
                placeholder="$0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Salary
              </label>
              <input
                type="text"
                value={formatCurrency(filters.salaryMax)}
                onChange={(e) =>
                  updateFilter('salaryMax', parseCurrency(e.target.value))
                }
                placeholder="$200,000"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
