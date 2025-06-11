import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff, User, Lock, AlertCircle, Users } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  // Updated demo accounts
  const demoAccounts = [
    { role: 'Manager', email: 'manager@company.com', password: 'password123' },
    { role: 'John Doe', email: 'john.doe@company.com', password: 'password123' },
    { role: 'Jane Smith', email: 'jane.smith@company.com', password: 'password123' },
    { role: 'Mike Wilson', email: 'mike.wilson@company.com', password: 'password123' },
    { role: 'Lisa Brown', email: 'lisa.brown@company.com', password: 'password123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header - Reduced spacing */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="bg-indigo-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-1 text-sm sm:text-base text-gray-600">Engineering Resource Management</p>
        </div>

        {/* Login Form - Reduced padding */}
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 flex items-start">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-red-800">{error}</p>
                  {error.includes('temporarily unavailable') && (
                    <p className="text-xs text-red-600 mt-1">Please wait, retrying...</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts Section - Compact design */}
        <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-lg p-4 sm:p-5 border-2 border-dashed border-gray-300">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <div className="bg-amber-100 p-1 rounded mr-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
            </div>
            Demo Accounts
          </h3>
          
          {/* Manager Account - Separate */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => quickLogin(demoAccounts[0].email, demoAccounts[0].password)}
              className="w-full text-left p-2.5 sm:p-3 border-2 border-indigo-200 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition duration-150"
            >
              <div className="font-medium text-xs sm:text-sm text-indigo-700">👔 Manager</div>
              <div className="text-xs text-gray-600 mt-0.5">{demoAccounts[0].email}</div>
            </button>
          </div>

          {/* Engineers Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {demoAccounts.slice(1).map((account, index) => (
              <button
                key={account.email}
                type="button"
                onClick={() => quickLogin(account.email, account.password)}
                className="text-left p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition duration-150 group"
              >
                <div className="font-medium text-xs sm:text-sm text-gray-900 group-hover:text-indigo-600">
                  👷 {account.role.split(' ')[0]}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">
                  {account.email.split('@')[0]}
                </div>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            Password: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
};