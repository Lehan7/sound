import React, { useEffect, useState } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        if (user) {
          // If user is logged in, redirect to profile
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {/* Add your user management content here */}
    </div>
  );
};

export default UserManagement; 