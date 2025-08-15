import {render, screen, waitFor} from '../../test/test-utils';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import JobListView from '../JobListView';
import type {JobStatus, AppStatus} from '../../types';

// Mock the API calls
vi.mock('../../api', () => ({
  listJobs: vi.fn(),
  listApplications: vi.fn(),
}));

const mockJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    status: 'SAVED' as JobStatus,
    location: 'San Francisco, CA',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastActivityAt: '2024-01-01T00:00:00Z',
    tags: ['React', 'TypeScript'],
    userId: 'user-1',
    url: 'https://example.com',
    deadline: '2024-02-01T00:00:00Z',
    salaryMin: 80000,
    salaryMax: 120000,
    salaryCurrency: 'USD',
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Startup Inc',
    status: 'APPLIED' as JobStatus,
    location: 'Remote',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastActivityAt: '2024-01-02T00:00:00Z',
    tags: ['Vue', 'JavaScript'],
    userId: 'user-1',
    url: 'https://example.com',
    salaryMin: 60000,
    salaryMax: 90000,
    salaryCurrency: 'USD',
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'Big Corp',
    status: 'INTERVIEW' as JobStatus,
    location: 'New York, NY',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    lastActivityAt: '2024-01-03T00:00:00Z',
    tags: ['React', 'Node.js'],
    userId: 'user-1',
    url: 'https://example.com',
    salaryMin: 100000,
    salaryMax: 150000,
    salaryCurrency: 'USD',
  },
];

const mockApplications = [
  {
    id: '1',
    jobId: '1',
    userId: 'user-1',
    status: 'APPLIED' as AppStatus,
    appliedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    job: mockJobs[0],
  },
  {
    id: '2',
    jobId: '2',
    userId: 'user-1',
    status: 'INTERVIEW' as AppStatus,
    appliedAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    job: mockJobs[1],
  },
];

describe('JobListView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const {listJobs, listApplications} = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);

    render(<JobListView />);

    // Wait for the component to load and then check for the title
    await waitFor(() => {
      expect(screen.getByText('Job List View')).toBeInTheDocument();
    });
  });

  it('displays job list table when data is available', async () => {
    const {listJobs, listApplications} = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);

    render(<JobListView />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Startup Inc')).toBeInTheDocument();
    });
  });

  it('shows job statistics correctly', async () => {
    const {listJobs, listApplications} = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);

    render(<JobListView />);

    // Wait for the component to fully load and render all data
    await waitFor(
      () => {
        // Should show active pipeline count (all jobs except REJECTED)
        expect(screen.getByText('Active Pipeline')).toBeInTheDocument();
      },
      {timeout: 5000},
    );

    // Now check the specific elements
    expect(screen.getByText('3')).toBeInTheDocument();

    // Should show status breakdown in the stats
    expect(
      screen.getByText(/SAVED • APPLIED • INTERVIEW • OFFER/),
    ).toBeInTheDocument();
  });

  it('displays job details in table format', async () => {
    const {listJobs, listApplications} = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);

    render(<JobListView />);

    await waitFor(() => {
      // Check for specific table headers (avoiding stats section text)
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      // Check for job data that is actually displayed
      expect(screen.getByText('Big Corp')).toBeInTheDocument();
      expect(screen.getByText('Startup Inc')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();

      expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('handles empty state gracefully', async () => {
    const {listJobs, listApplications} = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue([]);
    vi.mocked(listApplications).mockResolvedValue([]);

    render(<JobListView />);

    await waitFor(() => {
      // Should show empty state message
      expect(
        screen.getByText(/Add jobs to see pipeline stats/),
      ).toBeInTheDocument();
    });
  });

  it('shows salary information when available', async () => {
    const {listJobs, listApplications} = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);

    render(<JobListView />);

    await waitFor(() => {
      // Should show salary ranges in the actual format displayed
      expect(screen.getByText('$80,000 - $120,000')).toBeInTheDocument();
      expect(screen.getByText('$60,000 - $90,000')).toBeInTheDocument();
      expect(screen.getByText('$100,000 - $150,000')).toBeInTheDocument();
    });
  });

  it('shows application status when available', async () => {
    const {listJobs, listApplications} = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);

    render(<JobListView />);

    await waitFor(() => {
      // Should show application statuses in the table (not in stats)
      // Look for the specific status badges in the table rows
      expect(screen.getByText('INTERVIEW')).toBeInTheDocument();

      // Check that the stats section shows the pipeline breakdown
      expect(
        screen.getByText(/SAVED • APPLIED • INTERVIEW • OFFER/),
      ).toBeInTheDocument();

      // Check that we have the expected number of status badges in the table
      const statusBadges = screen.getAllByText(/SAVED|APPLIED|INTERVIEW/);
      expect(statusBadges.length).toBeGreaterThanOrEqual(3); // At least 3 status badges
    });
  });
});
