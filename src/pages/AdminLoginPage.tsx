import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader, ShieldAlert } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdmin, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await adminLogin(email, password);
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        setError('This account does not have admin privileges.');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to login. Please check your credentials.');
      }
      
      toast.error('Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-dark-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-dark-600"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <ShieldAlert size={48} className="text-secondary-500" />
          </div>
          <h2 className="text-2xl font-bold mt-4 text-white">Admin Access</h2>
          <p className="text-gray-400 mt-2">Log in to the SoundAlchemy admin panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@soundalchemy.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your admin password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-secondary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader size={18} className="animate-spin mr-2" />
                Logging in...
              </span>
            ) : (
              'Access Admin Panel'
            )}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-center text-xs text-gray-500">
            This area is restricted to authorized administrators only.
            Unauthorized access attempts are logged and may be reported.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;