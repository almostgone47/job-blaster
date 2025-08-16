import {render, screen} from '@testing-library/react';
import {vi} from 'vitest';
import {LoadingSkeleton} from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders without crashing', () => {
    render(<LoadingSkeleton type="card" />);
    // Component renders successfully - check for the container
    const container = document.querySelector(
      '.bg-gray-800.border.rounded-xl.p-8',
    );
    expect(container).toBeInTheDocument();
  });

  it('displays card skeleton correctly', () => {
    render(<LoadingSkeleton type="card" />);

    // Should show card skeleton with proper classes
    const skeleton = document.querySelector(
      '.bg-gray-800.border.rounded-xl.p-8',
    );
    expect(skeleton).toHaveClass('bg-gray-800', 'border', 'rounded-xl', 'p-8');
  });

  it('applies correct CSS classes for card type', () => {
    render(<LoadingSkeleton type="card" />);

    const skeleton = document.querySelector(
      '.bg-gray-800.border.rounded-xl.p-8',
    );
    expect(skeleton).toHaveClass('bg-gray-800', 'border-gray-600');
  });

  it('shows skeleton items with proper styling for card type', () => {
    render(<LoadingSkeleton type="card" />);

    // Check for skeleton elements with proper classes
    const skeletonElements = document.querySelectorAll('.bg-gray-700.rounded');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders chart skeleton correctly', () => {
    render(<LoadingSkeleton type="chart" />);

    const skeleton = document.querySelector(
      '.bg-gray-800.border.rounded-xl.p-8',
    );
    expect(skeleton).toHaveClass('bg-gray-800', 'border', 'rounded-xl', 'p-8');
  });

  it('renders table skeleton correctly', () => {
    render(<LoadingSkeleton type="table" />);

    const skeleton = document.querySelector(
      '.bg-gray-800.border.rounded-xl.p-8',
    );
    expect(skeleton).toHaveClass('bg-gray-800', 'border', 'rounded-xl', 'p-8');
  });

  it('renders stats skeleton correctly', () => {
    render(<LoadingSkeleton type="stats" />);

    const skeleton = document.querySelector(
      '.bg-gray-800.border.rounded-xl.p-8',
    );
    expect(skeleton).toHaveClass('bg-gray-800', 'border', 'rounded-xl', 'p-8');
  });
});
