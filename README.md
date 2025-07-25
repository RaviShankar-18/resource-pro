# Engineering Resource Management System

A comprehensive web application for managing engineering teams, projects, and resource allocation.  
Built with React, TypeScript, modern web technologies, and JWT-based authentication for role-based access control.

---

## Demo Link

[Live Demo](https://resource-pro.vercel.app/)  

---

## Login

> **Manager Account**  
> Email: `manager@company.com`  
> Password: `password123`

> **Engineer Account**  
> Email: `john.doe@company.com`  
> Password: `password123`

---

## Quick Start

```
git clone https://github.com/RaviShankar-18/resource-pro.git
cd resource-pro
npm install
npm run dev
```

## Technologies
- React 18
- TypeScript
- Tailwind CSS
- Lucide React
- Axios
- Vite
- Node.js
- MongoDB
- JWT

## Features
**Manager Dashboard**
- Real-time statistics on engineers, projects, and assignments
- Team management with skills, capacity, and workload tracking
- Project creation, editing, and progress tracking
- Resource allocation with capacity management
- Visual analytics for team utilization and overload alerts

**Engineer Dashboard**
- Personal dashboard with current assignments overview
- Assignment tracking for active, upcoming, and completed tasks
- Profile management with skills and work capacity display
- Detailed project information for assigned work

**Authentication & Security**
- JWT-based authentication system
- Role-based access control (Manager/Engineer)
- Secure API integration with protected routes
- User profile management

**Technical Features**
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Modern React patterns with hooks
- Real-time data updates
- Error handling and user feedback

## API Reference

### **POST /api/auth/login**
User authentication  
Sample Response:
```json
{ "token": "jwt_token", "user": { "id": "...", "role": "manager" } }
```

### **GET /api/auth/profile**
Get user profile  
Sample Response:
```json
{ "id": "...", "email": "...", "role": "manager", "name": "..." }
```

### **GET /api/engineers**
Get all engineers  
Sample Response:
```json
[{ "_id": "...", "name": "...", "skills": [...], "capacity": 40 }]
```

### **GET /api/engineers/:id/capacity**
Get engineer capacity details  
Sample Response:
```json
{ "engineerId": "...", "totalCapacity": 40, "usedCapacity": 30 }
```

### **GET /api/projects**
Get all projects  
Sample Response:
```json
[{ "_id": "...", "name": "...", "status": "active", "assignments": [...] }]
```

### **POST /api/projects**
Create new project  
Sample Response:
```json
{ "_id": "...", "name": "...", "description": "...", "status": "active" }
```

### **GET /api/assignments**
Get all assignments  
Sample Response:
```json
[{ "_id": "...", "projectId": "...", "engineerId": "...", "hours": 20 }]
```

### **POST /api/assignments**
Create new assignment  
Sample Response:
```json
{ "_id": "...", "projectId": "...", "engineerId": "...", "hours": 20 }
```

## Contact
For bugs or feature requests, please reach out to ravishankarkumar.work@gmail.com
