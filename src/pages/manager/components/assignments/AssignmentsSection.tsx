import React, { useState } from 'react';
import { Search, Filter, Plus, Trash2, Edit, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Assignment, Engineer, Project } from '../../../../types';
import { CapacityBar } from '../common/CapacityBar';

interface AssignmentsSectionProps {
  assignments: Assignment[];
  engineers: Engineer[];
  projects: Project[];
  onCreateAssignment: () => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

export const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({
  assignments,
  engineers,
  projects,
  onCreateAssignment,
  onDeleteAssignment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [engineerFilter, setEngineerFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  // 🔧 ROBUST Helper functions that handle object or string IDs
  const getEngineerName = (engineerField: any): string => {
    console.log('🔍 Engineer field type:', typeof engineerField, 'value:', engineerField);
    
    // If it's already an object with name, use it directly
    if (engineerField && typeof engineerField === 'object' && engineerField.name) {
      console.log('✅ Found engineer name directly:', engineerField.name);
      return engineerField.name;
    }
    
    // If it's an object with _id, extract the ID
    let engineerId: string;
    if (engineerField && typeof engineerField === 'object' && engineerField._id) {
      engineerId = engineerField._id;
      console.log('🔍 Extracted engineer ID from object:', engineerId);
    } else if (typeof engineerField === 'string') {
      engineerId = engineerField;
      console.log('🔍 Using engineer ID directly:', engineerId);
    } else {
      console.log('❌ Invalid engineer field:', engineerField);
      return 'Invalid Engineer Data';
    }
    
    // Look up engineer by ID
    const engineer = engineers.find(e => e._id === engineerId);
    
    if (engineer) {
      console.log('✅ Found engineer:', engineer.name);
      return engineer.name;
    }
    
    console.log(`❌ Engineer not found for ID: ${engineerId}`);
    return `Engineer ID: ${String(engineerId).slice(-6)}...`;
  };

  const getProjectName = (projectField: any): string => {
    console.log('🔍 Project field type:', typeof projectField, 'value:', projectField);
    
    // If it's already an object with name, use it directly
    if (projectField && typeof projectField === 'object' && projectField.name) {
      console.log('✅ Found project name directly:', projectField.name);
      return projectField.name;
    }
    
    // If it's an object with _id, extract the ID
    let projectId: string;
    if (projectField && typeof projectField === 'object' && projectField._id) {
      projectId = projectField._id;
      console.log('🔍 Extracted project ID from object:', projectId);
    } else if (typeof projectField === 'string') {
      projectId = projectField;
      console.log('🔍 Using project ID directly:', projectId);
    } else {
      console.log('❌ Invalid project field:', projectField);
      return 'Invalid Project Data';
    }
    
    // Look up project by ID
    const project = projects.find(p => p._id === projectId);
    
    if (project) {
      console.log('✅ Found project:', project.name);
      return project.name;
    }
    
    console.log(`❌ Project not found for ID: ${projectId}`);
    return `Project ID: ${String(projectId).slice(-6)}...`;
  };

  const getProjectStatus = (projectField: any): string => {
    // If it's already an object with status, use it directly
    if (projectField && typeof projectField === 'object' && projectField.status) {
      return projectField.status;
    }
    
    // Otherwise look up by ID
    let projectId: string;
    if (projectField && typeof projectField === 'object' && projectField._id) {
      projectId = projectField._id;
    } else if (typeof projectField === 'string') {
      projectId = projectField;
    } else {
      return 'unknown';
    }
    
    const project = projects.find(p => p._id === projectId);
    return project?.status || 'unknown';
  };

  // Helper to get actual ID string for filtering
  const getEngineerId = (engineerField: any): string => {
    if (engineerField && typeof engineerField === 'object' && engineerField._id) {
      return engineerField._id;
    }
    return typeof engineerField === 'string' ? engineerField : '';
  };

  const getProjectId = (projectField: any): string => {
    if (projectField && typeof projectField === 'object' && projectField._id) {
      return projectField._id;
    }
    return typeof projectField === 'string' ? projectField : '';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date();
    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    
    if (now < start) {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Clock };
    } else if (now > end) {
      return { status: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    } else {
      const projectStatus = getProjectStatus(assignment.projectId);
      if (projectStatus === 'active') {
        return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      } else {
        return { status: 'inactive', label: 'Inactive', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      }
    }
  };

  const handleDeleteClick = (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      onDeleteAssignment(assignmentId);
    }
  };

  // Filter assignments - Updated to use new helper functions
  const filteredAssignments = assignments.filter(assignment => {
    const engineerName = getEngineerName(assignment.engineerId).toLowerCase();
    const projectName = getProjectName(assignment.projectId).toLowerCase();
    const role = assignment.role.toLowerCase();
    
    const matchesSearch = engineerName.includes(searchTerm.toLowerCase()) ||
                         projectName.includes(searchTerm.toLowerCase()) ||
                         role.includes(searchTerm.toLowerCase());
    
    const actualEngineerId = getEngineerId(assignment.engineerId);
    const actualProjectId = getProjectId(assignment.projectId);
    
    const matchesEngineer = engineerFilter === 'all' || actualEngineerId === engineerFilter;
    const matchesProject = projectFilter === 'all' || actualProjectId === projectFilter;
    
    return matchesSearch && matchesEngineer && matchesProject;
  });

  // Sort assignments by date (most recent first)
  const sortedAssignments = filteredAssignments.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Assignments</h2>
            <p className="text-sm text-gray-600">Manage engineer project assignments</p>
          </div>
          <button
            onClick={onCreateAssignment}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Engineer Filter */}
          <select
            value={engineerFilter}
            onChange={(e) => setEngineerFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Engineers ({assignments.length})</option>
            {engineers.map(engineer => (
              <option key={engineer._id} value={engineer._id}>
                {engineer.name}
              </option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || engineerFilter !== 'all' || projectFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first assignment.'
              }
            </p>
            {searchTerm === '' && engineerFilter === 'all' && projectFilter === 'all' && (
              <button
                onClick={onCreateAssignment}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Assignment
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engineer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAssignments.map((assignment) => {
                const statusInfo = getAssignmentStatus(assignment);
                const StatusIcon = statusInfo.icon;
                const engineerName = getEngineerName(assignment.engineerId);
                const projectName = getProjectName(assignment.projectId);
                
                return (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    {/* Engineer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {engineerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {engineerName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {projectName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getProjectStatus(assignment.projectId)}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.role}</div>
                    </td>

                    {/* Allocation */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24">
                        <CapacityBar 
                          percentage={assignment.allocationPercentage}
                          size="sm"
                        />
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(assignment.startDate)}</div>
                      <div>to {formatDate(assignment.endDate)}</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => console.log('Edit assignment:', assignment._id)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(assignment._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer */}
      {sortedAssignments.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {sortedAssignments.length} of {assignments.length} assignments
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Active: {sortedAssignments.filter(a => getAssignmentStatus(a).status === 'active').length}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                Upcoming: {sortedAssignments.filter(a => getAssignmentStatus(a).status === 'upcoming').length}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                Completed: {sortedAssignments.filter(a => getAssignmentStatus(a).status === 'completed').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};