import {useState, useEffect} from 'react';
import type {Template} from '../types';
import {createTemplate, updateTemplate, deleteTemplate} from '../api';

interface TemplateModalProps {
  open: boolean;
  template?: Template | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TemplateModal({
  open,
  template,
  onClose,
  onSaved,
}: TemplateModalProps) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setBody(template.body);
    } else {
      setName('');
      setBody('');
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      if (template) {
        await updateTemplate(template.id, {
          name: name.trim(),
          body: body.trim(),
        });
      } else {
        await createTemplate({name: name.trim(), body: body.trim()});
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!template || !confirm('Are you sure you want to delete this template?'))
      return;

    setIsDeleting(true);
    try {
      await deleteTemplate(template.id);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setBody((prev) => prev + `{${placeholder}}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-gray-800 shadow-xl border border-gray-600 flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-600 bg-gray-800 rounded-t-xl">
          <h2 className="text-lg font-semibold text-white">
            {template ? 'Edit Template' : 'Create Template'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Template Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Software Engineer Cover Letter"
                required
              />
            </div>

            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Template Body
              </label>

              {/* Placeholder buttons */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-gray-400 mr-2">
                  Insert placeholders:
                </span>
                {['jobTitle', 'company', 'skills', 'location', 'source'].map(
                  (placeholder) => (
                    <button
                      key={placeholder}
                      type="button"
                      onClick={() => insertPlaceholder(placeholder)}
                      className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded border border-gray-500 transition-colors"
                    >
                      {placeholder}
                    </button>
                  ),
                )}
              </div>

              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                placeholder="Dear Hiring Manager,

I am writing to express my interest in the {jobTitle} position at {company}...

{skills}

Thank you for considering my application.

Best regards,
[Your Name]"
                required
              />
            </div>
          </form>

          {/* Help text */}
          <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Template Placeholders
            </h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                <code className="bg-gray-600 px-1 rounded">{'{jobTitle}'}</code>{' '}
                - Job title from the posting
              </p>
              <p>
                <code className="bg-gray-600 px-1 rounded">{'{company}'}</code>{' '}
                - Company name
              </p>
              <p>
                <code className="bg-gray-600 px-1 rounded">{'{skills}'}</code> -
                Job skills/tags
              </p>
              <p>
                <code className="bg-gray-600 px-1 rounded">{'{location}'}</code>{' '}
                - Job location
              </p>
              <p>
                <code className="bg-gray-600 px-1 rounded">{'{source}'}</code> -
                Where you found the job
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t border-gray-600 bg-gray-800 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {template && (
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
                disabled={isSubmitting || !name.trim() || !body.trim()}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {template ? 'Updating...' : 'Creating...'}
                  </>
                ) : template ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
