import React, {useState, useEffect, Suspense} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {listJobs, exportJobsCSV, listInterviews} from '../api';
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

  // Get interviews for interview alerts
  const {data: interviews = []} = useQuery({
    queryKey: ['interviews'],
    queryFn: listInterviews,
  });

  const [snoozedDeadlines] = usePersistentSet<string>('snoozedDeadlines');
  const [snoozedInterviews] = usePersistentSet<string>('snoozedInterviews');
  const [addOpen, setAddOpen] = useState(false);
  const [interviewManagerOpen, setInterviewManagerOpen] = useState(false);
  const [deadlineAlertsOpen, setDeadlineAlertsOpen] = useState(false);
  const [snoozedAlertsOpen, setSnoozedAlertsOpen] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

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

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const blob = await exportJobsCSV();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jobs-export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      // TODO: Show error toast/notification
    } finally {
      setExportingCSV(false);
    }
  };

  // Navigation functions for alerts
  const [scrollToItemId, setScrollToItemId] = useState<string | null>(null);

  const handleJobAlertClick = (jobId: string) => {
    // Switch to Kanban view and scroll to the job
    handleViewChange('kanban');
    setDeadlineAlertsOpen(false);
    setScrollToItemId(jobId);

    // Clear the scroll target after a delay to remove the highlight
    setTimeout(() => {
      setScrollToItemId(null);
    }, 3500);
  };

  const handleInterviewAlertClick = (interviewId: string) => {
    // Open interview manager to show the specific interview
    setInterviewManagerOpen(true);
    setDeadlineAlertsOpen(false);
    setScrollToItemId(interviewId);

    // Clear the scroll target after a delay to remove the highlight
    setTimeout(() => {
      setScrollToItemId(null);
    }, 3500);
  };

  const renderView = () => {
    switch (currentView) {
      case 'kanban':
        return (
          <KanbanView
            addOpen={addOpen}
            onAddClose={() => setAddOpen(false)}
            interviewManagerOpen={interviewManagerOpen}
            setInterviewManagerOpen={setInterviewManagerOpen}
            scrollToJobId={scrollToItemId}
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
            scrollToJobId={scrollToItemId}
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
          {/* Snoozed Alerts Button - Left of alert bell */}
          {snoozedDeadlines.size > 0 && (
            <button
              onClick={() => setSnoozedAlertsOpen(true)}
              className="text-xs text-gray-400 bg-gray-800 px-2 py-1.5 rounded flex items-center justify-center hover:bg-gray-700 hover:text-gray-300 transition-colors cursor-pointer border border-gray-600"
              title={`View ${snoozedDeadlines.size} snoozed deadline alert${
                snoozedDeadlines.size !== 1 ? 's' : ''
              }`}
            >
              {snoozedDeadlines.size} snoozed
            </button>
          )}

          {/* Alerts Bell - Always visible */}
          {(() => {
            const now = new Date();

            // Deadline alerts
            const urgentDeadlines = jobs.filter((job) => {
              if (!job.deadline || snoozedDeadlines.has(job.id)) return false;
              const deadline = new Date(job.deadline);
              const diffDays = Math.ceil(
                (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );
              return diffDays <= 3; // Show count for overdue, today, tomorrow, and this week
            });

            // Interview alerts
            const urgentInterviews = interviews.filter((interview) => {
              if (!interview.scheduledAt || snoozedInterviews.has(interview.id))
                return false;
              const interviewTime = new Date(interview.scheduledAt);
              const diffDays = Math.ceil(
                (interviewTime.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return diffDays <= 3; // Show count for today, tomorrow, and this week
            });

            const totalAlerts =
              urgentDeadlines.length + urgentInterviews.length;
            const hasAlerts = totalAlerts > 0;

            return (
              <button
                onClick={() => setDeadlineAlertsOpen(true)}
                className={`relative rounded border px-3 py-1.5 text-sm transition-colors ${
                  hasAlerts
                    ? 'border-gray-600 text-white hover:bg-gray-700'
                    : 'border-gray-700 text-gray-500 hover:bg-gray-800 hover:text-gray-400'
                }`}
                title={
                  hasAlerts
                    ? `View ${totalAlerts} urgent alerts`
                    : 'No urgent alerts'
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
                  {totalAlerts}
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

          <button
            onClick={handleExportCSV}
            disabled={exportingCSV}
            className="rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingCSV ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Exporting...
              </>
            ) : (
              'Export CSV'
            )}
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

      {/* Deadline Alerts Modal */}
      {deadlineAlertsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Urgent Alerts</h2>
              <button
                onClick={() => setDeadlineAlertsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {(() => {
              const now = new Date();

              // Deadline alerts
              const urgentDeadlines = jobs.filter((job) => {
                if (!job.deadline || snoozedDeadlines.has(job.id)) return false;
                const deadline = new Date(job.deadline);
                const diffDays = Math.ceil(
                  (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                );
                return diffDays <= 3;
              });

              // Interview alerts
              const urgentInterviews = interviews.filter((interview) => {
                if (
                  !interview.scheduledAt ||
                  snoozedInterviews.has(interview.id)
                )
                  return false;
                const interviewTime = new Date(interview.scheduledAt);
                const diffDays = Math.ceil(
                  (interviewTime.getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return diffDays <= 3;
              });

              const allAlerts = [
                ...urgentDeadlines.map((job) => ({
                  type: 'deadline' as const,
                  data: job,
                  date: job.deadline!,
                  company: job.company,
                  title: job.title,
                  id: job.id,
                })),
                ...urgentInterviews.map((interview) => ({
                  type: 'interview' as const,
                  data: interview,
                  date: interview.scheduledAt,
                  company: interview.job?.company || 'Unknown Company',
                  title: interview.title,
                  id: interview.id,
                })),
              ].sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              );

              if (allAlerts.length === 0) {
                return (
                  <p className="text-gray-300 text-center py-4">
                    No urgent alerts at this time.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {allAlerts.map((alert) => {
                    const alertDate = new Date(alert.date);
                    const diffDays = Math.ceil(
                      (alertDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const isOverdue = diffDays < 0;
                    const isToday = diffDays === 0;
                    const isTomorrow = diffDays === 1;

                    let statusText = '';
                    let statusColor = '';

                    if (isOverdue) {
                      statusText = `${Math.abs(diffDays)} day${
                        Math.abs(diffDays) !== 1 ? 's' : ''
                      } overdue`;
                      statusColor = 'text-red-400';
                    } else if (isToday) {
                      statusText = 'Today';
                      statusColor = 'text-yellow-400';
                    } else if (isTomorrow) {
                      statusText = 'Tomorrow';
                      statusColor = 'text-orange-400';
                    } else {
                      statusText = `In ${diffDays} days`;
                      statusColor = 'text-blue-400';
                    }

                    const alertTypeText =
                      alert.type === 'deadline'
                        ? 'Application Deadline'
                        : 'Interview';

                    return (
                      <div
                        key={`${alert.type}-${alert.id}`}
                        className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors border border-transparent hover:border-gray-500"
                        onClick={() => {
                          if (alert.type === 'deadline') {
                            handleJobAlertClick(alert.id);
                          } else {
                            handleInterviewAlertClick(alert.id);
                          }
                        }}
                        title={`Click to view ${
                          alert.type === 'deadline' ? 'job' : 'interview'
                        } details`}
                      >
                        <div className="flex items-start justify-between">
                          {/* Left side: Company, Alert Type, Date */}
                          <div className="flex-1 space-y-2">
                            <p className="text-gray-300 text-sm font-medium">
                              {alert.company}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {alertTypeText}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {alertDate.toLocaleDateString()}
                            </p>
                          </div>

                          {/* Right side: Position, Status, Button */}
                          <div className="flex flex-col items-end space-y-1.5 ml-4">
                            <h3 className="text-white font-medium text-sm text-right">
                              {alert.title}
                            </h3>
                            <span
                              className={`text-xs font-medium px-2 rounded-full ${statusColor} bg-opacity-20`}
                            >
                              {statusText}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click when clicking snooze
                                if (alert.type === 'deadline') {
                                  snoozedDeadlines.add(alert.id);
                                } else {
                                  snoozedInterviews.add(alert.id);
                                }
                                setDeadlineAlertsOpen(false);
                              }}
                              className="text-xs text-gray-400 hover:text-gray-300 px-2 rounded transition-colors"
                              title="Snooze this alert for 24 hours"
                            >
                              ⏰ Snooze
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Snoozed Alerts Modal */}
      {snoozedAlertsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Snoozed Alerts</h2>
              <button
                onClick={() => setSnoozedAlertsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {(() => {
              // Get snoozed deadline jobs
              const snoozedJobs = jobs.filter(
                (job) => snoozedDeadlines.has(job.id) && job.deadline,
              );

              // Get snoozed interview alerts
              const snoozedInterviewJobs = interviews.filter(
                (interview) =>
                  snoozedInterviews.has(interview.id) && interview.scheduledAt,
              );

              const allSnoozedAlerts = [
                ...snoozedJobs.map((job) => ({
                  type: 'deadline' as const,
                  data: job,
                  date: job.deadline!,
                  company: job.company,
                  title: job.title,
                  id: job.id,
                })),
                ...snoozedInterviewJobs.map((interview) => ({
                  type: 'interview' as const,
                  data: interview,
                  date: interview.scheduledAt,
                  company: interview.job?.company || 'Unknown Company',
                  title: interview.title,
                  id: interview.id,
                })),
              ].sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              );

              if (allSnoozedAlerts.length === 0) {
                return (
                  <p className="text-gray-300 text-center py-4">
                    No snoozed alerts found.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {allSnoozedAlerts.map((alert) => {
                    const alertDate = new Date(alert.date);
                    const alertTypeText =
                      alert.type === 'deadline'
                        ? 'Application Deadline'
                        : 'Interview';

                    return (
                      <div
                        key={`${alert.type}-${alert.id}`}
                        className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors border border-transparent hover:border-gray-500"
                        onClick={() => {
                          if (alert.type === 'deadline') {
                            handleJobAlertClick(alert.id);
                          } else {
                            handleInterviewAlertClick(alert.id);
                          }
                        }}
                        title={`Click to view ${
                          alert.type === 'deadline' ? 'job' : 'interview'
                        } details`}
                      >
                        <div className="flex items-start justify-between">
                          {/* Left side: Company, Alert Type, Date */}
                          <div className="flex-1 space-y-2">
                            <p className="text-gray-300 text-sm font-medium">
                              {alert.company}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {alertTypeText}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {alertDate.toLocaleDateString()}
                            </p>
                          </div>

                          {/* Right side: Position, Status, Button */}
                          <div className="flex flex-col items-end space-y-1.5 ml-4">
                            <h3 className="text-white font-medium text-sm text-right">
                              {alert.title}
                            </h3>
                            <span className="text-xs font-medium px-2 rounded-full text-gray-400 bg-gray-600 bg-opacity-20">
                              Snoozed
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click when clicking restore
                                if (alert.type === 'deadline') {
                                  snoozedDeadlines.delete(alert.id);
                                } else {
                                  snoozedInterviews.delete(alert.id);
                                }
                                setSnoozedAlertsOpen(false);
                              }}
                              className="text-xs text-gray-400 hover:text-gray-300 px-2 rounded transition-colors"
                              title="Restore this alert"
                            >
                              ⏰ Restore Alert
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
