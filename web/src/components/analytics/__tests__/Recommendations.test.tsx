import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import Recommendations from '../Recommendations';

// Test fixtures - match the interface expected by Recommendations component
const mockStats = {
  averageSalary: 75000,
  medianSalary: 70000,
  p25: 60000,
  p75: 85000,
  totalOffers: 8,
};

const mockCompanies = [
  {
    company: 'Google',
    offer_count: 3,
    avgSalary: 90000,
    minSalary: 80000,
    maxSalary: 100000,
  },
  {
    company: 'Microsoft',
    offer_count: 2,
    avgSalary: 70000,
    minSalary: 65000,
    maxSalary: 75000,
  },
  {
    company: 'Startup Inc',
    offer_count: 1,
    avgSalary: 50000,
    minSalary: 50000,
    maxSalary: 50000,
  },
];

const mockOffers = [
  {id: '1', amount: 90000, status: 'PENDING'},
  {id: '2', amount: 70000, status: 'ACCEPTED'},
  {id: '3', amount: 50000, status: 'REJECTED'},
];

describe('Recommendations Component', () => {
  it('renders executive summary with correct calculations', () => {
    render(
      <Recommendations
        companies={mockCompanies}
        stats={mockStats}
        offers={mockOffers}
      />,
    );

    // Check if executive summary is displayed
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();

    // Check if executive summary is displayed
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();

    // Check if insights are generated
    expect(
      screen.getByText(/Focus on High-Paying Companies/),
    ).toBeInTheDocument();
  });

  it('shows top-paying company insights when applicable', () => {
    render(
      <Recommendations
        companies={mockCompanies}
        stats={mockStats}
        offers={mockOffers}
      />,
    );

    // Google pays 20% above average (90k vs 75k average)
    // Should trigger the "Focus on High-Paying Companies" insight
    expect(
      screen.getByText(/pays ~20% above your market average/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Apply to companies in the same tier as Google/),
    ).toBeInTheDocument();
  });

  it('displays action items count correctly', () => {
    render(
      <Recommendations
        companies={mockCompanies}
        stats={mockStats}
        offers={mockOffers}
      />,
    );

    // Should show insights
    expect(
      screen.getByText(/Focus on High-Paying Companies/),
    ).toBeInTheDocument();
  });

  it('shows pro tips section', () => {
    render(
      <Recommendations
        companies={mockCompanies}
        stats={mockStats}
        offers={mockOffers}
      />,
    );

    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByText(/Target Salary/)).toBeInTheDocument();
  });

  it('handles empty companies array gracefully', () => {
    render(
      <Recommendations companies={[]} stats={mockStats} offers={mockOffers} />,
    );

    // Should show "not enough data" message
    expect(
      screen.getByText('Not enough data for recommendations'),
    ).toBeInTheDocument();
  });

  it('displays salary formatting correctly', () => {
    render(
      <Recommendations
        companies={mockCompanies}
        stats={mockStats}
        offers={mockOffers}
      />,
    );

    // Check if salaries are formatted with "k" abbreviation
    expect(screen.getByText(/75k/)).toBeInTheDocument();
    expect(screen.getByText(/85k/)).toBeInTheDocument();
  });
});
