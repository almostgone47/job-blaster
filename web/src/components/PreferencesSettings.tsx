import {useState} from 'react';
import {useUserPreferences} from '../contexts/UserPreferences';

interface PreferencesSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesSettings({
  isOpen,
  onClose,
}: PreferencesSettingsProps) {
  const {preferences, updatePreferences} = useUserPreferences();
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleSave = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleCancel = () => {
    setLocalPreferences(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Display Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Currency Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <p className="text-xs text-gray-500 mb-2">
              The currency used to display salary amounts
            </p>
            <select
              value={localPreferences.currency}
              onChange={(e) =>
                setLocalPreferences((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="CAD">CAD (C$) - Canadian Dollar</option>
              <option value="AUD">AUD (A$) - Australian Dollar</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
            </select>
          </div>

          {/* Number & Date Format Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number & Date Format
            </label>
            <p className="text-xs text-gray-500 mb-2">
              How numbers, dates, and currencies are displayed
            </p>
            <select
              value={localPreferences.locale}
              onChange={(e) =>
                setLocalPreferences((prev) => ({
                  ...prev,
                  locale: e.target.value,
                }))
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en-US">English (US) - 1,234.56</option>
              <option value="en-GB">English (UK) - 1,234.56</option>
              <option value="en-CA">English (Canada) - 1,234.56</option>
              <option value="de-DE">German - 1.234,56</option>
              <option value="fr-FR">French - 1 234,56</option>
              <option value="es-ES">Spanish - 1.234,56</option>
              <option value="ja-JP">Japanese - 1,234.56</option>
            </select>
          </div>

          {/* Timezone Display (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Your local timezone for date and time displays
            </p>
            <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400">
              {localPreferences.timezone}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Automatically detected from your system
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
