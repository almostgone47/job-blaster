import {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Interview, InterviewType, InterviewStatus, Job} from '../types';
import {
  createInterview,
  updateInterview,
  deleteInterview,
  getJobInterviews,
} from '../api';

interface InterviewModalProps {
  open: boolean;
  interview?: Interview | null;
  job: Job;
  onClose: () => void;
  onSaved: () => void;
}

const INTERVIEW_TYPES: InterviewType[] = [
  'PHONE_SCREEN',
  'TECHNICAL',
  'BEHAVIORAL',
  'SYSTEM_DESIGN',
  'CODING_CHALLENGE',
  'ONSITE',
  'FINAL_ROUND',
  'OTHER',
];

const INTERVIEW_STATUSES: InterviewStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED',
];

export default function InterviewModal({
  open,
  interview,
  job,
  onClose,
  onSaved,
}: InterviewModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<InterviewType>('TECHNICAL');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<InterviewStatus>('SCHEDULED');
  const [reminderAt, setReminderAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(
    null,
  );

  // Fetch existing interviews for this job
  const {data: existingInterviews = []} = useQuery({
    queryKey: ['interviews', job.id],
    queryFn: () => getJobInterviews(job.id),
    enabled: open, // Only fetch when modal is open
  });

  useEffect(() => {
    if (interview) {
      setTitle(interview.title);
      setType(interview.type);
      setScheduledAt(interview.scheduledAt.slice(0, 16)); // Format for datetime-local input
      setDuration(interview.duration);
      setLocation(interview.location || '');
      setParticipants(interview.participants || '');
      setNotes(interview.notes || '');
      setStatus(interview.status);
      setReminderAt(
        interview.reminderAt ? interview.reminderAt.slice(0, 16) : '',
      );
    } else {
      // Default values for new interview
      setTitle('');
      setType('TECHNICAL');
      setScheduledAt('');
      setDuration(60);
      setLocation('');
      setParticipants('');
      setNotes('');
      setStatus('SCHEDULED');
      setReminderAt('');
    }
  }, [interview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;

    setIsSubmitting(true);
    try {
      if (interview) {
        // Editing the interview passed as prop
        await updateInterview(interview.id, {
          title: title.trim(),
          type,
          scheduledAt,
          duration,
          location: location.trim() || undefined,
          participants: participants.trim() || undefined,
          notes: notes.trim() || undefined,
          status,
          reminderAt: reminderAt || undefined,
        });
      } else if (editingInterviewId) {
        // Editing an existing interview from the list
        await updateInterview(editingInterviewId, {
          title: title.trim(),
          type,
          scheduledAt,
          duration,
          location: location.trim() || undefined,
          participants: participants.trim() || undefined,
          notes: notes.trim() || undefined,
          status,
          reminderAt: reminderAt || undefined,
        });
      } else {
        // Creating a new interview
        await createInterview({
          jobId: job.id,
          title: title.trim(),
          type,
          scheduledAt,
          duration,
          location: location.trim() || undefined,
          participants: participants.trim() || undefined,
          notes: notes.trim() || undefined,
          reminderAt: reminderAt || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !interview ||
      !confirm('Are you sure you want to delete this interview?')
    )
      return;

    setIsDeleting(true);
    try {
      await deleteInterview(interview.id);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to delete interview:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-gray-800 shadow-xl border border-gray-600 flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-600 bg-gray-800 rounded-t-xl">
          <h2 className="text-lg font-semibold text-white">
            {interview
              ? 'Edit Interview'
              : editingInterviewId
              ? 'Edit Interview'
              : 'Schedule Interview'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded text-blue-200 text-sm">
            📋 <strong>{job.title}</strong> at <strong>{job.company}</strong>
          </div>

          {/* Existing Interviews Section */}
          {existingInterviews.length > 0 && (
            <div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded">
              <h3 className="text-lg font-medium text-white mb-3">
                📅 Existing Interviews
              </h3>
              <div className="space-y-3">
                {existingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3 bg-gray-700 border border-gray-600 rounded flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {interview.title}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs text-white rounded ${
                            interview.status === 'SCHEDULED'
                              ? 'bg-blue-500'
                              : interview.status === 'CONFIRMED'
                              ? 'bg-green-500'
                              : interview.status === 'COMPLETED'
                              ? 'bg-gray-500'
                              : interview.status === 'CANCELLED'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                        >
                          {interview.status}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded">
                          {interview.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        🕐{' '}
                        {new Date(interview.scheduledAt).toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {interview.duration} min
                        {interview.location && ` • 📍 ${interview.location}`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Pre-fill the form with this interview's data for editing
                        setEditingInterviewId(interview.id);
                        setTitle(interview.title);
                        setType(interview.type);
                        setScheduledAt(interview.scheduledAt.slice(0, 16));
                        setDuration(interview.duration);
                        setLocation(interview.location || '');
                        setParticipants(interview.participants || '');
                        setStatus(interview.status);
                        setNotes(interview.notes || '');
                        setReminderAt(
                          interview.reminderAt
                            ? interview.reminderAt.slice(0, 16)
                            : '',
                        );
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 px-3 py-1 rounded border border-blue-600 hover:bg-blue-600/20 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded text-yellow-200 text-sm">
                ⚠️ <strong>Note:</strong> You can edit an existing interview
                above, or fill out the form below to schedule a new one.
                {editingInterviewId && (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setEditingInterviewId(null);
                        setTitle('');
                        setType('TECHNICAL');
                        setScheduledAt('');
                        setDuration(60);
                        setLocation('');
                        setParticipants('');
                        setNotes('');
                        setStatus('SCHEDULED');
                        setReminderAt('');
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 underline"
                    >
                      Click here to schedule a new interview instead
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Interview Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Technical Interview, Phone Screen"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Interview Type *
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as InterviewType)}
                  className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="scheduledAt"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  min="15"
                  step="15"
                  className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Office address or video call link"
                />
              </div>
              <div>
                <label
                  htmlFor="participants"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Participants
                </label>
                <input
                  type="text"
                  id="participants"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Interviewer names"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as InterviewStatus)}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {INTERVIEW_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reminderAt"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Reminder Time
              </label>
              <input
                type="datetime-local"
                id="reminderAt"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Interview preparation notes, questions to ask, etc."
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t border-gray-600 bg-gray-800 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {interview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded border border-red-600 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              )}
              {editingInterviewId && !interview && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingInterviewId(null);
                    setTitle('');
                    setType('TECHNICAL');
                    setScheduledAt('');
                    setDuration(60);
                    setLocation('');
                    setParticipants('');
                    setNotes('');
                    setStatus('SCHEDULED');
                    setReminderAt('');
                  }}
                  className="rounded border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Clear Form
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !scheduledAt}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {interview || editingInterviewId
                      ? 'Updating...'
                      : 'Scheduling...'}
                  </>
                ) : interview || editingInterviewId ? (
                  'Update Interview'
                ) : (
                  'Schedule Interview'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
