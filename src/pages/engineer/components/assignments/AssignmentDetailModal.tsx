// src/pages/engineer/components/assignments/AssignmentDetailModal.tsx
import React from 'react';
import { Assignment } from '../../../../types';
import { X, Calendar, Clock, User, Briefcase, Tag, FileText } from 'lucide-react';

interface AssignmentDetailModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  isOpen,
  onClose
}) => {
  if (!isOpen || !assignment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining or days overdue
  const getDaysStatus = () => {
    const now = new Date();
    const endDate = new Date(assignment.endDate);
    const startDate = new Date(assignment.startDate);
    
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (now < startDate) {
      const startDiffTime = startDate.getTime() - now.getTime();
      const startDiffDays = Math.ceil(startDiffTime / (1000 * 60 * 60 * 24));
      return `Starts in ${startDiffDays} day${startDiffDays !== 1 ? 's' : ''}`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else {
      return 'Last day';
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const now = new Date();
    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    
    // If not started yet
    if (now < start) return 0;
    
    // If already ended
    if (now > end) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  const progressPercentage = getProgressPercentage();
  const daysStatus = getDaysStatus();
  const isActive = new Date() >= new Date(assignment.startDate) && new Date() <= new Date(assignment.endDate);
  const isPast = new Date() > new Date(assignment.endDate);
  const isFuture = new Date() < new Date(assignment.startDate);

  // Set status color based on timing
  const getStatusColor = () => {
    if (isPast) return 'bg-gray-100 text-gray-800';
    if (isFuture) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const statusColor = getStatusColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full mx-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{assignment.project?.name || 'Project'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Status Bar */}
          <div className="mb-4 flex justify-between items-center">
            <span className={`px-3 py-1 text-sm rounded-full ${statusColor}`}>
              {isPast ? 'Completed' : (isFuture ? 'Upcoming' : 'Active')}
            </span>
            <span className="text-sm text-gray-500">{daysStatus}</span>
          </div>
          
          {/* Progress Bar (only show for active assignments) */}
          {isActive && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Assignment Details */}
          <div className="space-y-4">
            <div className="flex items-start">
              <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="font-medium">{assignment.role || 'Team Member'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Allocation</p>
                <p className="font-medium">{assignment.allocationPercentage}% of your time</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="font-medium">
                  {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                </p>
              </div>
            </div>
            
            {assignment.project?.description && (
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Description</p>
                  <p className="text-gray-700">{assignment.project.description}</p>
                </div>
              </div>
            )}
            
            {assignment.project?.requiredSkills && assignment.project.requiredSkills.length > 0 && (
              <div className="flex items-start">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Required Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {assignment.project.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {assignment.project?.managerId && (
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Manager</p>
                  <p className="font-medium">
                    {assignment.project.manager?.name || 'Unknown Manager'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6 rounded-b-lg border-t">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;