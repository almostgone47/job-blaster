import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import App from './App';

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

describe('App', () => {
  it('renders the header with navigation links', () => {
    renderApp();

    expect(screen.getByText('Job Blaster')).toBeInTheDocument();
    expect(screen.getByText('🚀 Jobs')).toBeInTheDocument();
    expect(screen.getByText('💰 Salary Analytics')).toBeInTheDocument();

    // Find the Documents link in the header navigation specifically
    const headerNav = screen.getByRole('navigation');
    expect(headerNav.querySelector('a[href="/documents"]')).toBeInTheDocument();
  });

  it('shows Jobs as the main page by default', () => {
    renderApp();

    // Should show the Jobs page content
    expect(screen.getByText('Add Job')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('navigates to Documents when Documents link is clicked', () => {
    renderApp();

    // Find the Documents link in the header navigation specifically
    const headerNav = screen.getByRole('navigation');
    const documentsLink = headerNav.querySelector('a[href="/documents"]');
    expect(documentsLink).toBeInTheDocument();
    expect(documentsLink).toHaveAttribute('href', '/documents');
  });

  it('navigates to Salary Analytics when Salary Analytics link is clicked', () => {
    renderApp();

    const salaryLink = screen.getByText('💰 Salary Analytics');
    expect(salaryLink).toBeInTheDocument();
    expect(salaryLink.closest('a')).toHaveAttribute(
      'href',
      '/salary-analytics',
    );
  });

  it('navigates to Jobs when Jobs link is clicked', () => {
    renderApp();

    const jobsLink = screen.getByText('🚀 Jobs');
    expect(jobsLink).toBeInTheDocument();
    expect(jobsLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('shows the user profile dropdown', () => {
    renderApp();

    expect(screen.getByTitle('User Profile')).toBeInTheDocument();
  });
});
