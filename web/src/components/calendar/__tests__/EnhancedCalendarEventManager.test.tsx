import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import EnhancedCalendarEventManager from '../EnhancedCalendarEventManager';
import type {CalendarEvent} from '../../../types';

// Mock the modal components
vi.mock('../../jobs', () => ({
  EditJobModal: ({job, open, onClose, onUpdated}: any) =>
    open ? (
      <div data-testid="edit-job-modal">
        <button onClick={onClose}>Close Job Modal</button>
        <button onClick={onUpdated}>Save Job</button>
      </div>
    ) : null,
  ApplicationModal: ({job, application, open, onClose, onSaved}: any) =>
    open ? (
      <div data-testid="application-modal">
        <button onClick={onClose}>Close Application Modal</button>
        <button onClick={onSaved}>Save Application</button>
      </div>
    ) : null,
}));

vi.mock('../../interviews/InterviewModal', () => ({
  default: ({open, onClose, onSaved}: any) =>
    open ? (
      <div data-testid="interview-modal">
        <button onClick={onClose}>Close Interview Modal</button>
        <button onClick={onSaved}>Save Interview</button>
      </div>
    ) : null,
}));

const mockEvent: CalendarEvent = {
  id: 'test-event-1',
  type: 'interview',
  title: 'Technical Interview',
  date: new Date('2024-01-15T10:00:00Z'),
  time: '10:00 AM',
  company: 'Tech Corp',
  status: 'SCHEDULED',
  data: {
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
  alerts: {
    hasDeadline: false,
    hasFollowUp: false,
    hasInterview: true,
    isOverdue: false,
    priority: 10,
  },
};

const mockResumes = [
  {id: 'resume-1', name: 'Resume 1', fileUrl: 'url1'},
  {id: 'resume-2', name: 'Resume 2', fileUrl: 'url2'},
];

describe('EnhancedCalendarEventManager', () => {
  const mockOnClose = vi.fn();
  const mockOnEventUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    expect(screen.getByText('Technical Interview')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('displays event information correctly', () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    expect(screen.getByText('Technical Interview')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument(); // Interview icon
    expect(screen.getByText('🔵')).toBeInTheDocument(); // Alert icon
  });

  it('shows action buttons', () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    expect(screen.getByText('Edit Job')).toBeInTheDocument();
    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('Interviews')).toBeInTheDocument();
  });

  it('opens job modal when Edit Job button is clicked', async () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    const editJobButton = screen.getByText('Edit Job');
    fireEvent.click(editJobButton);

    await waitFor(() => {
      expect(screen.getByTestId('edit-job-modal')).toBeInTheDocument();
    });
  });

  it('opens application modal when Application button is clicked', async () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    const applicationButton = screen.getByText('Application');
    fireEvent.click(applicationButton);

    await waitFor(() => {
      expect(screen.getByTestId('application-modal')).toBeInTheDocument();
    });
  });

  it('opens interview modal when Interviews button is clicked', async () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    const interviewButton = screen.getByText('Interviews');
    fireEvent.click(interviewButton);

    await waitFor(() => {
      expect(screen.getByTestId('interview-modal')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(
      <EnhancedCalendarEventManager
        event={mockEvent}
        isOpen={false}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    expect(screen.queryByText('Technical Interview')).not.toBeInTheDocument();
  });

  it('handles deadline event type correctly', () => {
    const deadlineEvent: CalendarEvent = {
      ...mockEvent,
      type: 'deadline',
      title: 'Application Deadline',
      data: {
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
      alerts: {
        hasDeadline: true,
        hasFollowUp: false,
        hasInterview: false,
        isOverdue: false,
        priority: 25,
      },
    };

    render(
      <EnhancedCalendarEventManager
        event={deadlineEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    expect(screen.getByText('⏰')).toBeInTheDocument(); // Deadline icon
    expect(screen.getByText('🟠')).toBeInTheDocument(); // Deadline alert
  });

  it('handles follow-up event type correctly', () => {
    const followUpEvent: CalendarEvent = {
      ...mockEvent,
      type: 'follow-up',
      title: 'Follow-up Required',
      data: {
        id: 'followup-1',
        userId: 'user-1',
        applicationId: 'app-1',
        scheduledDate: '2024-01-15T00:00:00.000Z',
        type: 'POST_APPLICATION',
        status: 'SCHEDULED',
        message: 'Follow up on application',
        notes: 'Check application status',
        createdAt: '2024-01-10T00:00:00.000Z',
        updatedAt: '2024-01-10T00:00:00.000Z',
        application: {
          id: 'app-1',
          userId: 'user-1',
          jobId: 'job-1',
          status: 'APPLIED',
          appliedAt: '2024-01-10T00:00:00.000Z',
          createdAt: '2024-01-10T00:00:00.000Z',
          updatedAt: '2024-01-10T00:00:00.000Z',
          job: {
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
            deadline: '2024-01-20T00:00:00.000Z',
            status: 'INTERVIEW',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            lastActivityAt: '2024-01-01T00:00:00.000Z',
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
        },
      },
      alerts: {
        hasDeadline: false,
        hasFollowUp: true,
        hasInterview: false,
        isOverdue: false,
        priority: 50,
      },
    };

    render(
      <EnhancedCalendarEventManager
        event={followUpEvent}
        isOpen={true}
        onClose={mockOnClose}
        onEventUpdated={mockOnEventUpdated}
        resumes={mockResumes}
      />,
    );

    expect(screen.getByText('Follow-up Required')).toBeInTheDocument();
    expect(screen.getByText('🟡')).toBeInTheDocument(); // Follow-up alert
  });
});
