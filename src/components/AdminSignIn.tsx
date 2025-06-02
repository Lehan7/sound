import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      if (!response) {
        throw new Error('Login failed');
      }

      // Check if user is admin
      if (response.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      // Check if email is verified
      if (!response.isEmailVerified) {
        setError('Please verify your email before logging in.');
        toast.error('Please verify your email before logging in.');
        return;
      }

      // Check verification status
      if (response.verificationStatus !== 'verified') {
        setError('Your account is not verified.');
        toast.error('Your account is not verified.');
        return;
      }

      // Log successful admin login
      console.log('Admin login successful:', response.email);
      
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Log failed login attempt
      console.error('Admin login failed:', {
        email,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a16] px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-900/30 rounded-full mb-4 animate-glow">
            <Shield className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Sign In</h2>
          <p className="text-gray-400">Access the SoundAlchemy admin dashboard</p>
        </div>

        <div className="glass rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@soundalchemy.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              This page is restricted to administrators only.
              <br />
              If you're not an admin, please use the regular sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;