import {createContext, useContext, useState, useEffect} from 'react';
import type {ReactNode} from 'react';

interface UserPreferences {
  currency: string;
  locale: string;
  timezone: string;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (number: number) => string;
}

const defaultPreferences: UserPreferences = {
  currency: 'USD',
  locale: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

export function UserPreferencesProvider({children}: {children: ReactNode}) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem('user-preferences');
      if (stored) {
        return {...defaultPreferences, ...JSON.parse(stored)};
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    return defaultPreferences;
  });

  // Save to localStorage whenever preferences change
  useEffect(() => {
    try {
      localStorage.setItem('user-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({...prev, ...updates}));
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const targetCurrency = currency || preferences.currency;

    // Format with "k" abbreviation for better readability
    if (amount >= 1000) {
      return `${targetCurrency === 'USD' ? '$' : targetCurrency}${Math.round(
        amount / 1000,
      )}k`;
    }

    try {
      return new Intl.NumberFormat(preferences.locale, {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      // Fallback to basic formatting
      return `${
        targetCurrency === 'USD' ? '$' : targetCurrency
      }${amount.toLocaleString()}`;
    }
  };

  const formatNumber = (number: number) => {
    try {
      return new Intl.NumberFormat(preferences.locale).format(number);
    } catch (error) {
      return number.toLocaleString();
    }
  };

  const value: UserPreferencesContextType = {
    preferences,
    updatePreferences,
    formatCurrency,
    formatNumber,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      'useUserPreferences must be used within a UserPreferencesProvider',
    );
  }
  return context;
}

// Hook for easy access to formatting functions
export function useFormatting() {
  const {formatCurrency, formatNumber} = useUserPreferences();
  return {formatCurrency, formatNumber};
}
