// src/pages/manager/ManagerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { engineerService, projectService, assignmentService } from '../../services/api';
import { Engineer, Project, Assignment, ProjectFormData, AssignmentFormData } from '../../types/index';
import { AlertCircle, Users, BarChart2, Briefcase, Calendar } from 'lucide-react';

// Import components
import { DashboardHeader } from './components/layout/DashboardHeader';
import { QuickStats } from './components/layout/QuickStats';
import { CapacityBar } from './components/common/CapacityBar';
import { ProjectsSection } from './components/projects/ProjectsSection';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { AssignmentsSection } from './components/assignments/AssignmentsSection';
import { CreateAssignmentModal } from './components/assignments/CreateAssignmentModal';
import { TeamUtilizationChart } from './components/analytics/TeamUtilizationChart';
import { SkillsDistributionChart } from './components/analytics/SkillsDistributionChart';
import { SkillsGapAnalysis } from './components/analytics/SkillsGapAnalysis';

// Tab types
type DashboardTab = 'overview' | 'engineers' | 'projects' | 'assignments' | 'analytics';

export const ManagerDashboard: React.FC = () => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  
  // Modal states
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [createProjectLoading, setCreateProjectLoading] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [createAssignmentLoading, setCreateAssignmentLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  // Data loading and other methods as before...
const loadAllData = async () => {
  try {
    setLoading(true);
    setError('');
    
    const [engineersData, projectsData, assignmentsData] = await Promise.all([
      engineerService.getAll(),
      projectService.getAll(),
      assignmentService.getAll()
    ]);

    // Add this console log to debug
    console.log("Assignments loaded:", assignmentsData);

    // Calculate current allocation for each engineer with FIXED comparison
    const engineersWithAllocation = engineersData.map((eng: Engineer) => {
      // Convert IDs to strings for proper comparison
      const allocation = assignmentsData
        .filter((a: Assignment) => 
          a.engineerId.toString() === eng._id.toString() && isActiveAssignment(a)
        )
        .reduce((sum: number, a: Assignment) => sum + a.allocationPercentage, 0);
      return { ...eng, currentAllocation: allocation };
    });

    setEngineers(engineersWithAllocation);
    setProjects(projectsData);
    setAssignments(assignmentsData);
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to load data');
  } finally {
    setLoading(false);
  }
};

  // Your other functions (refreshProjectsOnly, handleDeleteAssignment, etc.)
  // ...

  const isActiveAssignment = (assignment: Assignment) => {
    const now = new Date();
    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    return start <= now && end >= now;
  };

  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleCreateProjectSubmit = async (projectData: ProjectFormData) => {
    try {
      setCreateProjectLoading(true);
      await projectService.create(projectData);
      await refreshProjectsOnly();
      setShowCreateProjectModal(false);
      console.log('Project created successfully!');
    } catch (err: any) {
      console.error('Failed to create project:', err);
      alert(err.message || 'Failed to create project. Please try again.');
    } finally {
      setCreateProjectLoading(false);
    }
  };

  const refreshProjectsOnly = async () => {
    try {
      const projectsData = await projectService.getAll();
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Failed to refresh projects:', err);
    }
  };

  const refreshAssignmentsAndEngineers = async () => {
  try {
    const [engineersData, assignmentsData] = await Promise.all([
      engineerService.getAll(),
      assignmentService.getAll()
    ]);

    // Calculate current allocation for each engineer
    const engineersWithAllocation = engineersData.map((eng: Engineer) => {
      const allocation = assignmentsData
        .filter((a: Assignment) => 
          a.engineerId.toString() === eng._id.toString() && isActiveAssignment(a)
        )
        .reduce((sum: number, a: Assignment) => sum + a.allocationPercentage, 0);
      return { ...eng, currentAllocation: allocation };
    });

    setEngineers(engineersWithAllocation);
    setAssignments(assignmentsData);
  } catch (err: any) {
    console.error('Failed to refresh assignments and engineers:', err);
  }
};

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await assignmentService.delete(assignmentId);
      await refreshAssignmentsAndEngineers();
      console.log('Assignment deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete assignment:', err);
      alert(err.message || 'Failed to delete assignment. Please try again.');
    }
  };

  const handleCreateAssignment = () => {
    setShowCreateAssignmentModal(true);
  };

  const handleCreateAssignmentSubmit = async (assignmentData: AssignmentFormData) => {
    try {
      setCreateAssignmentLoading(true);
      await assignmentService.create(assignmentData);
      await refreshAssignmentsAndEngineers();
      setShowCreateAssignmentModal(false);
      console.log('Assignment created successfully!');
    } catch (err: any) {
      console.error('Failed to create assignment:', err);
      throw err;
    } finally {
      setCreateAssignmentLoading(false);
    }
  };

  if (loading) {
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
            onClick={loadAllData}
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
      {/* Header Component */}
      <DashboardHeader
        onCreateProject={handleCreateProject}
        onCreateAssignment={handleCreateAssignment}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats always visible at top */}
        <QuickStats
          engineers={engineers}
          projects={projects}
          assignments={assignments}
        />

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mt-8">
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
                onClick={() => setActiveTab('engineers')}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === 'engineers'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Team Members
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === 'projects'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Projects
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
                Assignments
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab - Shows a summary of everything */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome to your team management dashboard. Use the tabs above to navigate to different sections.</p>
                
                {/* Mini preview of engineers */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Team Capacity Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {engineers.slice(0, 3).map(engineer => (
                      <div key={engineer._id} className="bg-white border rounded-lg shadow-sm p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {engineer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium">{engineer.name}</h4>
                            <p className="text-xs text-gray-500">{engineer.department}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <CapacityBar percentage={engineer.currentAllocation || 0} size="sm" />
                        </div>
                      </div>
                    ))}
                    {engineers.length > 3 && (
                      <button 
                        onClick={() => setActiveTab('engineers')}
                        className="bg-gray-50 border rounded-lg shadow-sm p-4 flex items-center justify-center hover:bg-gray-100"
                      >
                        <span className="text-gray-600">+{engineers.length - 3} more members</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Mini preview of projects */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Active Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.filter(p => p.status === 'active').slice(0, 3).map(project => (
                      <div key={project._id} className="bg-white border rounded-lg shadow-sm p-4">
                        <h4 className="text-sm font-medium">{project.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">{project.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.requiredSkills.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => setActiveTab('projects')}
                      className="bg-gray-50 border rounded-lg shadow-sm p-4 flex items-center justify-center hover:bg-gray-100"
                    >
                      <span className="text-gray-600">View all projects</span>
                    </button>
                  </div>
                </div>
                
                {/* Analytics preview */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TeamUtilizationChart 
                      engineers={engineers.slice(0, 5)} 
                      assignments={assignments} 
                    />
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className="bg-gray-50 border rounded-lg shadow-sm p-4 flex items-center justify-center hover:bg-gray-100"
                    >
                      <span className="text-gray-600">View detailed analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Engineers Tab */}
            {activeTab === 'engineers' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Engineers Overview</h2>
                </div>
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seniority</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Capacity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {engineers.map((engineer) => (
                          <tr key={engineer._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {engineer.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{engineer.name}</div>
                                  <div className="text-sm text-gray-500">{engineer.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{engineer.department}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                engineer.seniority === 'senior' ? 'bg-purple-100 text-purple-800' :
                                engineer.seniority === 'mid' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {engineer.seniority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {engineer.skills.slice(0, 3).map((skill, idx) => (
                                  <span 
                                    key={idx} 
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {engineer.skills.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{engineer.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-32">
                                <CapacityBar 
                                  percentage={engineer.currentAllocation || 0}
                                  size="sm"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                  <button
                    onClick={handleCreateProject}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    New Project
                  </button>
                </div>
                <ProjectsSection
                  projects={projects}
                  onCreateProject={handleCreateProject}
                />
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
                  <button
                    onClick={handleCreateAssignment}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    New Assignment
                  </button>
                </div>
                <AssignmentsSection
                  assignments={assignments}
                  engineers={engineers}
                  projects={projects}
                  onCreateAssignment={handleCreateAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                />
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <TeamUtilizationChart 
                    engineers={engineers} 
                    assignments={assignments} 
                  />
                  <SkillsDistributionChart 
                    engineers={engineers} 
                  />
                </div>
                
                <div className="mt-6">
                  <SkillsGapAnalysis 
                    engineers={engineers}
                    projects={projects}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <CreateProjectModal
          isOpen={showCreateProjectModal}
          onClose={() => setShowCreateProjectModal(false)}
          onSubmit={handleCreateProjectSubmit}
          loading={createProjectLoading}
        />
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignmentModal && (
        <CreateAssignmentModal
          isOpen={showCreateAssignmentModal}
          onClose={() => setShowCreateAssignmentModal(false)}
          onSubmit={handleCreateAssignmentSubmit}
          engineers={engineers}
          projects={projects}
          loading={createAssignmentLoading}
        />
      )}
    </div>
  );
};