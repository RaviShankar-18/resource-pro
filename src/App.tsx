import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { EngineerDashboard } from './pages/engineer/EngineerDashboard';
import { ManagerDashboard } from './pages/manager/ManagerDashboard'; // Updated path

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, isManager, isEngineer } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            {isManager ? <ManagerDashboard /> : <EngineerDashboard />}
          </PrivateRoute>
        }
      />
      {/* Optional: Add specific routes for future use */}
      <Route
        path="/manager"
        element={
          <PrivateRoute>
            {isManager ? <ManagerDashboard /> : <Navigate to="/" />}
          </PrivateRoute>
        }
      />
      <Route
        path="/engineer"
        element={
          <PrivateRoute>
            {isEngineer ? <EngineerDashboard /> : <Navigate to="/" />}
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;