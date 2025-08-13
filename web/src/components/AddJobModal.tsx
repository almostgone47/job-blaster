import {useState} from 'react';
import {parseUrl, createJob} from '../api';

export default function AddJobModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [parseError, setParseError] = useState('');
  const [isLinkedInUrl, setIsLinkedInUrl] = useState(false);
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [tags, setTags] = useState('');
  const [deadline, setDeadline] = useState('');

  function normalizeJobUrl(raw: string) {
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, '');

      // LinkedIn: treat as non-parsable (login / dynamic)
      if (host.endsWith('linkedin.com')) {
        // If there's a currentJobId, build the canonical view URL (still behind login)
        const id =
          u.searchParams.get('currentJobId') ||
          u.pathname.split('/').find((x) => /^\d+$/.test(x)) ||
          null;
        const canonical = id
          ? `https://www.linkedin.com/jobs/view/${id}/`
          : `${u.origin}${u.pathname}`;
        return {
          canonical,
          source: host,
          parsable: false,
          reason: 'linkedin' as const,
        };
      }

      // Also check for other job sites that might not parse well
      if (host.includes('indeed.com') || host.includes('glassdoor.com')) {
        return {
          canonical: u.toString(),
          source: host,
          parsable: false,
          reason: 'job-board' as const,
        };
      }

      return {canonical: u.toString(), source: host, parsable: true as const};
    } catch {
      return {
        canonical: raw,
        source: '',
        parsable: false as const,
        reason: 'invalid' as const,
      };
    }
  }

  async function handleParse() {
    if (!url) return;

    setParseError('');
    setIsLinkedInUrl(false);

    const normalized = normalizeJobUrl(url);

    // For now, treat most URLs as requiring manual entry
    if (
      !normalized.parsable ||
      normalized.reason === 'linkedin' ||
      normalized.reason === 'job-board'
    ) {
      if (normalized.reason === 'linkedin') {
        setIsLinkedInUrl(true);
        setParseError(
          'LinkedIn URLs cannot be automatically parsed. Please enter job details manually below.',
        );
      } else {
        setParseError(
          'This URL may not parse correctly. Please enter job details manually below.',
        );
      }
      setSource(normalized.source);
      return;
    }

    // Only try parsing for URLs we're confident about
    setLoading(true);
    try {
      const r = await parseUrl(url);
      if (r.title && r.company && r.title !== r.company) {
        setTitle(r.title);
        setCompany(r.company);
        setSource(r.source || '');
        setFaviconUrl(r.faviconUrl || '');
        setParseError(''); // Clear any previous errors
      } else {
        setParseError(
          'Parsing found generic information. Please enter job details manually.',
        );
        setSource(r.source || '');
      }
    } catch (error) {
      setParseError('Parsing failed. Please enter job details manually below.');
      console.error('Parse error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!title || !company || !url) return;
    setLoading(true);
    setParseError('');

    try {
      // Parse tags from comma-separated string
      const tagsArray = tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        : [];

      await createJob({
        title,
        company,
        url,
        source,
        faviconUrl,
        salary: salary || null,
        location: location || null,
        tags: tagsArray,
        deadline: deadline || null,
        notes: null, // We'll add notes editing later
      });

      onCreated();
      onClose();
      setUrl('');
      setTitle('');
      setCompany('');
      setSource('');
      setFaviconUrl('');
      setSalary('');
      setLocation('');
      setJobType('');
      setTags('');
      setDeadline('');
      setParseError('');
      setIsLinkedInUrl(false);
    } catch (error) {
      console.error('Save error:', error);
      setParseError(
        'Failed to save job. Please check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold ">Add Job</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Close
          </button>
        </div>

        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded text-blue-200 text-sm">
          💡 <strong>Quick Add:</strong> Simply enter the job title and company
          name below. The URL field is optional and mainly for reference.
          Parsing is available but may not work on all job sites.
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Job URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste job URL here (optional - for reference)"
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleParse}
              disabled={!url || loading}
              className="mt-2 rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 hover:bg-gray-800"
            >
              {loading ? 'Parsing…' : 'Try to Parse (Optional)'}
            </button>

            {parseError && (
              <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded text-yellow-200 text-sm">
                {parseError}
              </div>
            )}

            {isLinkedInUrl && (
              <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600/30 rounded text-blue-200 text-sm">
                💡 <strong>LinkedIn Tip:</strong> For better results, try to
                find the "View on company site" link on the LinkedIn job posting
                and use that URL instead.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Job Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
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
                placeholder="e.g., WEX Inc."
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Source
              </label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., LinkedIn, Indeed, Company Site"
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Favicon URL
              </label>
              <input
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="Company logo URL (optional)"
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select type...</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
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
              disabled={loading || !title || !company || !url}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
