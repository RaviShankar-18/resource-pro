# Engineering Resource Management System

A comprehensive web application for managing engineering teams, projects, and resource allocation. Built with React, TypeScript, and modern web technologies.

![Engineering Resource Management](https://img.shields.io/badge/Status-Active-green) ![React](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.x-blueviolet)

## 🚀 Live Demo

- **Frontend**: [Live Application](https://resource-pro.vercel.app/)
- **Backend API**: [Live](https://engineering-resource-api.vercel.app/)
- **Backend Repository**: [GitHub - Backend API](https://github.com/RaviShankar-18/engineering-resource-api)

## 📖 Overview

The Engineering Resource Management System is a modern web application designed to help engineering managers efficiently allocate resources, track project progress, and manage team capacity. The system provides different interfaces for managers and engineers, each tailored to their specific needs.

### 🎯 Key Features

#### For Managers:
- **Dashboard Overview**: Real-time statistics on engineers, projects, and assignments
- **Team Management**: View all engineers with their skills, capacity, and current workload
- **Project Management**: Create, edit, and track project progress
- **Resource Allocation**: Assign engineers to projects with capacity management
- **Capacity Analytics**: Visual representation of team utilization and overload alerts

#### For Engineers:
- **Personal Dashboard**: Overview of current assignments and capacity usage
- **Assignment Tracking**: View active, upcoming, and completed assignments
- **Profile Management**: View personal information, skills, and work capacity
- **Project Details**: Access detailed information about assigned projects

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database
- **JWT** - Authentication and authorization
- **Vercel** - Deployment platform

## 📦 Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RaviShankar-18/resource-pro.git
   cd resource-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   VITE_API_URL=https://engineering-resource-api.vercel.app
   
   # Application Info
   VITE_APP_NAME=Engineering Resource Management
   VITE_APP_VERSION=1.0.0
   
   # Feature Flags
   VITE_FEATURE_DARK_MODE=true
   VITE_FEATURE_MAINTENANCE_MODE=false
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Demo Credentials

### Manager Account
- **Email**: `manager@company.com`
- **Password**: `password123`

### Engineer Account
- **Email**: `john.doe@company.com`
- **Password**: `password123`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── pages/              # Page components
│   ├── engineer/       # Engineer-specific pages
│   │   └── components/ # Engineer dashboard components
│   └── manager/        # Manager-specific pages
│       └── components/ # Manager dashboard components
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

## 🔌 API Integration

The application integrates with a RESTful API providing the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile


### Engineers Management
- `GET /api/engineers` - Get all engineers
- `GET /api/engineers/:id/capacity` - Get engineer capacity

### Projects Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID

### Assignments Management
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment



## 🤖 AI-Assisted Development Journey

This project was developed with significant assistance from AI tools, demonstrating the power of human-AI collaboration in modern software development.

### 🧠 AI Tools Used

#### ChatGPT
- **Research & Conceptual Understanding**: Helped understand complex concepts like JWT authentication, MongoDB ObjectId handling, and React best practices
- **Problem-Solving**: Provided explanations for "how things work" and "why certain patterns exist"
- **Architecture Decisions**: Guided decisions on project structure and technology choices

#### Claude (Anthropic)
- **Code Development**: Primary AI assistant for writing TypeScript/React components
- **Feature Implementation**: Built complete features like Engineer Dashboard, capacity management, and assignment tracking
- **Debugging & Optimization**: Identified and fixed bugs, improved performance, and enhanced code quality
- **Best Practices**: Enforced TypeScript strict typing, proper error handling, and modern React patterns

### 🚀 How AI Accelerated Development

#### Speed of Development
- **80% faster initial setup**: AI generated boilerplate code, components, and configurations
- **Rapid prototyping**: Quick iteration from concept to working features
- **Instant debugging**: AI identified issues and provided immediate solutions

#### Specific Examples

1. **Complex API Integration**
   ```typescript
   // AI helped create robust API service with retry logic and error handling
   const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
     try {
       return await fn();
     } catch (error) {
       if (retries > 0 && shouldRetry(error)) {
         await delay(1000);
         return retryRequest(fn, retries - 1);
       }
       throw error;
     }
   };
   ```

2. **MongoDB ObjectId Normalization**
   ```typescript
   // AI solved the complex ObjectId handling across the application
   const normalizeId = (id: any): string => {
     if (typeof id === 'object' && id.$oid) return id.$oid;
     return String(id);
   };
   ```

3. **Professional UI Components**
   - Generated complete dashboard layouts matching modern design patterns
   - Created responsive components with proper accessibility
   - Implemented complex state management for real-time updates

#### Quality Improvements
- **Type Safety**: AI ensured comprehensive TypeScript usage
- **Error Handling**: Implemented robust error boundaries and user feedback
- **Performance**: Optimized with useMemo, useCallback, and proper component structure

### 🎯 Challenges Faced & Solutions

#### Challenge 1: Incomplete Code Generation
**Problem**: AI sometimes provided incomplete components or cut off mid-code
**Solution**: 
- Learned to ask for specific sections or continuations
- Developed a pattern of requesting complete files with explicit boundaries
- Used iterative refinement approach

#### Challenge 2: Context Loss
**Problem**: AI would lose track of project structure and previous decisions
**Solution**:
- Maintained detailed project documentation
- Provided context in each interaction
- Created modular requests focusing on specific features

#### Challenge 3: Overly Complex Solutions
**Problem**: AI sometimes suggested enterprise-level solutions for simple problems
**Solution**:
- Explicitly requested "simple" or "minimal" implementations
- Balanced AI suggestions with project requirements
- Iteratively simplified complex solutions

### 🔍 Validation & Understanding Approach

#### Code Validation Process
1. **Line-by-Line Review**: Thoroughly read all AI-generated code
2. **Testing in Browser**: Manually tested every feature and edge case
3. **TypeScript Compilation**: Ensured no type errors or warnings
4. **Console Monitoring**: Watched for runtime errors and performance issues

#### Understanding AI Suggestions
- **Asked "Why?"**: Always requested explanations for AI decisions
- **Alternative Approaches**: Explored multiple solutions for complex problems
- **Best Practices Research**: Verified AI suggestions against official documentation
- **Incremental Learning**: Built understanding through iterative development




