import {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Job, Application, AppStatus, Resume, FollowUp} from '../../types';
import {listTemplates, listFollowUps} from '../../api';
import {processTemplate} from '../../utils/templateProcessor';
import {FollowUpList} from '../follow-ups';

const APP_STATUS_OPTIONS: AppStatus[] = [
  'DRAFT',
  'APPLIED',
  'INTERVIEW',
  'OA',
  'OFFER',
  'REJECTED',
];

export default function ApplicationModal({
  job,
  application,
  open,
  onClose,
  onSaved,
  resumes,
}: {
  job: Job;
  application?: Application | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  resumes: Resume[];
}) {
  const [status, setStatus] = useState<AppStatus>('APPLIED');
  const [appliedAt, setAppliedAt] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  // Fetch templates
  const {data: templates = []} = useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  });

  // Fetch follow-ups for this application
  const {data: followUpsData = []} = useQuery({
    queryKey: ['follow-ups', application?.id],
    queryFn: () => application ? listFollowUps({ applicationId: application.id }) : Promise.resolve([]),
    enabled: !!application?.id,
  });

  // Update follow-ups when data changes
  useEffect(() => {
    setFollowUps(followUpsData);
  }, [followUpsData]);

  // Update form when application changes
  useEffect(() => {
    if (application) {
      setStatus(application.status);
      setAppliedAt(
        application.appliedAt
          ? new Date(application.appliedAt).toISOString().split('T')[0]
          : '',
      );
      setResumeId(application.resumeId || '');
      setCoverNote(application.coverNote || '');
      setNextActionDate(
        application.nextAction
          ? new Date(application.nextAction).toISOString().split('T')[0]
          : '',
      );
      setNotes(application.notes || '');
    } else {
      // Default values for new application
      setStatus('APPLIED');
      setAppliedAt(new Date().toISOString().split('T')[0]);
      setResumeId('');
      setCoverNote('');
      setNextActionDate('');
      setNotes('');
    }
    setSelectedTemplateId('');
  }, [application]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        const processedCoverNote = processTemplate(template.body, job);
        setCoverNote(processedCoverNote);
      }
    }
  };

  async function handleSave() {
    if (!job) return;

    setLoading(true);
    try {
      const {createApplication, updateApplication} = await import('../../api');

      if (application) {
        // Update existing application - expects string dates
        const updateData = {
          status,
          appliedAt: appliedAt ? new Date(appliedAt).toISOString() : undefined,
          resumeId: resumeId || undefined,
          coverNote: coverNote || undefined,
          nextAction: nextActionDate
            ? new Date(nextActionDate).toISOString()
            : undefined,
          notes: notes || undefined,
        };
        console.log(
          'Updating application:',
          application.id,
          'with data:',
          updateData,
        );
        const result = await updateApplication(application.id, updateData);
        console.log('Update result:', result);

        // Debug: Check if the data was actually saved
        console.log('Original form values:', {
          status,
          appliedAt,
          resumeId,
          coverNote,
          nextActionDate,
          notes,
        });
      } else {
        // Create new application - expects Date objects
        const createData = {
          jobId: job.id,
          status,
          appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
          resumeId: resumeId || undefined,
          coverNote: coverNote || undefined,
          nextAction: nextActionDate ? new Date(nextActionDate) : undefined,
          notes: notes || undefined,
        };
        console.log(
          'Creating new application for job:',
          job.id,
          'with data:',
          createData,
        );
        const result = await createApplication(createData);
        console.log('Create result:', result);

        // Debug: Check if the data was actually saved
        console.log('Original form values:', {
          status,
          appliedAt,
          resumeId,
          coverNote,
          nextActionDate,
          notes,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!open || !job) return null;

  const hasApplicationRecord = !!application;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-2xl rounded-xl bg-gray-800 p-6 shadow-xl border border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {application ? 'Edit Application' : 'Track Application'}
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Close
          </button>
        </div>

        <div className="mt-4 mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded text-blue-200 text-sm">
          📋 <strong>{job.title}</strong> at <strong>{job.company}</strong>
          <div className="mt-1 text-xs">
            Job Status: <span className="font-semibold">{job.status}</span>
            {hasApplicationRecord && (
              <span className="ml-2">• Has Application Record</span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Application Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppStatus)}
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {APP_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Applied Date
              </label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Resume Version
              </label>
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a Resume</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Next Action Date
              </label>
              <input
                type="date"
                value={nextActionDate}
                onChange={(e) => setNextActionDate(e.target.value)}
                placeholder="When to follow up?"
                className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Cover Note
            </label>

            {/* Template selector */}
            {templates.length > 0 && (
              <div className="mb-2">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Use a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={3}
              placeholder="What you wrote in your cover letter or application message..."
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Application Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Track responses, interview details, feedback, next steps..."
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Follow-ups Section - Only show for existing applications */}
          {application && (
            <div className="border-t border-gray-600 pt-6">
              <FollowUpList
                application={application}
                followUps={followUps}
                onFollowUpUpdated={(updatedFollowUp) => {
                  setFollowUps(prev => 
                    prev.map(f => f.id === updatedFollowUp.id ? updatedFollowUp : f)
                  );
                }}
                onFollowUpDeleted={(followUpId) => {
                  setFollowUps(prev => prev.filter(f => f.id !== followUpId));
                }}
              />
            </div>
          )}

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
              {loading
                ? 'Saving...'
                : application
                ? 'Update Application'
                : 'Create Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
