import {render, screen, waitFor} from '../../test/test-utils';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import Calendar from '../Calendar';
import type {
  JobStatus,
  AppStatus,
  InterviewType,
  InterviewStatus,
} from '../../types';

// Mock the API calls
vi.mock('../../api', () => ({
  listJobs: vi.fn(),
  listApplications: vi.fn(),
  listInterviews: vi.fn(),
}));

// Mock the EnhancedCalendar component
vi.mock('../../components/calendar', () => ({
  EnhancedCalendar: ({
    interviews,
    jobs,
    applications,
    onEventClick,
  }: {
    interviews: unknown[];
    jobs: unknown[];
    applications: unknown[];
    onEventClick: (event: unknown) => void;
  }) => (
    <div data-testid="enhanced-calendar">
      <div>Calendar Component</div>
      <div>Interviews: {interviews.length}</div>
      <div>Jobs: {jobs.length}</div>
      <div>Applications: {applications.length}</div>
      <button
        onClick={() =>
          onEventClick({id: '1', type: 'interview', title: 'Test Interview'})
        }
      >
        Test Event Click
      </button>
    </div>
  ),
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
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
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
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
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
    nextAction: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
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
    nextAction: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  },
];

const mockInterviews = [
  {
    id: '1',
    jobId: '1',
    userId: 'user-1',
    title: 'Phone Screen',
    type: 'PHONE_SCREEN' as InterviewType,
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    duration: 30,
    status: 'SCHEDULED' as InterviewStatus,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    job: {
      id: '1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      status: 'INTERVIEW',
    },
  },
];

describe('Calendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);

    render(<Calendar />);

    // Wait for the component to load and then check for the title
    await waitFor(() => {
      expect(screen.getByText('📅 Calendar')).toBeInTheDocument();
    });
  });

  it('displays the page header and description', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);

    render(<Calendar />);

    await waitFor(() => {
      expect(screen.getByText('📅 Calendar')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Your complete schedule: interviews, deadlines, and follow-ups',
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Calendar />);
    expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
  });

  it('displays calendar component when data is loaded', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);

    render(<Calendar />);

    await waitFor(() => {
      expect(screen.getByTestId('enhanced-calendar')).toBeInTheDocument();
      expect(screen.getByText('Calendar Component')).toBeInTheDocument();
    });
  });

  it('passes correct data to calendar component', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);

    render(<Calendar />);

    await waitFor(() => {
      expect(screen.getByText('Interviews: 1')).toBeInTheDocument();
      expect(screen.getByText('Jobs: 2')).toBeInTheDocument();
      expect(screen.getByText('Applications: 2')).toBeInTheDocument();
    });
  });

  it('shows upcoming events list', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);

    render(<Calendar />);

    // Wait for the component to load and then check for the title
    await waitFor(() => {
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    });

    // Should show all event types
    expect(
      screen.getByText('Follow-up: Software Engineer'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Follow-up: Frontend Developer'),
    ).toBeInTheDocument();
    expect(screen.getByText('Phone Screen')).toBeInTheDocument();
    expect(screen.getByText('Deadline: Software Engineer')).toBeInTheDocument();
    expect(
      screen.getByText('Deadline: Frontend Developer'),
    ).toBeInTheDocument();
  });

  it('handles empty data gracefully', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue([]);
    vi.mocked(listApplications).mockResolvedValue([]);
    vi.mocked(listInterviews).mockResolvedValue([]);

    render(<Calendar />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'No upcoming events. Great job staying on top of things! 🎉',
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows event count in header', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);

    render(<Calendar />);

    await waitFor(() => {
      // Should show total event count (2 follow-ups + 1 interview + 2 deadlines = 5)
      expect(screen.getByText('5 upcoming events')).toBeInTheDocument();
    });
  });

  it('displays event types with correct icons', async () => {
    const {listJobs, listApplications, listInterviews} = await import(
      '../../api'
    );
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);

    render(<Calendar />);

    await waitFor(() => {
      // Should show different event types with appropriate icons
      expect(screen.getByText('🎤')).toBeInTheDocument(); // Interview
      expect(screen.getAllByText('⏰')).toHaveLength(2); // 2 Deadlines
      expect(screen.getAllByText('📞')).toHaveLength(2); // 2 Follow-ups
    });
  });
});
