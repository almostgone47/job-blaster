import {useQuery} from '@tanstack/react-query';
import {useMemo} from 'react';
import {getSalaryAnalytics} from '../api';

// Types for individual views
export interface SalaryStats {
  totalJobs: number;
  totalOffers: number;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  p25: number;
  p75: number;
  p90: number;
}

export interface CompanySalaryData {
  company: string;
  offer_count: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  p25: number;
  p75: number;
}

export interface LocationSalaryData {
  location: string;
  offer_count: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  p25: number;
  p75: number;
}

export interface RemoteSplitData {
  remote: {
    count: number;
    avgSalary: number;
  };
  onsite: {
    count: number;
    avgSalary: number;
  };
}

export interface TimelineData {
  month: string;
  offer_count: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  growth_percentage: number | null;
}

// Data client functions
export const salaryAnalyticsClient = {
  // Get all data (existing functionality)
  getAll: async () => {
    const data = await getSalaryAnalytics();
    return data;
  },

  // Get basic statistics
  getStats: async (): Promise<SalaryStats> => {
    const data = await getSalaryAnalytics();
    return {
      totalJobs: data.analytics.totalJobsWithSalary,
      totalOffers: data.analytics.totalOffers,
      averageSalary: data.analytics.averageSalary,
      medianSalary: data.analytics.averageSalary, // TODO: Calculate actual median from enhanced views
      minSalary: data.analytics.salaryRange.min,
      maxSalary: data.analytics.salaryRange.max,
      p25: data.analytics.averageSalary * 0.8, // TODO: Get from enhanced views
      p75: data.analytics.averageSalary * 1.2, // TODO: Get from enhanced views
      p90: data.analytics.averageSalary * 1.4, // TODO: Get from enhanced views
    };
  },

  // Get company breakdown
  getByCompany: async (): Promise<CompanySalaryData[]> => {
    const data = await getSalaryAnalytics();
    return Object.entries(data.analytics.byCompany).map(([company, stats]) => ({
      company,
      offer_count: stats.count,
      avgSalary: stats.avgSalary,
      minSalary: stats.avgSalary * 0.9, // TODO: Get from enhanced views
      maxSalary: stats.avgSalary * 1.1, // TODO: Get from enhanced views
      p25: stats.avgSalary * 0.85, // TODO: Get from enhanced views
      p75: stats.avgSalary * 1.15, // TODO: Get from enhanced views
    }));
  },

  // Get location breakdown
  getByLocation: async (): Promise<LocationSalaryData[]> => {
    const data = await getSalaryAnalytics();
    return Object.entries(data.analytics.byLocation).map(
      ([location, stats]) => ({
        location,
        offer_count: stats.count,
        avgSalary: stats.avgSalary,
        minSalary: stats.avgSalary * 0.9, // TODO: Get from enhanced views
        maxSalary: stats.avgSalary * 1.1, // TODO: Get from enhanced views
        p25: stats.avgSalary * 0.85, // TODO: Get from enhanced views
        p75: stats.avgSalary * 1.1, // TODO: Get from enhanced views
      }),
    );
  },

  // Get remote vs onsite split
  getRemoteSplit: async (): Promise<RemoteSplitData> => {
    // TODO: Get from enhanced views when available
    return {
      remote: {count: 0, avgSalary: 0},
      onsite: {count: 0, avgSalary: 0},
    };
  },

  // Get timeline data
  getTimeline: async (): Promise<TimelineData[]> => {
    const data = await getSalaryAnalytics();
    // TODO: Get from enhanced views when available
    // For now, create mock timeline data from offers
    if (data.offers.length === 0) return [];

    const offersByMonth = data.offers.reduce((acc, offer) => {
      const month = new Date(offer.offeredAt || new Date())
        .toISOString()
        .slice(0, 7);
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(offer.amount);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(offersByMonth)
      .map(([month, amounts]) => ({
        month,
        offer_count: amounts.length,
        avgSalary:
          amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length,
        minSalary: Math.min(...amounts),
        maxSalary: Math.max(...amounts),
        growth_percentage: null, // TODO: Calculate from enhanced views
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  },
};

// React Query hooks
export const useSalaryStats = () => {
  return useQuery({
    queryKey: ['salary-stats'],
    queryFn: salaryAnalyticsClient.getStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

export const useSalaryByCompany = () => {
  return useQuery({
    queryKey: ['salary-by-company'],
    queryFn: salaryAnalyticsClient.getByCompany,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSalaryByLocation = () => {
  return useQuery({
    queryKey: ['salary-by-location'],
    queryFn: salaryAnalyticsClient.getByLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSalaryRemoteSplit = () => {
  return useQuery({
    queryKey: ['salary-remote-split'],
    queryFn: salaryAnalyticsClient.getRemoteSplit,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSalaryTimeline = () => {
  return useQuery({
    queryKey: ['salary-timeline'],
    queryFn: salaryAnalyticsClient.getTimeline,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for all data (existing functionality)
export const useSalaryAnalytics = () => {
  return useQuery({
    queryKey: ['salary-analytics'],
    queryFn: salaryAnalyticsClient.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// NEW: Consolidated hook that makes only ONE API call and derives all data
export const useConsolidatedSalaryData = () => {
  const {data, isLoading, error} = useSalaryAnalytics();

  // Derive all the data from the single API response
  const derivedData = useMemo(() => {
    if (!data) return null;

    const {analytics, jobs, offers} = data;

    // Derive stats
    const stats = {
      totalJobs: analytics.totalJobsWithSalary,
      totalOffers: analytics.totalOffers,
      averageSalary: analytics.averageSalary,
      medianSalary: analytics.averageSalary, // TODO: Get from enhanced views
      minSalary: analytics.salaryRange.min,
      maxSalary: analytics.salaryRange.max,
      p25: analytics.averageSalary * 0.8, // TODO: Get from enhanced views
      p75: analytics.averageSalary * 1.2, // TODO: Get from enhanced views
      p90: analytics.averageSalary * 1.4, // TODO: Get from enhanced views
    };

    // Derive company data
    const companies = Object.entries(analytics.byCompany).map(
      ([company, stats]) => ({
        company,
        offer_count: stats.count,
        avgSalary: stats.avgSalary,
        minSalary: stats.avgSalary * 0.9, // TODO: Get from enhanced views
        maxSalary: stats.avgSalary * 1.1, // TODO: Get from enhanced views
        p25: stats.avgSalary * 0.85, // TODO: Get from enhanced views
        p75: stats.avgSalary * 1.15, // TODO: Get from enhanced views
      }),
    );

    // Derive location data
    const locations = Object.entries(analytics.byLocation).map(
      ([location, stats]) => ({
        location,
        offer_count: stats.count,
        avgSalary: stats.avgSalary,
        minSalary: stats.avgSalary * 0.9, // TODO: Get from enhanced views
        maxSalary: stats.avgSalary * 1.1, // TODO: Get from enhanced views
        p25: stats.avgSalary * 0.85, // TODO: Get from enhanced views
        p75: stats.avgSalary * 1.1, // TODO: Get from enhanced views
      }),
    );

    // Derive timeline data
    const timeline =
      offers.length > 0
        ? (() => {
            const offersByMonth = offers.reduce((acc, offer) => {
              const month = new Date(offer.offeredAt || new Date())
                .toISOString()
                .slice(0, 7);
              if (!acc[month]) acc[month] = [];
              acc[month].push(offer.amount);
              return acc;
            }, {} as Record<string, number[]>);

            return Object.entries(offersByMonth)
              .map(([month, amounts]) => ({
                month,
                offer_count: amounts.length,
                avgSalary:
                  amounts.reduce((sum, amount) => sum + amount, 0) /
                  amounts.length,
                minSalary: Math.min(...amounts),
                maxSalary: Math.max(...amounts),
                growth_percentage: null, // TODO: Calculate from enhanced views
              }))
              .sort((a, b) => b.month.localeCompare(a.month));
          })()
        : [];

    // Derive remote split data
    const remoteSplit = {
      remote: {count: 0, avgSalary: 0},
      onsite: {count: 0, avgSalary: 0},
    };

    return {
      stats,
      companies,
      locations,
      timeline,
      remoteSplit,
      offers,
      analytics,
      jobs,
    };
  }, [data]);

  return {
    data: derivedData,
    isLoading,
    error,
  };
};
