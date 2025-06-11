import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Project } from '../../../../types';
import { ProjectCard } from './ProjectCard';

interface ProjectsSectionProps {
  projects: Project[];
  onCreateProject: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onCreateProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'active' | 'completed'>('all');

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group projects by status for better organization
  const projectsByStatus = {
    active: filteredProjects.filter(p => p.status === 'active'),
    planning: filteredProjects.filter(p => p.status === 'planning'),
    completed: filteredProjects.filter(p => p.status === 'completed')
  };

  const getStatusCount = (status: string) => {
    return projects.filter(p => p.status === status).length;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-600">Manage and track all projects</p>
          </div>
          <button
            onClick={onCreateProject}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status ({projects.length})</option>
              <option value="active">Active ({getStatusCount('active')})</option>
              <option value="planning">Planning ({getStatusCount('planning')})</option>
              <option value="completed">Completed ({getStatusCount('completed')})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first project.'
              }
            </p>
            {searchTerm === '' && statusFilter === 'all' && (
              <button
                onClick={onCreateProject}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};