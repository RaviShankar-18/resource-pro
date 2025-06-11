import React from 'react';
import { LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

interface DashboardHeaderProps {
  onCreateProject: () => void;
  onCreateAssignment: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onCreateProject,
  onCreateAssignment
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onCreateProject}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Project
              </button>
              <button
                onClick={onCreateAssignment}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Assignment
              </button>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};