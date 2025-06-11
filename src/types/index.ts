// Base User interface
export interface User {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: 'manager' | 'engineer';
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  maxCapacity?: number;
  department?: string;
}

// Engineer-specific interface extending User
export interface Engineer extends User {
  role: 'engineer';
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
  currentAllocation?: number; // Calculated field for current workload
}

// Manager-specific interface extending User
export interface Manager extends User {
  role: 'manager';
  department: string;
}

// Engineer Capacity interface for capacity tracking
export interface EngineerCapacity {
  engineerId: string;
  name: string;
  maxCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  assignments: Array<{
    projectId: string;
    projectName: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    role: string;
  }>;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: 'planning' | 'active' | 'completed';
  managerId: string;
  createdAt?: string;
  updatedAt?: string;
}

// MongoDB ObjectId type
interface ObjectId {
  $oid: string;
}

// Updated Assignment interface to match your actual data structure
export interface Assignment {
  _id: string | ObjectId;
  engineerId: string | ObjectId;
  projectId: string | ObjectId;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  // These can be populated by the backend or added by frontend
  projectName?: string;
  project?: {
    _id?: string;
    name: string;
    status?: string;
    description?: string;
    requiredSkills?: string[];
  };
  engineer?: {
    name: string;
    email: string;
  };
}

// Rest of your existing types remain the same...
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: 'planning' | 'active' | 'completed';
}

export interface AssignmentFormData {
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  error?: string;
}

export interface DashboardStats {
  totalEngineers: number;
  activeProjects: number;
  totalAssignments: number;
  overloadedEngineers: number;
  avgUtilization: number;
}

export interface CapacityStatus {
  status: 'Available' | 'Moderate' | 'Busy' | 'Overloaded';
  color: string;
  textColor: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface EngineerSkill {
  name: string;
  level: SkillLevel;
}

export interface EngineerFilter {
  department?: string;
  seniority?: 'junior' | 'mid' | 'senior';
  skills?: string[];
  availabilityStatus?: 'available' | 'busy' | 'overloaded';
  searchTerm?: string;
}

export interface ProjectFilter {
  status?: 'planning' | 'active' | 'completed';
  requiredSkills?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}