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

  async function handleParse() {
    if (!url) return;
    setLoading(true);
    try {
      const r = await parseUrl(url);
      setTitle(r.title || '');
      setCompany(r.company || '');
      setSource(r.source || '');
      setFaviconUrl(r.faviconUrl || '');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!title || !company || !url) return;
    setLoading(true);
    try {
      await createJob({title, company, url, source, faviconUrl});
      onCreated();
      onClose();
      setUrl('');
      setTitle('');
      setCompany('');
      setSource('');
      setFaviconUrl('');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Job</h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium">Job URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/careers/..."
              className="mt-1 w-full rounded border px-3 py-2"
            />
            <button
              onClick={handleParse}
              disabled={!url || loading}
              className="mt-2 rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {loading ? 'Parsing…' : 'Parse'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Source</label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Favicon URL</label>
              <input
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded border px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !title || !company || !url}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              Save Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
