import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, FileText, Clock } from 'lucide-react';
import { createFollowUp, updateFollowUp, listFollowUpTemplates } from '../../api';
import type { FollowUp, FollowUpTemplate, Application, FollowUpType } from '../../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  followUp?: FollowUp; // For editing existing follow-up
  onFollowUpCreated?: (followUp: FollowUp) => void;
  onFollowUpUpdated?: (followUp: FollowUp) => void;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  application,
  followUp,
  onFollowUpCreated,
  onFollowUpUpdated,
}) => {
  const [templates, setTemplates] = useState<FollowUpTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FollowUpTemplate | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [type, setType] = useState<FollowUpType>('POST_APPLICATION');
  const [message, setMessage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      if (followUp) {
        // Editing existing follow-up
        setScheduledDate(followUp.scheduledDate.split('T')[0]);
        setType(followUp.type);
        setMessage(followUp.message || '');
        setNotes(followUp.notes || '');
        if (followUp.templateId) {
          setSelectedTemplate(templates.find(t => t.id === followUp.templateId) || null);
        }
      } else {
        // Creating new follow-up - set smart defaults
        setSmartDefaults();
      }
    }
  }, [isOpen, followUp, application]);

  const loadTemplates = async () => {
    try {
      const defaultTemplates = await listFollowUpTemplates({ isDefault: true });
      setTemplates(defaultTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const setSmartDefaults = () => {
    const now = new Date();
    let defaultDate = new Date();
    let defaultType: FollowUpType = 'POST_APPLICATION';

    // Set smart defaults based on application status
    switch (application.status) {
      case 'APPLIED':
        // Follow up 3-5 days after applying
        defaultDate.setDate(now.getDate() + 4);
        defaultType = 'POST_APPLICATION';
        break;
      case 'INTERVIEW':
        // Follow up 1 week after interview
        defaultDate.setDate(now.getDate() + 7);
        defaultType = 'POST_INTERVIEW';
        break;
      case 'OFFER':
        // Follow up 2-3 days for negotiation
        defaultDate.setDate(now.getDate() + 2);
        defaultType = 'SALARY_NEGOTIATION';
        break;
      default:
        // General follow-up in 2 weeks
        defaultDate.setDate(now.getDate() + 14);
        defaultType = 'GENERAL';
    }

    setScheduledDate(defaultDate.toISOString().split('T')[0]);
    setType(defaultType);
    
    // Auto-select appropriate template
    const appropriateTemplate = templates.find(t => t.type === defaultType);
    if (appropriateTemplate) {
      setSelectedTemplate(appropriateTemplate);
      setMessage(appropriateTemplate.message);
    }
  };

  const handleTemplateChange = (template: FollowUpTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setMessage(template.message);
      setType(template.type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !type) return;

    setIsLoading(true);
    try {
      const payload = {
        applicationId: application.id,
        scheduledDate: new Date(scheduledDate),
        type,
        templateId: selectedTemplate?.id,
        message: message || selectedTemplate?.message,
        notes,
      };

      if (followUp) {
        // Update existing follow-up
        const updated = await updateFollowUp(followUp.id, payload);
        onFollowUpUpdated?.(updated);
      } else {
        // Create new follow-up
        const created = await createFollowUp(payload);
        onFollowUpCreated?.(created);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save follow-up:', error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {followUp ? 'Edit Follow-up' : 'Schedule Follow-up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Information */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">
              {application.job.title}
            </h3>
            <p className="text-gray-300">{application.job.company}</p>
            <p className="text-sm text-gray-400">
              Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Not specified'}
            </p>
          </div>

          {/* Follow-up Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Follow-up Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FollowUpType)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="POST_APPLICATION">Post-Application</option>
              <option value="POST_INTERVIEW">Post-Interview</option>
              <option value="THANK_YOU">Thank You</option>
              <option value="SALARY_NEGOTIATION">Salary Negotiation</option>
              <option value="GENERAL">General Inquiry</option>
            </select>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template (Optional)
            </label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                handleTemplateChange(template || null);
              }}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No template</option>
              {templates
                .filter(t => t.type === type)
                .map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
            </select>
            {selectedTemplate && (
              <p className="text-sm text-gray-400 mt-1">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Scheduled Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="inline w-4 h-4 mr-2" />
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your follow-up message..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="inline w-4 h-4 mr-2" />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !scheduledDate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {followUp ? 'Update Follow-up' : 'Schedule Follow-up'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUpModal;
