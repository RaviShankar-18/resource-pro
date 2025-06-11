import React from 'react';
import { Calendar, Users, Clock, MoreVertical } from 'lucide-react';
import { Project } from '../../../../types';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        {(onEdit || onDelete) && (
          <div className="relative">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Project Info */}
      <div className="space-y-3">
        {/* Timeline */}
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>

        {/* Team Size */}
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-2" />
          <span>Team size: {project.teamSize}</span>
        </div>

        {/* Days Remaining */}
        {project.status === 'active' && (
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span className={`${daysRemaining < 7 ? 'text-red-600' : daysRemaining < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : `${Math.abs(daysRemaining)} days overdue`}
            </span>
          </div>
        )}
      </div>

      {/* Required Skills */}
      {project.requiredSkills && project.requiredSkills.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Required Skills:</p>
          <div className="flex flex-wrap gap-1">
            {project.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200"
              >
                {skill}
              </span>
            ))}
            {project.requiredSkills.length > 4 && (
              <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200">
                +{project.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};