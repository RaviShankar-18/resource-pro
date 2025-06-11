// src/pages/engineer/components/assignments/AssignmentCard.tsx
import React from 'react';
import { Assignment, Project } from '../../../../types';
import { Calendar, User, Clock } from 'lucide-react';

interface AssignmentCardProps {
  assignment: Assignment;
  project?: Project;
  type: 'active' | 'upcoming' | 'past';
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, project, type }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'past':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (type: string) => {
    switch (type) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'past':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const projectName = project?.name || 'Unknown Project';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {projectName}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(type)}`}>
              {assignment.allocationPercentage}%
            </span>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-4">{assignment.role}</span>
            
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
            </span>
          </div>

          {/* Duration indicator for active assignments */}
          {type === 'active' && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {(() => {
                  const now = new Date();
                  const endDate = new Date(assignment.endDate);
                  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return daysLeft > 0 ? `${daysLeft} days remaining` : 'Ending soon';
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Allocation</span>
          <span>{assignment.allocationPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressBarColor(type)}`}
            style={{ width: `${Math.min(assignment.allocationPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Project Description if available */}
      {project?.description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Project Status */}
      {project?.status && (
        <div className="mt-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            project.status === 'active' ? 'bg-green-100 text-green-800' :
            project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      )}

      {/* Required Skills */}
      {project?.requiredSkills && project.requiredSkills.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {project.requiredSkills.slice(0, 3).map((skill, index) => (
              <span 
                key={index} 
                className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {skill}
              </span>
            ))}
            {project.requiredSkills.length > 3 && (
              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                +{project.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;