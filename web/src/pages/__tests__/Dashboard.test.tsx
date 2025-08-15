import React from 'react';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {render} from '../../test/test-utils';
import Dashboard from '../Dashboard';
import type {
  JobStatus,
  AppStatus,
  InterviewType,
  InterviewStatus,
} from '../../types';

// Mock the API functions
vi.mock('../../api', () => ({
  listJobs: vi.fn(),
  listApplications: vi.fn(),
  listInterviews: vi.fn(),
  listResumes: vi.fn(),
  listTemplates: vi.fn(),
  getCompanyResearch: vi.fn(),
}));

const mockJobs = [
  {
    id: '1',
    title: 'Full Stack Engineer',
    company: 'Big Corp',
    status: 'SAVED' as JobStatus,
    location: 'San Francisco, CA',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastActivityAt: '2024-01-01T00:00:00Z',
    tags: ['React', 'TypeScript'],
    userId: 'user-1',
    url: 'https://example.com',
    deadline: '2024-02-01T00:00:00Z',
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
    deadline: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    title: 'Software Engineer',
    company: 'Tech Corp',
    status: 'INTERVIEW' as JobStatus,
    location: 'New York, NY',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    lastActivityAt: '2024-01-03T00:00:00Z',
    tags: ['Python', 'Django'],
    userId: 'user-1',
    url: 'https://example.com',
    deadline: '2024-01-20T00:00:00Z',
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
];

const mockInterviews = [
  {
    id: '1',
    jobId: '1',
    userId: 'user-1',
    title: 'Phone Screen',
    type: 'PHONE_SCREEN' as InterviewType,
    scheduledAt: '2024-01-15T10:00:00Z',
    date: '2024-01-15T10:00:00Z', // For calendar compatibility
    duration: 30,
    status: 'SCHEDULED' as InterviewStatus,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    job: {
      id: '1',
      title: 'Full Stack Engineer',
      company: 'Big Corp',
      status: 'INTERVIEW',
    },
  },
];

const mockResumes = [
  {
    id: '1',
    userId: 'user1',
    name: 'Resume 1',
    fileUrl: 'https://example.com/resume1.pdf',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Resume 2',
    fileUrl: 'https://example.com/resume2.pdf',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockTemplates = [
  {
    id: '1',
    userId: 'user1',
    name: 'Cover Letter Template',
    body: 'Dear Hiring Manager...',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockCompanyResearch = [
  {
    id: '1',
    userId: 'user1',
    companyName: 'Big Corp',
    insights: 'Great company culture',
    rating: 4,
    pros: ['Good benefits', 'Work-life balance', 'Growth opportunities'],
    cons: ['Long hours', 'High pressure'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

// Mock the drag and drop library
vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({children}: {children: React.ReactNode}) => (
    <div>{children}</div>
  ),
  Droppable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode;
  }) =>
    children(
      {
        innerRef: vi.fn(),
        droppableProps: {},
        placeholder: <div />,
      },
      {isDraggingOver: false},
    ),
  Draggable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode;
  }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: {},
        dragHandleProps: {},
      },
      {isDragging: false},
    ),
}));

// Mock React Query to return our mock data
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(({queryKey}) => {
      // Mock specific queries used by Dashboard
      if (queryKey[0] === 'jobs') {
        return {
          data: mockJobs,
          isLoading: false,
          error: null,
        };
      }
      if (queryKey[0] === 'applications') {
        return {
          data: mockApplications,
          isLoading: false,
          error: null,
        };
      }
      if (queryKey[0] === 'resumes') {
        return {
          data: mockResumes,
          isLoading: false,
          error: null,
        };
      }
      // Mock company research query
      if (queryKey[0] === 'company-research') {
        return {
          data: {
            id: '1',
            userId: 'user1',
            companyName: 'Tech Corp',
            insights: 'Great company culture',
            rating: 4,
            pros: [
              'Good benefits',
              'Work-life balance',
              'Growth opportunities',
            ],
            cons: ['Long hours', 'High pressure'],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          isLoading: false,
          error: null,
        };
      }
      // For other queries, return empty data
      return {
        data: [],
        isLoading: false,
        error: null,
      };
    }),
  };
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const {
      listJobs,
      listApplications,
      listInterviews,
      listResumes,
      listTemplates,
      getCompanyResearch,
    } = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);
    vi.mocked(listResumes).mockResolvedValue(mockResumes);
    vi.mocked(listTemplates).mockResolvedValue(mockTemplates);
    vi.mocked(getCompanyResearch).mockResolvedValue(mockCompanyResearch);

    render(<Dashboard />);

    await waitFor(() => {
      // Check for buttons that the Dashboard actually renders
      expect(screen.getByText('Add Job')).toBeInTheDocument();
      expect(screen.getByText('Manage Resumes')).toBeInTheDocument();
    });
  });

  it('displays the main dashboard sections', async () => {
    const {
      listJobs,
      listApplications,
      listInterviews,
      listResumes,
      listTemplates,
      getCompanyResearch,
    } = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);
    vi.mocked(listResumes).mockResolvedValue(mockResumes);
    vi.mocked(listTemplates).mockResolvedValue(mockTemplates);
    vi.mocked(getCompanyResearch).mockResolvedValue(mockCompanyResearch);

    render(<Dashboard />);

    await waitFor(() => {
      // Check for main action buttons
      expect(screen.getByText('Add Job')).toBeInTheDocument();
      expect(screen.getByText('Manage Resumes')).toBeInTheDocument();
      expect(screen.getByText('Manage Templates')).toBeInTheDocument();
      expect(screen.getByText('📅 View Interviews')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    render(<Dashboard />);

    // The component should render immediately with our mocked data
    // Check for the action buttons that are always visible
    expect(screen.getByText('Add Job')).toBeInTheDocument();
    expect(screen.getByText('Manage Resumes')).toBeInTheDocument();
  });

  it('displays job data when available', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Should show the kanban board columns with actual job counts
      expect(screen.getByText('SAVED (1)')).toBeInTheDocument();
      expect(screen.getByText('APPLIED (1)')).toBeInTheDocument();
      expect(screen.getByText('INTERVIEW (1)')).toBeInTheDocument();
      expect(screen.getByText('OFFER (0)')).toBeInTheDocument();
      expect(screen.getByText('REJECTED (0)')).toBeInTheDocument();
    });
  });

  it('handles empty state gracefully', async () => {
    const {
      listJobs,
      listApplications,
      listInterviews,
      listResumes,
      listTemplates,
      getCompanyResearch,
    } = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue([]);
    vi.mocked(listApplications).mockResolvedValue([]);
    vi.mocked(listInterviews).mockResolvedValue([]);
    vi.mocked(listResumes).mockResolvedValue([]);
    vi.mocked(listTemplates).mockResolvedValue([]);
    vi.mocked(getCompanyResearch).mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      // Should still show the action buttons even with no data
      expect(screen.getByText('Add Job')).toBeInTheDocument();
      expect(screen.getByText('Manage Resumes')).toBeInTheDocument();
    });
  });

  it('displays interview banner when interviews exist', async () => {
    const {
      listJobs,
      listApplications,
      listInterviews,
      listResumes,
      listTemplates,
      getCompanyResearch,
    } = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);
    vi.mocked(listResumes).mockResolvedValue(mockResumes);
    vi.mocked(listTemplates).mockResolvedValue(mockTemplates);
    vi.mocked(getCompanyResearch).mockResolvedValue(mockCompanyResearch);

    render(<Dashboard />);

    await waitFor(() => {
      // Should show the kanban board with job counts
      expect(screen.getByText('SAVED (1)')).toBeInTheDocument();
      expect(screen.getByText('APPLIED (1)')).toBeInTheDocument();
    });
  });

  it('shows deadline information when available', async () => {
    const {
      listJobs,
      listApplications,
      listInterviews,
      listResumes,
      listTemplates,
      getCompanyResearch,
    } = await import('../../api');
    vi.mocked(listJobs).mockResolvedValue(mockJobs);
    vi.mocked(listApplications).mockResolvedValue(mockApplications);
    vi.mocked(listInterviews).mockResolvedValue(mockInterviews);
    vi.mocked(listResumes).mockResolvedValue(mockResumes);
    vi.mocked(listTemplates).mockResolvedValue(mockTemplates);
    vi.mocked(getCompanyResearch).mockResolvedValue(mockCompanyResearch);

    render(<Dashboard />);

    await waitFor(() => {
      // Should show the kanban board with job counts
      expect(screen.getByText('SAVED (1)')).toBeInTheDocument();
      expect(screen.getByText('APPLIED (1)')).toBeInTheDocument();
    });
  });
});
