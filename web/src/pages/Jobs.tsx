import React, {useState, useEffect, Suspense} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {listJobs} from '../api';
import {usePersistentSet} from '../hooks/usePersistentState';

// Lazy load the view components for performance
const KanbanView = React.lazy(() => import('../components/views/KanbanView'));
const ListView = React.lazy(() => import('../components/views/ListView'));
const CalendarView = React.lazy(
  () => import('../components/views/CalendarView'),
);

type ViewType = 'kanban' | 'list' | 'calendar';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<ViewType>('kanban');

  // Get jobs for deadline alerts
  const {data: jobs = []} = useQuery({
    queryKey: ['jobs'],
    queryFn: listJobs,
  });

  const [snoozedDeadlines] = usePersistentSet<string>('snoozedDeadlines');
  const [addOpen, setAddOpen] = useState(false);
  const [interviewManagerOpen, setInterviewManagerOpen] = useState(false);

  // Initialize view from URL params or localStorage
  useEffect(() => {
    const viewFromUrl = searchParams.get('view') as ViewType;
    const viewFromStorage = localStorage.getItem('jobs-view') as ViewType;

    const initialView = viewFromUrl || viewFromStorage || 'kanban';
    setCurrentView(initialView);

    // Update URL if not already set
    if (!viewFromUrl) {
      setSearchParams({view: initialView});
    }
  }, [searchParams, setSearchParams]);

  // Handle view change
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSearchParams({view});
    localStorage.setItem('jobs-view', view);
  };

  // Keyboard shortcuts for cycling views
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        const views: ViewType[] = ['kanban', 'list', 'calendar'];
        const currentIndex = views.indexOf(currentView);
        const nextIndex =
          e.key === '['
            ? (currentIndex - 1 + views.length) % views.length
            : (currentIndex + 1) % views.length;
        handleViewChange(views[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'kanban':
        return (
          <KanbanView
            addOpen={addOpen}
            onAddClose={() => setAddOpen(false)}
            interviewManagerOpen={interviewManagerOpen}
            setInterviewManagerOpen={setInterviewManagerOpen}
          />
        );
      case 'list':
        return <ListView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return (
          <KanbanView
            addOpen={addOpen}
            onAddClose={() => setAddOpen(false)}
            interviewManagerOpen={interviewManagerOpen}
            setInterviewManagerOpen={setInterviewManagerOpen}
          />
        );
    }
  };

  return (
    <div className="min-h-full space-y-4 bg-gray-950">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Add Job Button */}
          <button
            onClick={() => setAddOpen(true)}
            className="rounded bg-blue-600 border border-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
          >
            Add Job
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('kanban')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentView === 'kanban'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              title="Kanban View (Workflow)"
            >
              <span className="text-lg">📋</span>
              <span className="hidden md:inline">Kanban</span>
            </button>

            <button
              onClick={() => handleViewChange('list')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              title="List View (Detailed)"
            >
              <span className="text-lg">📊</span>
              <span className="hidden md:inline">List</span>
            </button>

            <button
              onClick={() => handleViewChange('calendar')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              title="Calendar View (Timeline)"
            >
              <span className="text-lg">📅</span>
              <span className="hidden md:inline">Calendar</span>
            </button>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex gap-2">
          {/* Deadline Alerts Bell - Always visible */}
          {(() => {
            const now = new Date();
            const urgentDeadlines = jobs.filter((job) => {
              if (!job.deadline || snoozedDeadlines.has(job.id)) return false;
              const deadline = new Date(job.deadline);
              const diffDays = Math.ceil(
                (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );
              return diffDays <= 3; // Show count for overdue, today, tomorrow, and this week
            });

            const hasAlerts = urgentDeadlines.length > 0;

            return (
              <button
                onClick={() => {
                  /* TODO: Open deadline alerts modal */
                }}
                className={`relative rounded border px-3 py-1.5 text-sm transition-colors ${
                  hasAlerts
                    ? 'border-gray-600 text-white hover:bg-gray-700'
                    : 'border-gray-700 text-gray-500 hover:bg-gray-800 hover:text-gray-400'
                }`}
                title={
                  hasAlerts ? 'View deadline alerts' : 'No urgent deadlines'
                }
              >
                🔔
                <span
                  className={`absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold ${
                    hasAlerts
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {urgentDeadlines.length}
                </span>
              </button>
            );
          })()}

          {/* View Interviews Button */}
          <button
            onClick={() => setInterviewManagerOpen(true)}
            className="rounded border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            📅 View Interviews
          </button>

          {snoozedDeadlines.size > 0 && (
            <button
              onClick={() => {
                /* TODO: Open snoozed deadlines modal */
              }}
              className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded flex items-center justify-center hover:bg-gray-700 hover:text-gray-300 transition-colors cursor-pointer"
              title={`View ${snoozedDeadlines.size} snoozed deadline alert${
                snoozedDeadlines.size !== 1 ? 's' : ''
              }`}
            >
              {snoozedDeadlines.size} snoozed alert
              {snoozedDeadlines.size !== 1 ? 's' : ''}
            </button>
          )}

          <button
            onClick={() => {
              /* TODO: Export CSV */
            }}
            className="rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* View Content */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-gray-400">
              Loading {currentView} view...
            </div>
          </div>
        }
      >
        {renderView()}
      </Suspense>
    </div>
  );
}
