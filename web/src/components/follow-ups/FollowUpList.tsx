import React, { useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Clock, AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import { completeFollowUp, deleteFollowUp } from '../../api';
import type { FollowUp, Application } from '../../types';
import FollowUpModal from './FollowUpModal';

interface FollowUpListProps {
  application: Application;
  followUps: FollowUp[];
  onFollowUpUpdated: (followUp: FollowUp) => void;
  onFollowUpDeleted: (followUpId: string) => void;
}

const FollowUpList: React.FC<FollowUpListProps> = ({
  application,
  followUps,
  onFollowUpUpdated,
  onFollowUpDeleted,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'DUE_TODAY':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'SCHEDULED':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DUE_TODAY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'POST_APPLICATION':
        return 'Post-Application';
      case 'POST_INTERVIEW':
        return 'Post-Interview';
      case 'THANK_YOU':
        return 'Thank You';
      case 'SALARY_NEGOTIATION':
        return 'Salary Negotiation';
      case 'GENERAL':
        return 'General';
      default:
        return type;
    }
  };

  const handleComplete = async (followUp: FollowUp) => {
    setIsLoading(followUp.id);
    try {
      const updated = await completeFollowUp(followUp.id);
      onFollowUpUpdated(updated);
    } catch (error) {
      console.error('Failed to complete follow-up:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async (followUp: FollowUp) => {
    if (!confirm('Are you sure you want to delete this follow-up?')) return;
    
    setIsLoading(followUp.id);
    try {
      await deleteFollowUp(followUp.id);
      onFollowUpDeleted(followUp.id);
    } catch (error) {
      console.error('Failed to delete follow-up:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleEdit = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingFollowUp(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFollowUp(null);
  };

  const handleFollowUpCreated = (followUp: FollowUp) => {
    onFollowUpUpdated(followUp);
    handleModalClose();
  };

  const handleFollowUpUpdated = (followUp: FollowUp) => {
    onFollowUpUpdated(followUp);
    handleModalClose();
  };

  const sortedFollowUps = [...followUps].sort((a, b) => {
    // Sort by status priority, then by date
    const statusPriority = {
      'OVERDUE': 0,
      'DUE_TODAY': 1,
      'SCHEDULED': 2,
      'COMPLETED': 3,
      'CANCELLED': 4,
    };
    
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 5;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 5;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Follow-ups</h3>
        <button
          onClick={handleCreate}
          className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Follow-up
        </button>
      </div>

      {/* Follow-ups List */}
      {sortedFollowUps.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p>No follow-ups scheduled yet.</p>
          <p className="text-sm">Click "Schedule Follow-up" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFollowUps.map((followUp) => (
            <div
              key={followUp.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(followUp.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(followUp.status)}`}>
                      {followUp.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-400">
                      {getTypeLabel(followUp.type)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(followUp.scheduledDate).toLocaleDateString()}
                    </div>
                    {followUp.completedDate && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Completed: {new Date(followUp.completedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {followUp.message && (
                    <div className="text-gray-300 text-sm mb-3">
                      <p className="line-clamp-3">{followUp.message}</p>
                    </div>
                  )}

                  {followUp.notes && (
                    <div className="text-gray-400 text-sm">
                      <strong>Notes:</strong> {followUp.notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  {followUp.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleComplete(followUp)}
                      disabled={isLoading === followUp.id}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(followUp)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit follow-up"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(followUp)}
                    disabled={isLoading === followUp.id}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete follow-up"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Follow-up Modal */}
      <FollowUpModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        application={application}
        followUp={editingFollowUp}
        onFollowUpCreated={handleFollowUpCreated}
        onFollowUpUpdated={handleFollowUpUpdated}
      />
    </div>
  );
};

export default FollowUpList;
