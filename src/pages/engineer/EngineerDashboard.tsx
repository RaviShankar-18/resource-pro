// src/pages/engineer/EngineerDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService, engineerService, projectService, normalizeId } from '../../services/api';
import { Assignment } from '../../types';
import { 
  User, 
  LogOut, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Briefcase
} from 'lucide-react';

import AssignmentDetailModal from './components/assignments/AssignmentDetailModal';
import SimpleCapacityCalendar from './components/calendar/SimpleCapacityCalendar';

export const EngineerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch assignments and projects
  useEffect(() => {
    const fetchAssignmentsAndProjects = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Current user ID:', user._id || user.id);
        
        // Method 1: Try to get engineer-specific assignments directly
        try {
          const engineerCapacity = await engineerService.getCapacity(user._id || user.id);
          console.log('Engineer capacity response:', engineerCapacity);
          
          if (engineerCapacity && engineerCapacity.assignments && engineerCapacity.assignments.length > 0) {
            // If we have assignments from capacity endpoint, enrich them with project details
            const enrichedAssignments = await Promise.all(
              engineerCapacity.assignments.map(async (assignment) => {
                try {
                  const projectDetails = await projectService.getById(assignment.projectId);
                  return {
                    _id: assignment._id || `capacity_${assignment.projectId}`,
                    engineerId: user._id || user.id,
                    projectId: assignment.projectId,
                    allocationPercentage: assignment.allocationPercentage,
                    startDate: assignment.startDate,
                    endDate: assignment.endDate,
                    role: assignment.role,
                    project: projectDetails
                  };
                } catch (projectError) {
                  console.error('Error fetching project details:', projectError);
                  return {
                    _id: assignment._id || `capacity_${assignment.projectId}`,
                    engineerId: user._id || user.id,
                    projectId: assignment.projectId,
                    allocationPercentage: assignment.allocationPercentage,
                    startDate: assignment.startDate,
                    endDate: assignment.endDate,
                    role: assignment.role,
                    project: {
                      name: assignment.projectName,
                      status: 'unknown',
                      description: 'Project details unavailable'
                    }
                  };
                }
              })
            );
            
            setAssignments(enrichedAssignments);
            setIsLoading(false);
            return; // Early return if we successfully got assignments from capacity
          }
        } catch (capacityError) {
          console.warn('Could not fetch from capacity endpoint, falling back to all assignments:', capacityError);
        }
        
        // Method 2: Fallback - get all assignments and filter on client
        const allAssignments = await assignmentService.getAll();
        console.log('All assignments:', allAssignments);
        
        const currentUserId = normalizeId(user._id || user.id);
        console.log('Normalized user ID for comparison:', currentUserId);
        
        // Filter assignments for the current engineer
        const engineerAssignments = allAssignments.filter((assignment: Assignment) => {
          const assignmentEngineerId = normalizeId(assignment.engineerId);
          console.log(`Comparing assignment engineerId: ${assignmentEngineerId} with currentUserId: ${currentUserId}`);
          return assignmentEngineerId === currentUserId;
        });
        
        console.log('Filtered engineer assignments:', engineerAssignments);

        // Enrich assignments with project details
        const enrichedAssignments = await Promise.all(
          engineerAssignments.map(async (assignment: Assignment) => {
            try {
              const projectId = normalizeId(assignment.projectId);
              console.log('Fetching project details for:', projectId);
              
              const projectDetails = await projectService.getById(projectId);
              console.log('Project details:', projectDetails);
              
              return {
                ...assignment,
                project: projectDetails
              };
            } catch (projectError) {
              console.error('Error fetching project details:', projectError);
              return {
                ...assignment,
                project: {
                  _id: normalizeId(assignment.projectId),
                  name: 'Unknown Project',
                  description: 'Project details unavailable',
                  status: 'unknown',
                  startDate: assignment.startDate,
                  endDate: assignment.endDate,
                  requiredSkills: [],
                  teamSize: 0,
                  managerId: ''
                }
              };
            }
          })
        );

        console.log('Enriched assignments with project details:', enrichedAssignments);
        setAssignments(enrichedAssignments);
        setIsLoading(false);
      } catch (fetchError) {
        console.error('Error fetching assignments:', fetchError);
        setError('Failed to load assignments. Please try again.');
        setIsLoading(false);
      }
    };

    fetchAssignmentsAndProjects();
  }, [user]);

  // Memoized calculations
  const categorizedAssignments = useMemo(() => {
    const now = new Date();
    return {
      activeAssignments: assignments.filter(assignment => 
        new Date(assignment.startDate) <= now && 
        new Date(assignment.endDate) >= now
      ),
      upcomingAssignments: assignments.filter(assignment => 
        new Date(assignment.startDate) > now
      ),
      pastAssignments: assignments.filter(assignment => 
        new Date(assignment.endDate) < now
      )
    };
  }, [assignments]);

  const capacityUsed = useMemo(() => {
    return categorizedAssignments.activeAssignments.reduce(
      (total, assignment) => total + assignment.allocationPercentage, 
      0
    );
  }, [categorizedAssignments.activeAssignments]);

  const availableCapacity = useMemo(() => {
    return (user?.maxCapacity );
  }, [user?.maxCapacity, capacityUsed]);

  const getCapacityStatus = () => {
    const percentage = (capacityUsed / (user?.maxCapacity || 100)) * 100;
    if (percentage >= 100) return { label: 'Overloaded', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (percentage >= 80) return { label: 'High Usage', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (percentage >= 60) return { label: 'Moderate', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { label: 'Available', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const capacityStatus = getCapacityStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Engineer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categorizedAssignments.activeAssignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categorizedAssignments.upcomingAssignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Capacity Used</p>
                <p className="text-2xl font-bold text-gray-900">{capacityUsed}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${capacityStatus.bgColor}`}>
                <CheckCircle className={`h-6 w-6 ${capacityStatus.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Max Capacity</p>
                <p className={`text-2xl font-bold ${capacityStatus.color}`}>
                  {availableCapacity}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Assignments
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Profile
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
                <p className="text-gray-600 mb-6">
                  Here's an overview of your current assignments and capacity. Use the tabs above to navigate to different sections.
                </p>

                {/* Capacity Overview */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Capacity Overview</h3>
                    <div className={`flex items-center px-3 py-1 rounded-full ${capacityStatus.bgColor}`}>
                      <CheckCircle className={`h-4 w-4 mr-2 ${capacityStatus.color}`} />
                      <span className={`text-sm font-medium ${capacityStatus.color}`}>
                        {capacityStatus.label}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Capacity Usage</span>
                      <span>{capacityUsed}% of {user?.maxCapacity || 100}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-300 ${
                          capacityUsed > (user?.maxCapacity || 100) ? 'bg-red-500' :
                          capacityUsed >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((capacityUsed / (user?.maxCapacity || 100)) * 100, 100)}%` }}
                      />
                    </div>
                    {availableCapacity < 0 && (
                      <p className="text-red-600 text-sm mt-1">
                        ⚠️ Overallocated by {Math.abs(availableCapacity)}%
                      </p>
                    )}
                  </div>

                                    {categorizedAssignments.activeAssignments.length > 0 ? (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        Active Assignments Breakdown
                      </h4>
                      <div className="space-y-3">
                        {categorizedAssignments.activeAssignments.map((assignment) => (
                          <div key={assignment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.project?.name || 'Unknown Project'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {assignment.role}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.allocationPercentage}%
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(assignment.allocationPercentage / (user?.maxCapacity || 100)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No active assignments</p>
                  )}
                </div>

                {/* Capacity Calendar */}
                {assignments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity Forecast</h3>
                    <SimpleCapacityCalendar assignments={assignments} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">My Assignments</h2>
                
                {/* Active Assignments */}
                <div className="mb-8">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Active Assignments</h3>
                  {categorizedAssignments.activeAssignments.length > 0 ? (
                    <div className="space-y-4">
                      {categorizedAssignments.activeAssignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          onClick={() => setSelectedAssignment(assignment)}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {assignment.project?.name || 'Unknown Project'}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {assignment.allocationPercentage}%
                                </span>
                              </div>
                              
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <User className="h-4 w-4 mr-1" />
                                <span className="mr-4">{assignment.role}</span>
                                
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                                </span>
                              </div>

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
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Allocation</span>
                              <span>{assignment.allocationPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-green-500"
                                style={{ width: `${Math.min(assignment.allocationPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {assignment.project?.description && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                              {assignment.project.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No active assignments
                    </div>
                  )}
                </div>

                {/* Upcoming Assignments */}
                {categorizedAssignments.upcomingAssignments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Upcoming Assignments</h3>
                    <div className="space-y-4">
                      {categorizedAssignments.upcomingAssignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          onClick={() => setSelectedAssignment(assignment)}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                {assignment.project?.name || 'Unknown Project'}
                              </h4>
                              <div className="flex items-center mt-1 text-sm text-gray-600">
                                <span className="mr-4">{assignment.role}</span>
                                <span>Starts: {new Date(assignment.startDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {assignment.allocationPercentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Completed Assignments */}
                {categorizedAssignments.pastAssignments.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Recently Completed</h3>
                    <div className="space-y-4">
                      {categorizedAssignments.pastAssignments.slice(0, 3).map((assignment) => (
                        <div
                          key={assignment._id}
                          onClick={() => setSelectedAssignment(assignment)}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer opacity-75"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                {assignment.project?.name || 'Unknown Project'}
                              </h4>
                              <div className="flex items-center mt-1 text-sm text-gray-600">
                                <span className="mr-4">{assignment.role}</span>
                                <span>Completed: {new Date(assignment.endDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {assignment.allocationPercentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    My Profile
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <p className="text-gray-900 font-medium text-lg">{user?.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <p className="text-gray-900">{user?.department || 'Not specified'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seniority Level
                      </label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user?.seniority === 'senior' ? 'bg-purple-100 text-purple-800' :
                        user?.seniority === 'mid' ? 'bg-blue-100 text-blue-800' :
                        user?.seniority === 'junior' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user?.seniority ? user.seniority.charAt(0).toUpperCase() + user.seniority.slice(1) : 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Type
                      </label>
                      <p className="text-gray-900">
                        {(user?.maxCapacity || 100) >= 100 ? 'Full-time' : 'Part-time'}
                        <span className="text-gray-500 text-sm ml-2">
                          ({user?.maxCapacity || 100}% capacity)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Skills
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      {(user?.skills || []).length > 0 ? (
                        user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No skills specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Detail Modal */}
      <AssignmentDetailModal
        assignment={selectedAssignment}
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
      />
    </div>
  );
};