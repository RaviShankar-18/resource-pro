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
  Briefcase,
  AlertCircle,
  BarChart2
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
    return (user?.maxCapacity || 100) - capacityUsed;
  }, [user?.maxCapacity, capacityUsed]);

  const getCapacityStatus = () => {
    const percentage = (capacityUsed / (user?.maxCapacity || 100)) * 100;
    if (percentage >= 100) return { label: 'Overloaded', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (percentage >= 80) return { label: 'High Usage', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (percentage >= 60) return { label: 'Moderate', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { label: 'Available', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const capacityStatus = getCapacityStatus();

  // Same loader as Manager Dashboard - FIXED SIZE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Matching Manager Dashboard Style */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Engineer Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-lg font-bold ${capacityStatus.color}`}>
                  {capacityStatus.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Matching Manager Dashboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === 'assignments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                My Assignments
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                My Profile
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
                  <p className="text-gray-600 mt-1">
                    Here's an overview of your current assignments and capacity. Use the tabs above to navigate to different sections.
                  </p>
                </div>

                {/* Capacity Overview - Improved Design */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
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
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Overallocated by {Math.abs(availableCapacity)}%
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
                          <div key={assignment._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border border-gray-200 space-y-2 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
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
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((assignment.allocationPercentage / (user?.maxCapacity || 100)) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No active assignments</p>
                      <p className="text-gray-400 text-sm">You're currently available for new projects</p>
                    </div>
                  )}
                </div>

                {/* Capacity Calendar */}
                {assignments.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center mb-4">
                      <BarChart2 className="h-5 w-5 text-indigo-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Capacity Forecast</h3>
                    </div>
                    <SimpleCapacityCalendar assignments={assignments} />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('assignments')}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                  >
                    <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">View All Assignments</h4>
                    <p className="text-sm text-gray-500 mt-1">See all your current and upcoming work</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                  >
                    <User className="h-8 w-8 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">My Profile</h4>
                    <p className="text-sm text-gray-500 mt-1">View and manage your profile information</p>
                  </button>

                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white sm:col-span-2 lg:col-span-1">
                    <TrendingUp className="h-8 w-8 mb-2" />
                    <h4 className="font-medium">Capacity Status</h4>
                    <p className="text-sm opacity-90 mt-1">
                      {availableCapacity > 0 
                        ? `${availableCapacity}% capacity available`
                        : availableCapacity === 0 
                        ? 'Fully allocated'
                        : 'Overallocated'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">My Assignments</h2>
                  <p className="text-gray-600 mt-1">Manage and track all your project assignments</p>
                </div>
                
                {/* Active Assignments */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Active Assignments
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {categorizedAssignments.activeAssignments.length} active
                    </span>
                  </div>
                  
                  {categorizedAssignments.activeAssignments.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categorizedAssignments.activeAssignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          onClick={() => setSelectedAssignment(assignment)}
                          className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-medium text-gray-900 truncate">
                                  {assignment.project?.name || 'Unknown Project'}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2 flex-shrink-0">
                                  {assignment.allocationPercentage}%
                                </span>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 space-y-1 sm:space-y-0 sm:space-x-4">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{assignment.role}</span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                  <span className="text-xs">
                                    {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
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

                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Allocation</span>
                              <span>{assignment.allocationPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                                style={{ width: `${Math.min(assignment.allocationPercentage, 100)}%` }}
                              />
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
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
                      <p className="text-gray-500">You're currently available for new projects</p>
                    </div>
                  )}
                </div>

                {/* Upcoming Assignments */}
                {categorizedAssignments.upcomingAssignments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        Upcoming Assignments
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {categorizedAssignments.upcomingAssignments.length} upcoming
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categorizedAssignments.upcomingAssignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          onClick={() => setSelectedAssignment(assignment)}
                          className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-medium text-gray-900 truncate">
                                  {assignment.project?.name || 'Unknown Project'}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2 flex-shrink-0">
                                  {assignment.allocationPercentage}%
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 space-y-1 sm:space-y-0 sm:space-x-4">
                                <span className="truncate">{assignment.role}</span>
                                <span className="text-xs">Starts: {new Date(assignment.startDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Completed Assignments */}
                {categorizedAssignments.pastAssignments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                        Recently Completed
                      </h3>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {categorizedAssignments.pastAssignments.length} completed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categorizedAssignments.pastAssignments.slice(0, 4).map((assignment) => (
                        <div
                          key={assignment._id}
                          onClick={() => setSelectedAssignment(assignment)}
                          className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer opacity-75 hover:opacity-100"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-medium text-gray-900 truncate">
                                  {assignment.project?.name || 'Unknown Project'}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2 flex-shrink-0">
                                  {assignment.allocationPercentage}%
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 space-y-1 sm:space-y-0 sm:space-x-4">
                                <span className="truncate">{assignment.role}</span>
                                                               <span className="text-xs">Completed: {new Date(assignment.endDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="h-6 w-6 mr-2" />
                    My Profile
                  </h2>
                  <p className="text-gray-600 mt-1">View and manage your profile information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Basic Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-white">
                              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium text-lg">{user?.name}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-md">{user?.email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user?.department || 'Not specified'}</p>
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
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            (user?.maxCapacity || 100) >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {(user?.maxCapacity || 100) >= 100 ? 'Full-time' : 'Part-time'}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({user?.maxCapacity || 100}% capacity)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills and Capacity */}
                  <div className="space-y-6">
                    {/* Skills Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Skills & Expertise</h3>
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
                          <div className="text-center py-8 w-full">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 italic">No skills specified</p>
                            <p className="text-gray-400 text-sm mt-1">Contact your manager to update your skills</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capacity Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity Information</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Maximum Capacity</span>
                          <span className="text-lg font-bold text-gray-900">{user?.maxCapacity || 100}%</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Current Usage</span>
                          <span className={`text-lg font-bold ${
                            capacityUsed > (user?.maxCapacity || 100) ? 'text-red-600' :
                            capacityUsed >= 80 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {capacityUsed}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Available Capacity</span>
                          <span className={`text-lg font-bold ${
                            availableCapacity < 0 ? 'text-red-600' :
                            availableCapacity <= 20 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {availableCapacity > 0 ? `${availableCapacity}%` : 'Overbooked'}
                          </span>
                        </div>

                        <div className="pt-2">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${
                                capacityUsed > (user?.maxCapacity || 100) ? 'bg-red-500' :
                                capacityUsed >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((capacityUsed / (user?.maxCapacity || 100)) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>{user?.maxCapacity || 100}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-medium mb-4">Career Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{assignments.length}</div>
                      <div className="text-sm opacity-90">Total Assignments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{categorizedAssignments.activeAssignments.length}</div>
                      <div className="text-sm opacity-90">Active Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{categorizedAssignments.pastAssignments.length}</div>
                      <div className="text-sm opacity-90">Completed Projects</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
};