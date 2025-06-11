// src/pages/engineer/components/profile/ProfileSection.tsx
import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { authService } from '../../../../services/api';
import { User, Edit2, Save, X, Plus } from 'lucide-react';

const ProfileSection: React.FC = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile({
        skills: editedSkills
      });
      
      setUser({ ...user, skills: editedSkills });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedSkills.includes(newSkill.trim())) {
      setEditedSkills([...editedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedSkills(editedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleCancel = () => {
    setEditedSkills(user?.skills || []);
    setNewSkill('');
    setIsEditing(false);
  };

  const getEmploymentType = (maxCapacity: number) => {
    return maxCapacity >= 100 ? 'Full-time' : 'Part-time';
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'mid':
        return 'bg-blue-100 text-blue-800';
      case 'junior':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2" />
          My Profile
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <p className="text-gray-900 font-medium">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-600">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <p className="text-gray-900">{user.department || 'Not specified'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seniority Level
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeniorityColor(user.seniority || '')}`}>
              {user.seniority ? user.seniority.charAt(0).toUpperCase() + user.seniority.slice(1) : 'Not specified'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <p className="text-gray-900">
              {getEmploymentType(user.maxCapacity || 100)}
              <span className="text-gray-500 text-sm ml-2">
                ({user.maxCapacity || 100}% capacity)
              </span>
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Skills
          </label>
          
          {isEditing ? (
            <div className="space-y-3">
              {/* Add new skill */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Editable skills */}
              <div className="flex flex-wrap gap-2">
                {editedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            // Display skills
            <div className="flex flex-wrap gap-2">
              {(user.skills || []).length > 0 ? (
                user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No skills added yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;