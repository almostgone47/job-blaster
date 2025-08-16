import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';
import EnhancedCalendar from '../EnhancedCalendar';
import type {Interview, Job, Application} from '../../../types';

const mockInterviews: Interview[] = [
  {
    id: 'interview-1',
    userId: 'user-1',
    jobId: 'job-1',
    title: 'Technical Interview',
    type: 'TECHNICAL',
    scheduledAt: '2024-01-15T10:00:00Z',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: 60,
    location: 'Virtual',
    participants: 'John Doe',
    notes: 'Prepare for coding challenge',
    status: 'SCHEDULED',
    reminderAt: null,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    job: {
      id: 'job-1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      status: 'INTERVIEW',
    },
  },
];

const mockJobs: Job[] = [
  {
    id: 'job-1',
    userId: 'user-1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    url: 'https://example.com',
    source: 'LinkedIn',
    location: 'Remote',
    salary: '100k',
    tags: ['React', 'TypeScript'],
    faviconUrl: null,
    notes: 'Great opportunity',
    deadline: '2024-01-20T00:00:00Z',
    status: 'SAVED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastActivityAt: '2024-01-01T00:00:00Z',
    isRemote: true,
    locationCity: null,
    locationState: null,
    locationCountry: null,
    postedAt: null,
    salaryCurrency: 'USD',
    salaryMin: 100000,
    salaryMax: 120000,
    salaryType: 'ANNUAL',
  },
];

const mockApplications: Application[] = [
  {
    id: 'app-1',
    userId: 'user-1',
    jobId: 'job-1',
    resumeId: 'resume-1',
    coverNote: 'I am interested in this position',
    status: 'APPLIED',
    appliedAt: '2024-01-10T00:00:00Z',
    nextAction: '2024-01-15T00:00:00Z',
    notes: 'Follow up on application',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    job: {
      id: 'job-1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      status: 'INTERVIEW',
    },
  },
];

describe('EnhancedCalendar', () => {
  const mockOnEventClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const mockDate = new Date('2024-01-15');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays calendar navigation controls', () => {
    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows week day headers', () => {
    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('displays alerts summary when events have alerts', () => {
    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText('Alerts Summary:')).toBeInTheDocument();

    // Check for specific alert types in the summary
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByText('Deadlines')).toBeInTheDocument();
    expect(screen.getByText('Follow-ups')).toBeInTheDocument();

    // Check for alert counts
    expect(screen.getByText('1 Interviews')).toBeInTheDocument();
    expect(screen.getByText('1 Deadlines')).toBeInTheDocument();
    expect(screen.getByText('1 Follow-ups')).toBeInTheDocument();
  });

  it('shows alert filter toggle when callback is provided', () => {
    const mockOnShowAlertsOnlyChange = vi.fn();

    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
        showAlertsOnly={false}
        onShowAlertsOnlyChange={mockOnShowAlertsOnlyChange}
      />,
    );

    expect(screen.getByText('Show alerts only')).toBeInTheDocument();
  });

  it('handles alert filter toggle', () => {
    const mockOnShowAlertsOnlyChange = vi.fn();

    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
        showAlertsOnly={false}
        onShowAlertsOnlyChange={mockOnShowAlertsOnlyChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnShowAlertsOnlyChange).toHaveBeenCalledWith(true);
  });

  it('displays calendar days correctly', () => {
    const mockDate = new Date('2024-01-15');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    // Should show day numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument(); // Events are on day 14
  });

  it('shows legend with event types', () => {
    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByText('Deadlines')).toBeInTheDocument();
    expect(screen.getByText('Follow-ups')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', () => {
    const mockDate = new Date('2024-01-15');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    // Find and click on an event (the interview on day 15)
    const eventElement = screen.getByText('Technical Interview');
    fireEvent.click(eventElement);

    expect(mockOnEventClick).toHaveBeenCalled();
  });

  it('has navigation buttons', () => {
    render(
      <EnhancedCalendar
        interviews={mockInterviews}
        jobs={mockJobs}
        applications={mockApplications}
        onEventClick={mockOnEventClick}
      />,
    );

    const prevButton = screen.getByText('←');
    const nextButton = screen.getByText('→');
    const todayButton = screen.getByText('Today');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(todayButton).toBeInTheDocument();
  });
});
