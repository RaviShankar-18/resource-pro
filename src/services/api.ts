import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://engineering-resource-api.vercel.app';

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds for better reliability
});

// Enhanced retry logic for failed requests
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // Increased to 2 seconds

const retryRequest = async (fn: () => Promise<any>, retries = MAX_RETRY_ATTEMPTS): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Retry on 500, 502, 503, 504 errors or network errors
    const shouldRetry = retries > 0 && (
      axiosError.response?.status === 500 ||
      axiosError.response?.status === 502 ||
      axiosError.response?.status === 503 ||
      axiosError.response?.status === 504 ||
      axiosError.code === 'ECONNABORTED' ||
      axiosError.code === 'ENOTFOUND' ||
      axiosError.code === 'ECONNRESET' ||
      !axiosError.response // Network error
    );

    if (shouldRetry) {
      const attemptNumber = MAX_RETRY_ATTEMPTS - retries + 1;
      console.log(`🔄 Retrying request (attempt ${attemptNumber}/${MAX_RETRY_ATTEMPTS})...`);
      console.log(`⏱️ Waiting ${RETRY_DELAY}ms before retry`);
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// Helper function to normalize MongoDB ObjectId
const normalizeId = (id: any): string => {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'object') {
    if (id.$oid) return id.$oid;
    if (id._id) return normalizeId(id._id);
    return String(id);
  }
  return String(id);
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request logging for debugging
  console.log(`🌐 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
  
  return config;
});

// Enhanced error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Request successful: ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    console.error(`❌ Request failed:`, {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('🔐 Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Authentication failed. Please login again.'));
    }
    
    // Enhanced error message handling
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      const status = error.response.status;
      
      switch (status) {
        case 400:
          errorMessage = data.error || data.message || 'Bad request. Please check your input.';
          break;
        case 403:
          errorMessage = 'Access denied. You don\'t have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. The service is experiencing issues. Please try again.'; // This is line 88 area
          break;
        case 502:
          errorMessage = 'Bad gateway. The service is temporarily unavailable.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        case 504:
          errorMessage = 'Gateway timeout. The request took too long to process.';
          break;
        default:
          errorMessage = data.error || data.message || `Server error (${status})`;
      }
    } else if (error.request) {
      // Request made but no response
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Network error. Unable to reach the server. Please check your internet connection.';
      } else {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
    } else {
      // Something else happened
      errorMessage = error.message || 'Failed to make request';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Enhanced auth service with better error handling
export const authService = {
  login: async (email: string, password: string) => {
    console.log('🔐 Attempting login for:', email);
    
    return retryRequest(async () => {
      try {
        const response = await api.post('/api/auth/login', { email, password });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('✅ Login successful, token stored');
        }
        
        return response.data;
      } catch (error) {
        console.error('❌ Login failed:', error);
        throw error;
      }
    });
  },
  
  getProfile: async () => {
    console.log('👤 Fetching user profile...');
    
    return retryRequest(async () => {
      const response = await api.get('/api/auth/profile');
      console.log('✅ Profile fetched successfully');
      return response.data;
    });
  },
  
  logout: () => {
    console.log('🔓 Logging out...');
    localStorage.removeItem('token');
  },
  
  updateProfile: async (data: { name?: string; skills?: string[] }) => {
    console.log('📝 Updating profile with data:', data);
    
    return retryRequest(async () => {
      const response = await api.put('/api/auth/profile', data);
      console.log('✅ Profile updated successfully:', response.data);
      return response.data;
    });
  },
};

export const engineerService = {
  getAll: async () => {
    console.log('👥 Fetching all engineers...');
    
    return retryRequest(async () => {
      const response = await api.get('/api/engineers');
      return response.data;
    });
  },
  
  getCapacity: async (engineerId: string) => {
    const normalizedId = normalizeId(engineerId);
    console.log('📊 Fetching capacity for engineer:', normalizedId);
    
    return retryRequest(async () => {
      const response = await api.get(`/api/engineers/${normalizedId}/capacity`);
      return response.data;
    });
  },
  
  updateProfile: async (engineerId: string, data: { name?: string; skills?: string[] }) => {
    console.log('engineerService.updateProfile is deprecated. Use authService.updateProfile instead.');
    return authService.updateProfile(data);
  },
  
  getWithAssignments: async (engineerId: string) => {
    const normalizedId = normalizeId(engineerId);
    console.log('👤 Fetching engineer with assignments:', normalizedId);
    
    return retryRequest(async () => {
      const response = await api.get(`/api/engineers/${normalizedId}?include=assignments`);
      return response.data;
    });
  },
};

export const projectService = {
  getAll: async () => {
    console.log('📁 Fetching all projects...');
    
    return retryRequest(async () => {
      const response = await api.get('/api/projects');
      return response.data;
    });
  },
  
  create: async (projectData: any) => {
    console.log('➕ Creating new project:', projectData.name);
    
    return retryRequest(async () => {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    });
  },
  
  getById: async (projectId: string) => {
    const normalizedId = normalizeId(projectId);
    console.log('🔍 Fetching project by ID:', normalizedId);
    
    if (!normalizedId || normalizedId === 'undefined' || normalizedId === '[object Object]') {
      throw new Error('Invalid project ID');
    }
    
    return retryRequest(async () => {
      const response = await api.get(`/api/projects/${normalizedId}`);
      return response.data;
    });
  },
};

export const assignmentService = {
  getAll: async () => {
    console.log('📋 Fetching all assignments...');
    
    return retryRequest(async () => {
      const response = await api.get('/api/assignments');
      console.log('✅ Assignments fetched:', response.data.length, 'items');
      return response.data;
    });
  },

  getEngineerAssignments: async (engineerId: string) => {
    const normalizedEngineerId = normalizeId(engineerId);
    console.log('🔍 Fetching assignments for engineer:', normalizedEngineerId);
    
    return retryRequest(async () => {
      try {
        // Try direct endpoint first
        const response = await api.get(`/api/assignments`, {
          params: { engineerId: normalizedEngineerId }
        });
        console.log('✅ Engineer assignments fetched:', response.data.length, 'items');
        return response.data;
      } catch (error) {
        console.warn('⚠️ Backend filtering failed, using client-side filtering');
        
        const allAssignments = await assignmentService.getAll();
        const filteredAssignments = allAssignments.filter((assignment: any) => {
          const assignmentEngineerId = normalizeId(assignment.engineerId);
          return assignmentEngineerId === normalizedEngineerId;
        });
        
        console.log('✅ Client-filtered assignments:', filteredAssignments.length, 'items');
        return filteredAssignments;
      }
    });
  },

  getProjectDetails: async (projectId: string) => {
    const normalizedId = normalizeId(projectId);
    console.log('🔍 Fetching project details:', normalizedId);
    
    if (!normalizedId || normalizedId === '[object Object]' || normalizedId === 'undefined') {
      console.warn('⚠️ Invalid project ID, returning fallback');
      return {
        _id: 'unknown',
        name: 'Unknown Project',
        description: 'Project details unavailable',
        status: 'unknown',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        requiredSkills: [],
        teamSize: 0,
        managerId: ''
      };
    }
    
    return retryRequest(async () => {
      try {
        const response = await api.get(`/api/projects/${normalizedId}`);
        return response.data;
      } catch (error) {
        console.warn('⚠️ Failed to fetch project details, returning fallback');
        return {
          _id: normalizedId,
          name: 'Project Details Unavailable',
          description: 'Unable to load project information',
          status: 'unknown',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          requiredSkills: [],
          teamSize: 0,
          managerId: ''
        };
      }
    });
  },

  getProjectById: async (projectId: string) => {
    const normalizedId = normalizeId(projectId);
    console.log('🔍 Fetching project by ID (assignmentService):', normalizedId);
    
    if (!normalizedId || normalizedId === 'undefined' || normalizedId === '[object Object]') {
      throw new Error('Invalid project ID');
    }
    
    return retryRequest(async () => {
      const response = await api.get(`/api/projects/${normalizedId}`);
      return response.data;
    });
  },

  create: async (assignmentData: any) => {
    console.log('➕ Creating new assignment');
    
    return retryRequest(async () => {
      const response = await api.post('/api/assignments', assignmentData);
      return response.data;
    });
  },
  
  update: async (assignmentId: string, data: any) => {
    const normalizedId = normalizeId(assignmentId);
    console.log('📝 Updating assignment:', normalizedId);
    
    return retryRequest(async () => {
      const response = await api.put(`/api/assignments/${normalizedId}`, data);
      return response.data;
    });
  },
  
  delete: async (assignmentId: string) => {
    const normalizedId = normalizeId(assignmentId);
    console.log('🗑️ Deleting assignment:', normalizedId);
    
    return retryRequest(async () => {
      const response = await api.delete(`/api/assignments/${normalizedId}`);
      return response.data;
    });
  },
};

export const skillsService = {
  getAll: async () => {
    console.log('🎯 Fetching skills...');
    
    try {
      const response = await api.get('/api/skills');
      return response.data;
    } catch (error) {
      console.log('⚠️ Skills endpoint not available, using fallback');
      return [
  "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js", 
  "Express", "Python", "Django", "Flask", "Java", "Spring", "C#", ".NET",
  "PHP", "Laravel", "Go", "Rust", "Swift", "Kotlin", "AWS", "Azure", 
  "Google Cloud", "Docker", "Kubernetes", "CI/CD", "DevOps", "GraphQL", 
  "REST API", "MongoDB", "PostgreSQL", "MySQL", "Redis", "ElasticSearch",
  "Mobile Development", "Frontend", "Backend", "Full Stack", "Testing",
  "Data Science", "Machine Learning", "Agile", "Scrum"
];
    }
  }
};

export { normalizeId };