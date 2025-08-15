import {useState, useEffect, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {usePersistentState} from './usePersistentState';
import type {JobStatus} from '../types';

export interface JobListFilters {
  status: JobStatus[];
  company: string;
  dateFrom: string;
  dateTo: string;
  isRemote: boolean | null;
  locationCity: string;
  locationState: string;
  salaryMin: string;
  salaryMax: string;
}

const DEFAULT_FILTERS: JobListFilters = {
  status: [],
  company: '',
  dateFrom: '',
  dateTo: '',
  isRemote: null,
  locationCity: '',
  locationState: '',
  salaryMin: '',
  salaryMax: '',
};

export function useJobListFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = usePersistentState<JobListFilters>(
    'job-list-filters',
    DEFAULT_FILTERS,
  );

  // Initialize filters from URL or localStorage
  const [filters, setFilters] = useState<JobListFilters>(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    return Object.keys(urlFilters).some(
      (key) =>
        urlFilters[key as keyof JobListFilters] !==
        DEFAULT_FILTERS[key as keyof JobListFilters],
    )
      ? urlFilters
      : localFilters;
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }
    if (filters.company) {
      params.set('company', filters.company);
    }
    if (filters.dateFrom) {
      params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.set('dateTo', filters.dateTo);
    }
    if (filters.isRemote !== null) {
      params.set('isRemote', filters.isRemote.toString());
    }
    if (filters.locationCity) {
      params.set('locationCity', filters.locationCity);
    }
    if (filters.locationState) {
      params.set('locationState', filters.locationState);
    }
    if (filters.salaryMin) {
      params.set('salaryMin', filters.salaryMin);
    }
    if (filters.salaryMax) {
      params.set('salaryMax', filters.salaryMax);
    }

    setSearchParams(params, {replace: true});
  }, [filters, setSearchParams]);

  // Sync to localStorage
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, setLocalFilters]);

  const updateFilter = useCallback(
    <K extends keyof JobListFilters>(key: K, value: JobListFilters[K]) => {
      setFilters((prev) => ({...prev, [key]: value}));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value !== null &&
      value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true),
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
}

function parseFiltersFromURL(searchParams: URLSearchParams): JobListFilters {
  const status =
    (searchParams.get('status')?.split(',').filter(Boolean) as JobStatus[]) ||
    [];
  const company = searchParams.get('company') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const isRemote = searchParams.get('isRemote')
    ? searchParams.get('isRemote') === 'true'
    : null;
  const locationCity = searchParams.get('locationCity') || '';
  const locationState = searchParams.get('locationState') || '';
  const salaryMin = searchParams.get('salaryMin') || '';
  const salaryMax = searchParams.get('salaryMax') || '';

  return {
    status,
    company,
    dateFrom,
    dateTo,
    isRemote,
    locationCity,
    locationState,
    salaryMin,
    salaryMax,
  };
}
