import {useState, useEffect, useRef} from 'react';
import type {Resume} from '../types';

export default function ResumeModal({
  resume,
  open,
  onClose,
  onSaved,
}: {
  resume: Resume | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when resume changes
  useEffect(() => {
    if (resume) {
      setName(resume.name);
      setFile(null);
      setFileName(resume.fileUrl.split('/').pop() || 'Current file');
    } else {
      setName('');
      setFile(null);
      setFileName('');
    }
    setError('');
  }, [resume]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError('');
  }

  function handleRemoveFile() {
    setFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSave() {
    if (!name) {
      setError('Please enter a resume name');
      return;
    }

    if (!resume && !file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      const {createResume, updateResume} = await import('../api');

      if (resume) {
        // Update existing resume
        if (file) {
          // TODO: Handle file upload for updates
          // For now, just update the name
          await updateResume(resume.id, {name});
        } else {
          await updateResume(resume.id, {name});
        }
      } else {
        // Create new resume
        if (file) {
          // TODO: Handle file upload
          // For now, create a placeholder URL
          const placeholderUrl = `resume-${Date.now()}.pdf`;
          await createResume({name, fileUrl: placeholderUrl});
        }
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      setError('Failed to save resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {resume ? 'Edit Resume' : 'Add Resume'}
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Resume Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Senior Dev v2.1, Frontend 2024, Marketing Resume"
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Resume File *
            </label>

            {!resume && !file ? (
              // File upload for new resumes
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded border-2 border-dashed border-gray-500 bg-gray-700 px-4 py-8 text-gray-300 hover:border-blue-500 hover:bg-gray-600 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-medium">Click to upload PDF</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Maximum file size: 10MB
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              // File preview for existing resumes or selected files
              <div className="mt-1 p-3 bg-gray-700 rounded border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">📄</span>
                    <span className="text-white font-medium">{fileName}</span>
                  </div>
                  {!resume && (
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {resume && (
                  <div className="mt-2 text-sm text-gray-400">
                    Current file: {resume.fileUrl}
                  </div>
                )}
              </div>
            )}

            {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
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
              disabled={loading}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : resume ? 'Update Resume' : 'Add Resume'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
