import React, { useState } from 'react';
import { X, Calendar, Users, FileText, Tags } from 'lucide-react';
import { ProjectFormData } from '../../../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData) => Promise<void>;
  loading?: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    requiredSkills: [],
    teamSize: 1,
    status: 'planning'
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common skills for suggestions
  const suggestedSkills = [
    'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'AWS', 'Docker', 
    'MongoDB', 'PostgreSQL', 'GraphQL', 'Vue.js', 'Angular', 'PHP', 'Laravel',
    'DevOps', 'Kubernetes', 'Redis', 'Elasticsearch', 'Machine Learning'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      requiredSkills: [],
      teamSize: 1,
      status: 'planning'
    });
    setSkillInput('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.teamSize < 1) newErrors.teamSize = 'Team size must be at least 1';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
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
      console.error('Failed to create project:', error);
    }
  };

  const handleSkillAdd = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.requiredSkills.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmedSkill]
      }));
    }
    setSkillInput('');
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (skillInput.trim()) {
        handleSkillAdd(skillInput);
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            <p className="text-sm text-gray-600 mt-1">Add a new project to your portfolio</p>
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
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
              disabled={loading}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the project goals and objectives"
              disabled={loading}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Team Size and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Team Size *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.teamSize}
                onChange={(e) => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.teamSize ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.teamSize && <p className="text-red-600 text-sm mt-1">{errors.teamSize}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tags className="inline h-4 w-4 mr-1" />
              Required Skills
            </label>
            
            {/* Skill Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                placeholder="Type a skill and press Enter or comma"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleSkillAdd(skillInput)}
                disabled={!skillInput.trim() || loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Suggested Skills */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Suggested skills:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedSkills.slice(0, 8).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillAdd(skill)}
                    disabled={formData.requiredSkills.includes(skill) || loading}
                    className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Skills */}
            {formData.requiredSkills.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Selected skills:</p>
                <div className="flex flex-wrap gap-1">
                  {formData.requiredSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded border border-indigo-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        disabled={loading}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};