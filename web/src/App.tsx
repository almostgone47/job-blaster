import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Jobs from './pages/Jobs';
import SalaryAnalytics from './pages/SalaryAnalytics';
import {UserPreferencesProvider} from './contexts/UserPreferences';

export default function App() {
  return (
    <UserPreferencesProvider>
      <Router>
        <div className="min-h-full">
          <header className="border-b border-gray-600">
            <div className="mx-auto max-w-8xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-xl font-semibold">Job Blaster</h1>
                <nav className="flex items-center space-x-4">
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    🚀 Jobs
                  </Link>
                  <Link
                    to="/salary-analytics"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    💰 Salary Analytics
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  MVP - Job Tracking & Analytics
                </span>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-8xl px-4 py-6">
            <Routes>
              <Route path="/" element={<Jobs />} />
              <Route path="/salary-analytics" element={<SalaryAnalytics />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserPreferencesProvider>
  );
}
