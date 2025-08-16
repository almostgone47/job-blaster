import {useState, useEffect} from 'react';
import type {CompanyResearch} from '../types';
import {upsertCompanyResearch, deleteCompanyResearch} from '../api';

interface CompanyResearchModalProps {
  companyName: string;
  research?: CompanyResearch | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function CompanyResearchModal({
  companyName,
  research,
  open,
  onClose,
  onSaved,
}: CompanyResearchModalProps) {
  const [website, setWebsite] = useState('');
  const [domain, setDomain] = useState('');
  const [insights, setInsights] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update form when research changes
  useEffect(() => {
    if (research) {
      setWebsite(research.website || '');
      setDomain(research.domain || '');
      setInsights(research.insights || '');
      setRating(research.rating || '');
      setPros(research.pros ? research.pros.join('\n') : '');
      setCons(research.cons ? research.cons.join('\n') : '');
    } else {
      setWebsite('');
      setDomain('');
      setInsights('');
      setRating('');
      setPros('');
      setCons('');
    }
  }, [research]);

  async function handleSave() {
    setLoading(true);
    try {
      // Parse pros and cons from newline-separated strings
      const prosArray = pros
        ? pros
            .split('\n')
            .map((p) => p.trim())
            .filter((p) => p)
        : [];

      const consArray = cons
        ? cons
            .split('\n')
            .map((c) => c.trim())
            .filter((c) => c)
        : [];

      await upsertCompanyResearch({
        companyName,
        website: website || undefined,
        domain: domain || undefined,
        insights: insights || '',
        rating: rating ? Number(rating) : undefined,
        pros: prosArray,
        cons: consArray,
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!research) return;

    if (
      !confirm(`Are you sure you want to delete research for ${companyName}?`)
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteCompanyResearch(companyName);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Company Research: {companyName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Company Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.com"
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Company Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="company.com"
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used for automatically linking jobs to company profiles
            </p>
          </div>

          {/* Insights */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Research Insights
            </label>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              rows={4}
              placeholder="Add your research notes about the company, culture, benefits, work environment, etc..."
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Company Rating (1-5)
            </label>
            <select
              value={rating}
              onChange={(e) =>
                setRating(e.target.value ? Number(e.target.value) : '')
              }
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">No rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Below Average</option>
              <option value="3">3 - Average</option>
              <option value="4">4 - Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>

          {/* Pros */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Pros (one per line)
            </label>
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              rows={3}
              placeholder="Company benefits, positive aspects, strengths..."
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Cons */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Cons (one per line)
            </label>
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              rows={3}
              placeholder="Drawbacks, concerns, areas for improvement..."
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-600">
          <div>
            {research && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Research'}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save Research'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
