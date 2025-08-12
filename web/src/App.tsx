import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Job Blaster</h1>
          <span className="text-sm text-gray-500">MVP</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Dashboard />
      </main>
    </div>
  );
}
