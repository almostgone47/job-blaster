import {useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import type {Template} from '../types';
import {listTemplates} from '../api';
import TemplateModal from './TemplateModal';

export default function TemplateManager() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({queryKey: ['templates'], queryFn: listTemplates});

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleSaved = () => {
    // Invalidate and refetch templates to show the latest data
    queryClient.invalidateQueries({queryKey: ['templates']});
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400">Loading templates...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        Failed to load templates: {String(error)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Cover Letter Templates
        </h3>
        <button
          onClick={handleCreateNew}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">No templates yet</div>
          <p className="text-sm text-gray-500 mb-4">
            Create your first cover letter template to speed up your job
            applications.
          </p>
          <button
            onClick={handleCreateNew}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded border border-gray-600 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-2">
                    {template.name}
                  </h4>
                  <div className="text-sm text-gray-400 mb-3">
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-300 font-mono bg-gray-900 p-3 rounded border border-gray-700 max-h-24 overflow-y-auto">
                    {template.body.length > 200
                      ? `${template.body.substring(0, 200)}...`
                      : template.body}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="text-sm text-blue-400 hover:text-blue-300 px-3 py-1 rounded border border-blue-600 hover:bg-blue-600/20 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TemplateModal
        open={isModalOpen}
        template={editingTemplate}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </div>
  );
}
