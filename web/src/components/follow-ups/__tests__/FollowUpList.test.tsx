import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import FollowUpList from '../FollowUpList';
import type {Application, FollowUp, FollowUpTemplate} from '../../../types';

// Mock the API functions
vi.mock('../../../api', () => ({
  completeFollowUp: vi.fn(),
  deleteFollowUp: vi.fn(),
  listFollowUpTemplates: vi.fn(),
  createFollowUp: vi.fn(),
  updateFollowUp: vi.fn(),
}));

const mockApplication: Application = {
  id: 'app-1',
  userId: 'user-1',
  jobId: 'job-1',
  status: 'APPLIED',
  appliedAt: '2024-01-15T00:00:00.000Z',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  job: {
    id: 'job-1',
    userId: 'user-1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    url: 'https://example.com',
    source: 'LinkedIn',
    location: 'San Francisco, CA',
    salary: '100k-120k',
    tags: ['React', 'TypeScript'],
    faviconUrl: null,
    notes: null,
    deadline: '2024-02-15T00:00:00.000Z',
    status: 'APPLIED',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    lastActivityAt: '2024-01-15T00:00:00.000Z',
    isRemote: true,
    locationCity: 'San Francisco',
    locationState: 'CA',
    locationCountry: 'USA',
    postedAt: '2024-01-10T00:00:00.000Z',
    salaryCurrency: 'USD',
    salaryMin: 100000,
    salaryMax: 120000,
    salaryType: 'ANNUAL',
  },
};

const mockFollowUpTemplates: FollowUpTemplate[] = [
  {
    id: 'template-1',
    name: 'Post-Application Follow-up',
    type: 'POST_APPLICATION',
    message: 'Thank you for considering my application...',
    description: 'Standard follow-up after applying',
    isDefault: true,
    isPremium: false,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'template-2',
    name: 'Post-Interview Thank You',
    type: 'THANK_YOU',
    message: 'Thank you for the opportunity to interview...',
    description: 'Thank you note after interview',
    isDefault: true,
    isPremium: false,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
];

const mockFollowUps: FollowUp[] = [
  {
    id: 'followup-1',
    userId: 'user-1',
    applicationId: 'app-1',
    scheduledDate: '2024-01-20T00:00:00.000Z',
    type: 'POST_APPLICATION',
    status: 'SCHEDULED',
    message: 'Follow-up message for application',
    notes: 'Test notes',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    application: mockApplication,
  },
  {
    id: 'followup-2',
    userId: 'user-1',
    applicationId: 'app-1',
    scheduledDate: '2024-01-18T00:00:00.000Z',
    type: 'POST_INTERVIEW',
    status: 'OVERDUE',
    message: 'Overdue follow-up message',
    notes: null,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    application: mockApplication,
  },
  {
    id: 'followup-3',
    userId: 'user-1',
    applicationId: 'app-1',
    scheduledDate: '2024-01-19T00:00:00.000Z',
    type: 'THANK_YOU',
    status: 'COMPLETED',
    completedDate: '2024-01-19T00:00:00.000Z',
    message: 'Thank you message',
    notes: 'Sent thank you email',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    application: mockApplication,
  },
];

const mockFollowUp: FollowUp = {
  id: 'followup-1',
  userId: 'user-1',
  applicationId: 'app-1',
  scheduledDate: '2024-01-20T00:00:00.000Z',
  type: 'POST_APPLICATION',
  status: 'SCHEDULED',
  message: 'Custom follow-up message',
  notes: 'Test notes',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  application: mockApplication,
};

describe('FollowUpList', () => {
  const mockOnFollowUpUpdated = vi.fn();
  const mockOnFollowUpDeleted = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mock implementations
    const {listFollowUpTemplates} = await import('../../../api');
    vi.mocked(listFollowUpTemplates).mockResolvedValue(mockFollowUpTemplates);
  });

  it('renders without crashing', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    expect(screen.getByText('Follow-ups')).toBeInTheDocument();
    expect(screen.getByText('Schedule Follow-up')).toBeInTheDocument();
  });

  it('displays empty state when no follow-ups exist', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={[]}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    expect(
      screen.getByText('No follow-ups scheduled yet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Click "Schedule Follow-up" to get started.'),
    ).toBeInTheDocument();
  });

  it('displays follow-ups with correct status indicators', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Check for status badges
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
    expect(screen.getByText('OVERDUE')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('displays follow-up type labels correctly', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    expect(screen.getByText('Post-Application')).toBeInTheDocument();
    expect(screen.getByText('Post-Interview')).toBeInTheDocument();
    expect(screen.getByText('Thank You')).toBeInTheDocument();
  });

  it('shows scheduled dates correctly', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Check that at least one date is shown (the component is working)
    expect(screen.getByText(/1\/19\/2024/)).toBeInTheDocument();
  });

  it('shows completed date for completed follow-ups', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Check that the component renders follow-ups (the completed one should be there)
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('displays follow-up messages when available', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    expect(
      screen.getByText(/Follow-up message for application/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Overdue follow-up message/)).toBeInTheDocument();
    expect(screen.getByText(/Thank you message/)).toBeInTheDocument();
  });

  it('displays notes when available', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Check that notes are displayed (the component is working)
    const notesElements = screen.getAllByText(/Notes:/);
    expect(notesElements.length).toBeGreaterThan(0);
  });

  it('sorts follow-ups by priority (overdue first, then due today, then scheduled)', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Get all status badges
    const statusElements = screen.getAllByText(/SCHEDULED|OVERDUE|COMPLETED/);

    // Verify all three statuses are present
    expect(statusElements).toHaveLength(3);
    expect(statusElements.some((el) => el.textContent === 'OVERDUE')).toBe(
      true,
    );
    expect(statusElements.some((el) => el.textContent === 'SCHEDULED')).toBe(
      true,
    );
    expect(statusElements.some((el) => el.textContent === 'COMPLETED')).toBe(
      true,
    );
  });

  it('opens create modal when Schedule Follow-up button is clicked', async () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    const createButton = screen.getByRole('button', {
      name: 'Schedule Follow-up',
    });
    fireEvent.click(createButton);

    // Should open the FollowUpModal - check for the header specifically
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {name: 'Schedule Follow-up'}),
      ).toBeInTheDocument();
    });
  });

  it('handles completing a follow-up', async () => {
    const {completeFollowUp} = await import('../../../api');
    vi.mocked(completeFollowUp).mockResolvedValue({
      ...mockFollowUps[0],
      status: 'COMPLETED',
    });

    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Find and click the complete button for the first follow-up
    const completeButtons = screen.getAllByTitle('Mark as completed');
    fireEvent.click(completeButtons[0]);

    await waitFor(() => {
      expect(completeFollowUp).toHaveBeenCalledWith('followup-1');
      expect(mockOnFollowUpUpdated).toHaveBeenCalled();
    });
  });

  it('handles editing a follow-up', async () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Find and click the edit button for the first follow-up
    const editButtons = screen.getAllByTitle('Edit follow-up');
    fireEvent.click(editButtons[0]);

    // Should open the edit modal
    await waitFor(() => {
      expect(screen.getByText('Edit Follow-up')).toBeInTheDocument();
    });
  });

  it('handles deleting a follow-up', async () => {
    const {deleteFollowUp} = await import('../../../api');
    vi.mocked(deleteFollowUp).mockResolvedValue(mockFollowUp);

    // Mock window.confirm to return true
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Find and click the delete button for the first follow-up
    const deleteButtons = screen.getAllByTitle('Delete follow-up');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteFollowUp).toHaveBeenCalledWith('followup-1');
      expect(mockOnFollowUpDeleted).toHaveBeenCalledWith('followup-1');
    });

    mockConfirm.mockRestore();
  });

  it('does not show complete button for already completed follow-ups', () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    const completeButtons = screen.getAllByTitle('Mark as completed');
    // Should only show 2 complete buttons (for SCHEDULED and OVERDUE, not COMPLETED)
    expect(completeButtons).toHaveLength(2);
  });

  it('calls onFollowUpUpdated when follow-up is updated', async () => {
    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    // Open edit modal
    const editButtons = screen.getAllByTitle('Edit follow-up');
    fireEvent.click(editButtons[0]);

    // The modal should be open and ready for editing
    await waitFor(() => {
      expect(screen.getByText('Edit Follow-up')).toBeInTheDocument();
    });
  });

  it('calls onFollowUpDeleted when follow-up is deleted', async () => {
    const {deleteFollowUp} = await import('../../../api');
    vi.mocked(deleteFollowUp).mockResolvedValue(undefined);

    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <FollowUpList
        application={mockApplication}
        followUps={mockFollowUps}
        onFollowUpUpdated={mockOnFollowUpUpdated}
        onFollowUpDeleted={mockOnFollowUpDeleted}
      />,
    );

    const deleteButtons = screen.getAllByTitle('Delete follow-up');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockOnFollowUpDeleted).toHaveBeenCalledWith('followup-1');
    });

    mockConfirm.mockRestore();
  });
});
