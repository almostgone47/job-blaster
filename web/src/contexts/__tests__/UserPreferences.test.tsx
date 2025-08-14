import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  UserPreferencesProvider,
  useUserPreferences,
  useFormatting,
} from '../UserPreferences';

// Test component to access context
function TestComponent() {
  const {preferences, updatePreferences} = useUserPreferences();
  const {formatCurrency, formatNumber} = useFormatting();

  return (
    <div>
      <div data-testid="currency">{preferences.currency}</div>
      <div data-testid="locale">{preferences.locale}</div>
      <div data-testid="formatted-currency">{formatCurrency(75000)}</div>
      <div data-testid="formatted-number">{formatNumber(1234.56)}</div>
      <button onClick={() => updatePreferences({currency: 'EUR'})}>
        Change to EUR
      </button>
    </div>
  );
}

describe('UserPreferences Context', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Default preferences', () => {
    it('provides default preferences when none stored', () => {
      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('locale')).toHaveTextContent('en-US');
    });

    it('detects timezone automatically', () => {
      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      expect(timezone).toBeDefined();
    });
  });

  describe('Currency formatting', () => {
    it('formats USD correctly with k abbreviation', () => {
      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      expect(screen.getByTestId('formatted-currency')).toHaveTextContent('75k');
    });

    it('formats small amounts without k abbreviation', () => {
      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      expect(screen.getByTestId('formatted-currency')).toHaveTextContent('75k');
    });

    it('handles different currencies', () => {
      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      expect(screen.getByTestId('formatted-currency')).toHaveTextContent('75k');
    });
  });

  describe('Number formatting', () => {
    it('formats numbers according to locale', () => {
      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      expect(screen.getByTestId('formatted-number')).toHaveTextContent(
        '1,234.56',
      );
    });
  });

  describe('Preference updates', () => {
    it('updates preferences and persists to localStorage', () => {
      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      // Initial state
      expect(screen.getByTestId('currency')).toHaveTextContent('USD');

      // Update preference
      fireEvent.click(screen.getByText('Change to EUR'));

      // Should update immediately
      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');

      // Should persist to localStorage
      const stored = localStorage.getItem('user-preferences');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.currency).toBe('EUR');
    });

    it('loads preferences from localStorage on mount', () => {
      // Set up localStorage
      localStorage.setItem(
        'user-preferences',
        JSON.stringify({
          currency: 'GBP',
          locale: 'en-GB',
        }),
      );

      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('GBP');
      expect(screen.getByTestId('locale')).toHaveTextContent('en-GB');
    });

    it('merges stored preferences with defaults', () => {
      // Set up partial localStorage
      localStorage.setItem(
        'user-preferences',
        JSON.stringify({
          currency: 'CAD',
          // locale not set, should use default
        }),
      );

      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('CAD');
      expect(screen.getByTestId('locale')).toHaveTextContent('en-US'); // default
    });
  });

  describe('Error handling', () => {
    it('handles invalid localStorage gracefully', () => {
      // Set invalid JSON
      localStorage.setItem('user-preferences', 'invalid json');

      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      // Should fall back to defaults
      expect(screen.getByTestId('currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('locale')).toHaveTextContent('en-US');
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(
        <UserPreferencesProvider>
          <TestComponent />
        </UserPreferencesProvider>,
      );

      // Should still work with defaults
      expect(screen.getByTestId('currency')).toHaveTextContent('USD');

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });
});
