import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Documents from '../Documents';

// Mock the API calls
vi.mock('../../api', () => ({
  listResumes: vi.fn(),
  listTemplates: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/documents/resumes',
    }),
  };
});

const mockResumes = [
  {
    id: '1',
    name: 'Software Engineer Resume',
    fileUrl: 'https://example.com/resume1.pdf',
    createdAt: '2025-01-01T00:00:00Z',
    userId: 'user1',
  },
  {
    id: '2',
    name: 'Frontend Developer Resume',
    fileUrl: 'https://example.com/resume2.pdf',
    createdAt: '2025-01-02T00:00:00Z',
    userId: 'user1',
  },
];

const mockTemplates = [
  {
    id: '1',
    name: 'Software Engineer Cover Letter',
    body: 'Dear Hiring Manager...',
    createdAt: '2025-01-01T00:00:00Z',
    userId: 'user1',
  },
  {
    id: '2',
    name: 'Frontend Developer Cover Letter',
    body: 'Dear Hiring Manager...',
    createdAt: '2025-01-02T00:00:00Z',
    userId: 'user1',
  },
];

const renderDocuments = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Documents />
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('Documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders the Documents page with header and navigation', () => {
    renderDocuments();

    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('← Back to Jobs')).toBeInTheDocument();
  });

  it('shows tabs for Resumes and Cover Letters', () => {
    renderDocuments();

    expect(screen.getByText('📄 Resumes')).toBeInTheDocument();
    expect(screen.getByText('✉️ Cover Letters')).toBeInTheDocument();
  });

  it('shows Resumes tab as active by default', () => {
    renderDocuments();

    const resumesTab = screen.getByText('📄 Resumes').closest('button');
    const coverLettersTab = screen
      .getByText('✉️ Cover Letters')
      .closest('button');

    expect(resumesTab).toHaveClass('border-blue-500', 'text-blue-400');
    expect(coverLettersTab).toHaveClass('border-transparent', 'text-gray-300');
  });

  it('navigates to cover letters when Cover Letters tab is clicked', async () => {
    renderDocuments();

    const coverLettersTab = screen
      .getByText('✉️ Cover Letters')
      .closest('button');
    fireEvent.click(coverLettersTab!);

    expect(mockNavigate).toHaveBeenCalledWith('/documents/cover-letters');
  });

  it('navigates to resumes when Resumes tab is clicked', async () => {
    renderDocuments();

    const resumesTab = screen.getByText('📄 Resumes').closest('button');
    fireEvent.click(resumesTab!);

    expect(mockNavigate).toHaveBeenCalledWith('/documents/resumes');
  });

  it('navigates back to Jobs when Back button is clicked', () => {
    renderDocuments();

    const backButton = screen.getByText('← Back to Jobs');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // TODO: Add more comprehensive tests for data loading, empty states, and data display
  // These require more sophisticated API mocking that we'll implement later
});
