import {useState, useEffect} from 'react';
import type {Job, JobStatus} from '../types';

const STATUS_OPTIONS: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

export default function EditJobModal({
  job,
  open,
  onClose,
  onUpdated,
}: {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<JobStatus>('SAVED');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [deadline, setDeadline] = useState('');

  // Update form when job changes
  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setCompany(job.company);
      setStatus(job.status);
      setNotes(job.notes || '');
      setSalary(job.salary || '');
      setLocation(job.location || '');
      setTags(job.tags ? job.tags.join(', ') : '');
      setDeadline(
        job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      );
    }
  }, [job]);

  async function handleSave() {
    if (!job || !title || !company) return;

    setLoading(true);
    try {
      // Import the updateJob function
      const {updateJob} = await import('../api');

      // Parse tags from comma-separated string
      const tagsArray = tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        : [];

      await updateJob(job.id, {
        title,
        company,
        status,
        notes: notes || null,
        salary: salary || null,
        location: location || null,
        tags: tagsArray,
        deadline: deadline || null,
      });

      onUpdated();
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  }

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Edit Job</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Job Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Company Name *
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about the role, requirements, your thoughts..."
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Salary Range
              </label>
              <input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g., $120k-150k, $80k+"
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Remote, NYC, Hybrid"
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Tags
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., Frontend, Senior, Startup, React (separate with commas)"
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !title || !company}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
