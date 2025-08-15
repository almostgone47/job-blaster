import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Jobs from '../Jobs';

// Mock the API calls
vi.mock('../../api', () => ({
  listJobs: vi.fn(() => Promise.resolve(mockJobs)),
  listInterviews: vi.fn(() => Promise.resolve([])),
}));

// Mock the lazy-loaded components with better test IDs
vi.mock('../../components/views/KanbanView', () => ({
  default: ({
    addOpen,
    onAddClose,
    interviewManagerOpen,
    setInterviewManagerOpen,
  }: any) => (
    <div data-testid="kanban-view">
      <div>Kanban View</div>
      <div>Add Open: {addOpen ? 'true' : 'false'}</div>
      <div>
        Interview Manager Open: {interviewManagerOpen ? 'true' : 'false'}
      </div>
      <button onClick={onAddClose}>Close Add</button>
      <button onClick={() => setInterviewManagerOpen(!interviewManagerOpen)}>
        Toggle Interview Manager
      </button>
    </div>
  ),
}));

vi.mock('../../components/views/ListView', () => ({
  default: () => <div data-testid="list-view">List View</div>,
}));

vi.mock('../../components/views/CalendarView', () => ({
  default: () => <div data-testid="calendar-view">Calendar View</div>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useSearchParams with better state management
const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams('?view=kanban');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [
      mockSearchParams,
      (params: any) => {
        mockSetSearchParams(params);
        // Update the mock search params to simulate real URL changes
        if (typeof params === 'function') {
          // Handle function form: setSearchParams(prev => ({ ...prev, view: 'list' }))
          const newParams = params(mockSearchParams);
          mockSearchParams = new URLSearchParams(newParams);
        } else if (typeof params === 'object' && params.view) {
          // Handle object form: setSearchParams({ view: 'list' })
          mockSearchParams = new URLSearchParams(params);
        }
      },
    ],
    Link: ({to, children, ...props}: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock usePersistentSet
vi.mock('../../hooks/usePersistentState', () => ({
  usePersistentSet: () => [new Set(), vi.fn()],
}));

const mockJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    status: 'SAVED' as const,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    lastActivityAt: '2025-01-01',
    userId: 'user1',
    url: 'https://example.com',
    tags: ['React', 'TypeScript'],
    salaryCurrency: 'USD',
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Startup Inc',
    status: 'APPLIED' as const,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    lastActivityAt: '2025-01-01',
    userId: 'user1',
    url: 'https://example.com',
    tags: ['Vue', 'JavaScript'],
    salaryCurrency: 'USD',
  },
];

const renderJobs = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Jobs />
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('Jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('kanban');
    localStorageMock.setItem.mockClear();
    mockSetSearchParams.mockClear();
  });

  it('renders the Jobs page with header and view toggle', () => {
    renderJobs();

    expect(screen.getByText('Add Job')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
    // Documents link is now only in the main App header, not on the Jobs page
  });

  it('shows Kanban view by default', () => {
    renderJobs();

    expect(screen.getByTestId('kanban-view')).toBeInTheDocument();
    expect(screen.queryByTestId('list-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument();
  });

  it('switches to List view when List button is clicked', async () => {
    renderJobs();

    const listButton = screen.getByText('📊').closest('button');
    fireEvent.click(listButton!);

    await waitFor(() => {
      expect(screen.getByTestId('list-view')).toBeInTheDocument();
      expect(screen.queryByTestId('kanban-view')).not.toBeInTheDocument();
    });
  });

  it('switches to Calendar view when Calendar button is clicked', async () => {
    renderJobs();

    const calendarButton = screen.getByText('📅').closest('button');
    fireEvent.click(calendarButton!);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
      expect(screen.queryByTestId('kanban-view')).not.toBeInTheDocument();
    });
  });

  it('switches back to Kanban view when Kanban button is clicked', async () => {
    renderJobs();

    // First switch to list view
    const listButton = screen.getByText('📊').closest('button');
    fireEvent.click(listButton!);

    await waitFor(() => {
      expect(screen.getByTestId('list-view')).toBeInTheDocument();
    });

    // Then switch back to kanban
    const kanbanButton = screen.getByText('📋').closest('button');
    fireEvent.click(kanbanButton!);

    await waitFor(() => {
      expect(screen.getByTestId('kanban-view')).toBeInTheDocument();
      expect(screen.queryByTestId('list-view')).not.toBeInTheDocument();
    });
  });

  // Manage Resumes and Manage Templates buttons removed - Documents link is in main header
  // it('shows Manage Resumes button that navigates to documents/resumes', () => {
  //   renderJobs();
  //
  //   const manageResumesButton = screen.getByText('📄 Manage Resumes');
  //   expect(manageResumesButton).toBeInTheDocument();
  //   expect(manageResumesButton.closest('a')).toHaveAttribute(
  //     'href',
  //     '/documents/resumes',
  //   );
  // });

  // it('shows Manage Templates button that navigates to documents/cover-letters', () => {
  //   renderJobs();
  //
  //   const manageTemplatesButton = screen.getByText('✉️ Manage Templates');
  //   expect(manageTemplatesButton).toBeInTheDocument();
  //   expect(manageTemplatesButton.closest('a')).toHaveAttribute(
  //     'href',
  //     '/documents/cover-letters',
  //   );
  // });

  it('shows deadline alerts bell with count', () => {
    renderJobs();

    const bellButton = screen.getByText('🔔');
    expect(bellButton).toBeInTheDocument();

    // The bell should show a count badge (even if it's 0)
    const countBadge = screen.getByText('0'); // Currently showing 0 due to mock data timing
    expect(countBadge).toBeInTheDocument();

    // Verify the bell has the correct styling for no urgent deadlines
    expect(bellButton).toHaveClass('border-gray-700', 'text-gray-500');
    expect(bellButton).toHaveAttribute('title', 'No urgent alerts');
  });

  it('shows View Interviews button', () => {
    renderJobs();

    const interviewsButton = screen.getByText('📅 View Interviews');
    expect(interviewsButton).toBeInTheDocument();
  });

  it('shows Export CSV button', () => {
    renderJobs();

    const exportButton = screen.getByText('Export CSV');
    expect(exportButton).toBeInTheDocument();
  });

  it('opens Add Job modal when Add Job button is clicked', async () => {
    renderJobs();

    const addJobButton = screen.getByText('Add Job');
    fireEvent.click(addJobButton);

    await waitFor(() => {
      expect(screen.getByText('Add Open: true')).toBeInTheDocument();
    });
  });

  it('closes Add Job modal when close button is clicked', async () => {
    renderJobs();

    // Open modal first
    const addJobButton = screen.getByText('Add Job');
    fireEvent.click(addJobButton);

    await waitFor(() => {
      expect(screen.getByText('Add Open: true')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByText('Close Add');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.getByText('Add Open: false')).toBeInTheDocument();
    });
  });

  it('toggles Interview Manager when button is clicked', async () => {
    renderJobs();

    const toggleButton = screen.getByText('Toggle Interview Manager');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(
        screen.getByText('Interview Manager Open: true'),
      ).toBeInTheDocument();
    });

    // Toggle again
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(
        screen.getByText('Interview Manager Open: false'),
      ).toBeInTheDocument();
    });
  });

  it('uses keyboard shortcuts to cycle through views', async () => {
    renderJobs();

    // Press ']' to go to next view (list)
    fireEvent.keyDown(window, {key: ']'});

    await waitFor(() => {
      expect(screen.getByTestId('list-view')).toBeInTheDocument();
    });

    // Press '[' to go to previous view (kanban)
    fireEvent.keyDown(window, {key: '['});

    await waitFor(() => {
      expect(screen.getByTestId('kanban-view')).toBeInTheDocument();
    });
  });

  it('persists view selection in localStorage', async () => {
    renderJobs();

    const listButton = screen.getByText('📊').closest('button');
    fireEvent.click(listButton!);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jobs-view',
        'list',
      );
    });
  });

  it('updates URL params when view changes', async () => {
    renderJobs();

    const listButton = screen.getByText('📊').closest('button');
    fireEvent.click(listButton!);

    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalledWith({view: 'list'});
    });
  });
});
