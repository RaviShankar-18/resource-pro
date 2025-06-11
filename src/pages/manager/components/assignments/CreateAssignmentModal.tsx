import React, { useState } from 'react';
import { X, Users, Briefcase, Percent, Calendar, UserCheck } from 'lucide-react';
import { AssignmentFormData, Engineer, Project } from '../../../../types';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignmentData: AssignmentFormData) => Promise<void>;
  engineers: Engineer[];
  projects: Project[];
  loading?: boolean;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  engineers,
  projects,
  loading = false
}) => {
  const [formData, setFormData] = useState<AssignmentFormData>({
    engineerId: '',
    projectId: '',
    allocationPercentage: 50,
    startDate: '',
    endDate: '',
    role: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common roles for suggestions
  const suggestedRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'UI/UX Designer', 'DevOps Engineer', 'Tech Lead', 'Team Lead',
    'QA Engineer', 'Mobile Developer', 'Data Engineer', 'ML Engineer'
  ];

  const resetForm = () => {
    setFormData({
      engineerId: '',
      projectId: '',
      allocationPercentage: 50,
      startDate: '',
      endDate: '',
      role: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.engineerId) newErrors.engineerId = 'Engineer is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (formData.allocationPercentage < 1) newErrors.allocationPercentage = 'Allocation must be at least 1%';
    if (formData.allocationPercentage > 100) newErrors.allocationPercentage = 'Allocation cannot exceed 100%';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Capacity validation
    if (formData.engineerId && formData.allocationPercentage > 0) {
      const selectedEngineer = engineers.find(e => e._id === formData.engineerId);
      if (selectedEngineer) {
        const maxCapacity = selectedEngineer.maxCapacity || 100;
        const currentAllocation = selectedEngineer.currentAllocation || 0;
        const availableCapacity = maxCapacity - currentAllocation;
        
        if (formData.allocationPercentage > availableCapacity) {
          newErrors.allocationPercentage = `Engineer only has ${availableCapacity}% capacity available`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAllocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If input is empty, set to empty string temporarily to allow typing
    if (value === '') {
      setFormData(prev => ({ ...prev, allocationPercentage: 0 }));
      return;
    }
    // Otherwise parse as number and clamp between 1-100
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, 1), 100);
      setFormData(prev => ({ ...prev, allocationPercentage: clampedValue }));
    }
  };

  const getEngineerCapacityInfo = (engineerId: string) => {
    const engineer = engineers.find(e => e._id === engineerId);
    if (!engineer) return null;
    
    const maxCapacity = engineer.maxCapacity || 100;
    const currentAllocation = engineer.currentAllocation || 0;
    const availableCapacity = maxCapacity - currentAllocation;
    
    return {
      name: engineer.name,
      maxCapacity,
      currentAllocation,
      availableCapacity,
      isOverloaded: currentAllocation >= maxCapacity
    };
  };

  const getProjectInfo = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    if (!project) return null;
    
    return {
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      requiredSkills: project.requiredSkills
    };
  };

  if (!isOpen) return null;

  const selectedEngineerInfo = formData.engineerId ? getEngineerCapacityInfo(formData.engineerId) : null;
  const selectedProjectInfo = formData.projectId ? getProjectInfo(formData.projectId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Assignment</h2>
            <p className="text-sm text-gray-600 mt-1">Assign an engineer to a project</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Engineer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Select Engineer *
            </label>
            <select
              value={formData.engineerId}
              onChange={(e) => setFormData(prev => ({ ...prev, engineerId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.engineerId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Choose an engineer...</option>
              {engineers.map(engineer => {
                const capacity = getEngineerCapacityInfo(engineer._id);
                return (
                  <option key={engineer._id} value={engineer._id}>
                    {engineer.name} - {capacity?.availableCapacity || 0}% available
                  </option>
                );
              })}
            </select>
            {errors.engineerId && <p className="text-red-600 text-sm mt-1">{errors.engineerId}</p>}
            
            {/* Engineer Capacity Info */}
            {selectedEngineerInfo && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  <UserCheck className="inline h-4 w-4 mr-1" />
                  {selectedEngineerInfo.name} - Capacity Overview
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Current: </span>
                    <span className={`font-medium ${
                      selectedEngineerInfo.isOverloaded ? 'text-red-600' : 'text-blue-900'
                    }`}>
                      {selectedEngineerInfo.currentAllocation}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Available: </span>
                    <span className="font-medium text-green-600">
                      {selectedEngineerInfo.availableCapacity}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Max: </span>
                    <span className="font-medium text-blue-900">
                      {selectedEngineerInfo.maxCapacity}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="inline h-4 w-4 mr-1" />
              Select Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.projectId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Choose a project...</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name} ({project.status})
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-red-600 text-sm mt-1">{errors.projectId}</p>}
            
            {/* Project Info */}
            {selectedProjectInfo && (
              <div className="mt-3 p-3 bg-green-50 rounded-md">
                <h4 className="text-sm font-medium text-green-900 mb-2">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  {selectedProjectInfo.name} - Project Details
                </h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-green-700">Status: </span>
                    <span className={`font-medium ${
                      selectedProjectInfo.status === 'active' ? 'text-green-600' : 
                      selectedProjectInfo.status === 'planning' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {selectedProjectInfo.status}
                    </span>
                  </div>
                  {selectedProjectInfo.requiredSkills.length > 0 && (
                    <div>
                      <span className="text-green-700">Required Skills: </span>
                      <span className="text-green-900">
                        {selectedProjectInfo.requiredSkills.slice(0, 3).join(', ')}
                        {selectedProjectInfo.requiredSkills.length > 3 && '...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="Enter role (e.g., Frontend Developer)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.role ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
            
            {/* Role Suggestions */}
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-2">Suggested roles:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedRoles.slice(0, 6).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    disabled={loading}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Allocation Percentage - UPDATED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Percent className="inline h-4 w-4 mr-1" />
              Allocation Percentage *
            </label>
            <div className="space-y-2">
              {/* Slider for easier adjustment */}
              <input
                type="range"
                min="1"
                max="100"
                value={formData.allocationPercentage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  allocationPercentage: parseInt(e.target.value)
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={loading}
              />
              
              {/* Number input with better handling */}
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.allocationPercentage || ''}
                  onChange={handleAllocationChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.allocationPercentage ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            {errors.allocationPercentage && <p className="text-red-600 text-sm mt-1">{errors.allocationPercentage}</p>}
            
            {/* Removed allocation helper text as requested */}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};