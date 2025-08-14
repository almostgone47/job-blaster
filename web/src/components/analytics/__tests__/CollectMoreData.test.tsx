import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {CollectMoreData} from '../CollectMoreData';

describe('CollectMoreData Component', () => {
  describe('Zero offers state', () => {
    it('renders start building message for 0 offers', () => {
      render(<CollectMoreData offerCount={0} />);

      expect(
        screen.getByText('Start Building Your Salary Profile'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "You don't have any salary data yet. Here's how to get started:",
        ),
      ).toBeInTheDocument();
    });

    it('shows correct examples for zero offers', () => {
      render(<CollectMoreData offerCount={0} />);

      expect(
        screen.getByText(
          'Add salary information when creating new job applications',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Update existing jobs with salary details from job postings',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Track salary offers you receive during interviews'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Record your current salary and any raises/promotions',
        ),
      ).toBeInTheDocument();
    });

    it('shows target of 5+ offers for zero offers', () => {
      render(<CollectMoreData offerCount={0} />);

      expect(
        screen.getByText('Target: 5+ offers for reliable insights'),
      ).toBeInTheDocument();
    });
  });

  describe('Low data state (1-2 offers)', () => {
    it('renders need more data message for 1 offer', () => {
      render(<CollectMoreData offerCount={1} />);

      expect(
        screen.getByText('Need More Data for Reliable Insights'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'With just a few data points, your analytics may not be accurate. Add more to get better insights:',
        ),
      ).toBeInTheDocument();
    });

    it('renders need more data message for 2 offers', () => {
      render(<CollectMoreData offerCount={2} />);

      expect(
        screen.getByText('Need More Data for Reliable Insights'),
      ).toBeInTheDocument();
    });

    it('shows correct examples for low data', () => {
      render(<CollectMoreData offerCount={1} />);

      expect(
        screen.getByText(
          "Add salary ranges from job postings you're interested in",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Track salary offers from different companies'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Record salary data from your network and industry research',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Include benefits and equity information when available',
        ),
      ).toBeInTheDocument();
    });

    it('shows target of 5+ offers for low data', () => {
      render(<CollectMoreData offerCount={1} />);

      expect(
        screen.getByText('Target: 5+ offers for reliable insights'),
      ).toBeInTheDocument();
    });
  });

  describe('Almost there state (3+ offers)', () => {
    it('renders almost there message for 3 offers', () => {
      render(<CollectMoreData offerCount={3} />);

      expect(screen.getByText('Almost There!')).toBeInTheDocument();
      expect(
        screen.getByText(
          'A few more data points will give you much more reliable insights:',
        ),
      ).toBeInTheDocument();
    });

    it('renders almost there message for 4 offers', () => {
      render(<CollectMoreData offerCount={4} />);

      expect(screen.getByText('Almost There!')).toBeInTheDocument();
    });

    it('shows correct examples for almost there state', () => {
      render(<CollectMoreData offerCount={3} />);

      expect(
        screen.getByText('Add salary data from recent job applications'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Track any new offers or salary discussions'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Include location-specific salary information'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Record industry-specific compensation data'),
      ).toBeInTheDocument();
    });

    it('shows target of 10+ offers for almost there state', () => {
      render(<CollectMoreData offerCount={3} />);

      expect(
        screen.getByText('Target: 10+ offers for reliable insights'),
      ).toBeInTheDocument();
    });
  });

  describe('Component structure', () => {
    it('renders with correct CSS classes', () => {
      render(<CollectMoreData offerCount={0} />);

      const container = screen
        .getByText('Start Building Your Salary Profile')
        .closest('div');
      expect(container).toHaveClass('text-center', 'mb-6');
    });

    it('shows both Quick Actions and Pro Tips sections', () => {
      render(<CollectMoreData offerCount={1} />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Pro Tips')).toBeInTheDocument();
    });

    it('displays the data icon', () => {
      render(<CollectMoreData offerCount={0} />);

      expect(screen.getByText('📊')).toBeInTheDocument();
    });
  });
});
