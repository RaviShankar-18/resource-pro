// src/pages/engineer/components/profile/ProfileEditModal.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../../../types';
import { X } from 'lucide-react';
import { engineerService, skillsService } from '../../../../services/api';

interface ProfileEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  availableSkills?: string[];
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
  availableSkills: propSkills
}) => {
  const [name, setName] = useState(user?.name || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [availableSkills, setAvailableSkills] = useState<string[]>(propSkills || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load available skills if not provided via props
  useEffect(() => {
    if (!propSkills) {
      skillsService.getAll()
        .then(skills => setAvailableSkills(skills))
        .catch(err => console.error('Failed to load skills', err));
    }
  }, [propSkills]);

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setSelectedSkills(user.skills || []);
      setError('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Changed: No need to pass userId since we're using /api/auth/profile
      await engineerService.updateProfile(user._id, {
        name,
        skills: selectedSkills
      });
      
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // If modal is closed or no user, don't render
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Click on skills to select/deselect them. You have selected {selectedSkills.length} skills.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;