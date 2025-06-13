// src/pages/engineer/components/assignments/AssignmentDetailModal.tsx
import React from 'react';
import { Assignment } from '../../../../types';
import { X, Calendar, Clock, User, Briefcase, BarChart } from 'lucide-react';

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
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(assignment.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const getDurationInWeeks = () => {
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    const durationMs = endDate.getTime() - startDate.getTime();
    const weeks = Math.ceil(durationMs / (1000 * 60 * 60 * 24 * 7));
    return weeks;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Assignment Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Project Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Project Name</div>
                  <div className="text-lg font-medium">
                    {assignment.project?.name || 'Unknown Project'}
                  </div>
                </div>
                
                {assignment.project?.description && (
                  <div>
                    <div className="text-sm text-gray-500">Description</div>
                    <div className="text-gray-700">
                      {assignment.project.description}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assignment.project?.status === 'active' ? 'bg-green-100 text-green-800' :
                    assignment.project?.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                    assignment.project?.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {assignment.project?.status || 'Unknown'} project
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Assignment Details
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Your Role</div>
                    <div className="text-gray-700 font-medium">{assignment.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Allocation</div>
                    <div className="text-gray-700 font-medium">{assignment.allocationPercentage}% of your time</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="text-gray-700">
                      {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                      <span className="text-sm text-gray-500 ml-2">
                        ({getDurationInWeeks()} weeks)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    {new Date(assignment.startDate) > new Date() ? (
                      <div className="text-blue-600">
                        Starting in {Math.ceil((new Date(assignment.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    ) : new Date(assignment.endDate) < new Date() ? (
                      <div className="text-gray-600">Completed</div>
                    ) : (
                      <div className="text-green-600">
                        Active, {calculateDaysRemaining()} days remaining
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline visualization */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Timeline
            </h4>
            
            <div className="relative pt-4 pb-8">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ 
                    width: (() => {
                      const now = new Date();
                      const start = new Date(assignment.startDate);
                      const end = new Date(assignment.endDate);
                      
                      if (now < start) return '0%';
                      if (now > end) return '100%';
                      
                      const totalMs = end.getTime() - start.getTime();
                      const elapsedMs = now.getTime() - start.getTime();
                      return `${Math.min(100, (elapsedMs / totalMs) * 100)}%`;
                    })()
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  {formatDate(assignment.startDate)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(assignment.endDate)}
                </div>
              </div>
              
              <div 
                className="absolute top-0 mt-3 transform -translate-x-1/2"
                style={{ 
                  left: (() => {
                    const now = new Date();
                    const start = new Date(assignment.startDate);
                    const end = new Date(assignment.endDate);
                    
                    if (now < start) return '0%';
                    if (now > end) return '100%';
                    
                    const totalMs = end.getTime() - start.getTime();
                    const elapsedMs = now.getTime() - start.getTime();
                    return `${Math.min(100, (elapsedMs / totalMs) * 100)}%`;
                  })()
                }}
              >
                <div className="w-px h-3 bg-blue-600"></div>
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">
                  Today
                </div>
              </div>
            </div>
          </div>
          
          {/* Required skills */}
          {assignment.project?.requiredSkills && assignment.project.requiredSkills.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Required Project Skills
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {assignment.project.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;