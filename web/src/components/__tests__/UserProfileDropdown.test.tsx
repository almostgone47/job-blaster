import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {UserProfileDropdown} from '../UserProfileDropdown';

// Mock the PreferencesSettings component
vi.mock('../PreferencesSettings', () => ({
  PreferencesSettings: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="preferences-settings">
        <div>Preferences Settings Modal</div>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe('UserProfileDropdown', () => {
  it('renders the user profile button', () => {
    render(<UserProfileDropdown />);

    expect(screen.getByTitle('User Profile')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('shows dropdown menu when clicked', () => {
    render(<UserProfileDropdown />);

    const profileButton = screen.getByTitle('User Profile');
    fireEvent.click(profileButton);

    expect(screen.getByText('⚙️')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('🚪')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('opens preferences settings when Settings is clicked', () => {
    render(<UserProfileDropdown />);

    const profileButton = screen.getByTitle('User Profile');
    fireEvent.click(profileButton);

    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('preferences-settings')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<UserProfileDropdown />);

    const profileButton = screen.getByTitle('User Profile');
    fireEvent.click(profileButton);

    // Verify dropdown is open
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Click outside (on the document body)
    fireEvent.mouseDown(document.body);

    // Verify dropdown is closed
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });
});
