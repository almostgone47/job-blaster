import {render} from '../../test/test-utils';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import SalaryAnalytics from '../SalaryAnalytics';

// Mock the consolidated hook
const mockUseConsolidatedSalaryData = vi.fn();

vi.mock('../../lib/salaryAnalytics', () => ({
  useConsolidatedSalaryData: () => mockUseConsolidatedSalaryData(),
}));

describe('SalaryAnalytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('renders loading skeleton when data is loading', () => {
      mockUseConsolidatedSalaryData.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const {container} = render(<SalaryAnalytics />);

      expect(container).toMatchSnapshot();
      expect(container.textContent).toContain('Loading Salary Analytics');
      expect(container.textContent).toContain(
        'Analyzing your data and generating insights',
      );
    });
  });

  describe('Error state', () => {
    it('renders error message when there is an error', () => {
      mockUseConsolidatedSalaryData.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch data'),
      });

      const {container} = render(<SalaryAnalytics />);

      expect(container).toMatchSnapshot();
      expect(container.textContent).toContain(
        'Failed to Load Salary Analytics',
      );
      expect(container.textContent).toContain(
        'There was an error loading your salary data',
      );
    });
  });

  describe('Empty state (no offers)', () => {
    it('renders empty state when no salary data is available', () => {
      mockUseConsolidatedSalaryData.mockReturnValue({
        data: {
          stats: null,
          offers: null,
        },
        isLoading: false,
        error: null,
      });

      const {container} = render(<SalaryAnalytics />);

      expect(container).toMatchSnapshot();
      expect(container.textContent).toContain('No salary data available');
    });
  });

  describe('Low signal state (1-2 offers)', () => {
    it('renders CollectMoreData component for insufficient data', () => {
      mockUseConsolidatedSalaryData.mockReturnValue({
        data: {
          stats: {
            totalJobs: 2,
            totalOffers: 2,
            averageSalary: 60000,
            medianSalary: 60000,
            minSalary: 50000,
            maxSalary: 70000,
            p25: 55000,
            p75: 65000,
            p90: 70000,
          },
          offers: [
            {
              id: '1',
              amount: 50000,
              job: {
                title: 'Software Engineer',
                company: 'Company A',
                location: 'SF',
              },
            },
            {
              id: '2',
              amount: 70000,
              job: {title: 'Developer', company: 'Company B', location: 'NYC'},
            },
          ],
          companies: [],
          locations: [],
          timeline: [],
          remoteSplit: {
            remote: {count: 0, avgSalary: 0},
            onsite: {count: 0, avgSalary: 0},
          },
        },
        isLoading: false,
        error: null,
      });

      const {container} = render(<SalaryAnalytics />);

      expect(container).toMatchSnapshot();
      expect(container.textContent).toContain(
        'Need More Data for Reliable Insights',
      );

      // Should NOT show most analytics sections
      expect(container.textContent).not.toContain(
        'Salary Range & Distribution',
      );
      expect(container.textContent).not.toContain('Company Leaderboard');
      expect(container.textContent).not.toContain('Timeline Chart');
    });
  });

  describe('Normal state (5+ offers)', () => {
    it('renders full analytics when sufficient data is available', () => {
      mockUseConsolidatedSalaryData.mockReturnValue({
        data: {
          stats: {
            totalJobs: 8,
            totalOffers: 8,
            averageSalary: 75000,
            medianSalary: 70000,
            minSalary: 50000,
            maxSalary: 120000,
            p25: 60000,
            p75: 85000,
            p90: 100000,
          },
          offers: [
            {
              id: '1',
              amount: 50000,
              job: {
                title: 'Software Engineer',
                company: 'Company A',
                location: 'SF',
              },
            },
            {
              id: '2',
              amount: 60000,
              job: {title: 'Developer', company: 'Company B', location: 'NYC'},
            },
            {
              id: '3',
              amount: 70000,
              job: {
                title: 'Engineer',
                company: 'Company C',
                location: 'Seattle',
              },
            },
            {
              id: '4',
              amount: 80000,
              job: {
                title: 'Developer',
                company: 'Company D',
                location: 'Austin',
              },
            },
            {
              id: '5',
              amount: 90000,
              job: {
                title: 'Software Engineer',
                company: 'Company E',
                location: 'Boston',
              },
            },
            {
              id: '6',
              amount: 100000,
              job: {
                title: 'Senior Developer',
                company: 'Company F',
                location: 'LA',
              },
            },
            {
              id: '7',
              amount: 110000,
              job: {
                title: 'Lead Engineer',
                company: 'Company G',
                location: 'Chicago',
              },
            },
            {
              id: '8',
              amount: 120000,
              job: {
                title: 'Principal Engineer',
                company: 'Company H',
                location: 'Denver',
              },
            },
          ],
          companies: [
            {
              company: 'Google',
              offer_count: 3,
              avgSalary: 90000,
              minSalary: 80000,
              maxSalary: 100000,
              p25: 85000,
              p75: 95000,
            },
            {
              company: 'Microsoft',
              offer_count: 2,
              avgSalary: 70000,
              minSalary: 65000,
              maxSalary: 75000,
              p25: 67500,
              p75: 72500,
            },
          ],
          locations: [
            {
              location: 'San Francisco',
              offer_count: 5,
              avgSalary: 80000,
              minSalary: 70000,
              maxSalary: 90000,
              p25: 75000,
              p75: 85000,
            },
            {
              location: 'Seattle',
              offer_count: 3,
              avgSalary: 70000,
              minSalary: 60000,
              maxSalary: 80000,
              p25: 65000,
              p75: 75000,
            },
          ],
          timeline: [
            {
              month: '2024-01',
              offer_count: 2,
              avgSalary: 65000,
              minSalary: 50000,
              maxSalary: 80000,
              growth_percentage: null,
            },
            {
              month: '2024-02',
              offer_count: 3,
              avgSalary: 75000,
              minSalary: 60000,
              maxSalary: 90000,
              growth_percentage: 15.4,
            },
          ],
          remoteSplit: {
            remote: {count: 3, avgSalary: 80000},
            onsite: {count: 5, avgSalary: 70000},
          },
        },
        isLoading: false,
        error: null,
      });

      const {container} = render(<SalaryAnalytics />);

      expect(container).toMatchSnapshot();

      // Should show all analytics sections
      expect(container.textContent).toContain('Salary Range & Distribution');
      expect(container.textContent).toContain('Company Leaderboard');
      expect(container.textContent).toContain('Salary by Location');
      expect(container.textContent).toContain('Recent Offers');

      // Should NOT show CollectMoreData (sufficient data)
      expect(container.textContent).not.toContain(
        'Need More Data for Reliable Insights',
      );
      // Should show all analytics sections
      expect(container.textContent).toContain('Salary Range & Distribution');
    });
  });

  describe('Header and navigation', () => {
    it('renders header with title and settings button', () => {
      mockUseConsolidatedSalaryData.mockReturnValue({
        data: {
          stats: {
            totalJobs: 1,
            totalOffers: 1,
            averageSalary: 50000,
            medianSalary: 50000,
            minSalary: 50000,
            maxSalary: 50000,
            p25: 50000,
            p75: 50000,
            p90: 50000,
          },
          offers: [
            {
              id: '1',
              amount: 50000,
              job: {
                title: 'Test Job',
                company: 'Test Company',
                location: 'Test',
              },
            },
          ],
          companies: [],
          locations: [],
          timeline: [],
          remoteSplit: {
            remote: {count: 0, avgSalary: 0},
            onsite: {count: 0, avgSalary: 0},
          },
        },
        isLoading: false,
        error: null,
      });

      const {container} = render(<SalaryAnalytics />);

      expect(container.textContent).toContain('Salary Analytics');
      expect(container.textContent).toContain(
        'Turn your job data into negotiation power',
      );
      expect(container.textContent).toContain('Display Settings');
    });
  });
});
