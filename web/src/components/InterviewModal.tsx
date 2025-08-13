import {useState, useEffect} from 'react';
import type {Interview, InterviewType, InterviewStatus, Job} from '../types';
import {createInterview, updateInterview, deleteInterview} from '../api';

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
      } else {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {interview ? 'Edit Interview' : 'Schedule Interview'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded text-blue-200 text-sm">
          📋 <strong>{job.title}</strong> at <strong>{job.company}</strong>
        </div>

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

          <div className="flex items-center justify-between pt-4">
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
                    {interview ? 'Updating...' : 'Scheduling...'}
                  </>
                ) : interview ? (
                  'Update Interview'
                ) : (
                  'Schedule Interview'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
