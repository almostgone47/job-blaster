import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-full">
      <header className="border-b border-gray-600">
        <div className="mx-auto max-w-8xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Job Blaster</h1>
          <span className="text-sm">MVP</span>
        </div>
      </header>
      <main className="mx-auto max-w-8xl px-4 py-6">
        <Dashboard />
      </main>
    </div>
  );
}
