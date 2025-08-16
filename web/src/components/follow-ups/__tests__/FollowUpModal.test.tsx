import {render, screen} from '@testing-library/react';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import FollowUpModal from '../FollowUpModal';
import type {Application} from '../../../types';

// Mock the entire api module
vi.mock('../../../api', () => ({
  createFollowUp: vi.fn(),
  updateFollowUp: vi.fn(),
  listFollowUpTemplates: vi.fn(),
}));

const mockApplication: Application = {
  id: 'app-1',
  userId: 'user-1',
  jobId: 'job-1',
  status: 'APPLIED',
  appliedAt: '2024-01-15T00:00:00Z',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
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
    deadline: '2024-02-15T00:00:00Z',
    status: 'APPLIED',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    lastActivityAt: '2024-01-15T00:00:00Z',
    isRemote: true,
    locationCity: 'San Francisco',
    locationState: 'CA',
    locationCountry: 'USA',
    postedAt: '2024-01-10T00:00:00Z',
    salaryCurrency: 'USD',
    salaryMin: 100000,
    salaryMax: 120000,
    salaryType: 'ANNUAL',
  },
};

const mockTemplates = [
  {
    id: 'template-1',
    name: 'Post-Application Follow-up',
    description: 'Standard follow-up after applying',
    message: 'Thank you for considering my application...',
    type: 'POST_APPLICATION' as const,
    isDefault: true,
    isPremium: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('FollowUpModal', () => {
  const mockOnClose = vi.fn();
  const mockOnFollowUpCreated = vi.fn();
  const mockOnFollowUpUpdated = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock the API functions to return templates
    const {listFollowUpTemplates} = await import('../../../api');
    vi.mocked(listFollowUpTemplates).mockResolvedValue(mockTemplates);
  });

  it('renders without crashing', () => {
    render(
      <FollowUpModal
        isOpen={true}
        onClose={mockOnClose}
        application={mockApplication}
        onFollowUpCreated={mockOnFollowUpCreated}
        onFollowUpUpdated={mockOnFollowUpUpdated}
      />,
    );

    // Check for the header specifically
    expect(
      screen.getByRole('heading', {name: 'Schedule Follow-up'}),
    ).toBeInTheDocument();
  });

  it('displays job information correctly', () => {
    render(
      <FollowUpModal
        isOpen={true}
        onClose={mockOnClose}
        application={mockApplication}
        onFollowUpCreated={mockOnFollowUpCreated}
        onFollowUpUpdated={mockOnFollowUpUpdated}
      />,
    );

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('shows follow-up type options', () => {
    render(
      <FollowUpModal
        isOpen={true}
        onClose={mockOnClose}
        application={mockApplication}
        onFollowUpCreated={mockOnFollowUpCreated}
        onFollowUpUpdated={mockOnFollowUpUpdated}
      />,
    );

    expect(screen.getByText('Post-Application')).toBeInTheDocument();
    expect(screen.getByText('Post-Interview')).toBeInTheDocument();
    expect(screen.getByText('Thank You')).toBeInTheDocument();
    expect(screen.getByText('Salary Negotiation')).toBeInTheDocument();
    expect(screen.getByText('General Inquiry')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <FollowUpModal
        isOpen={false}
        onClose={mockOnClose}
        application={mockApplication}
        onFollowUpCreated={mockOnFollowUpCreated}
        onFollowUpUpdated={mockOnFollowUpUpdated}
      />,
    );

    expect(screen.queryByText('Schedule Follow-up')).not.toBeInTheDocument();
  });
});
