import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isVerified?: boolean;
  profileComplete?: boolean;
  country?: string;
  instrument?: string;
  profileImage?: string;
  isActive?: boolean;
  verificationStatus?: string;
}

interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  instrumentType: string;
  instrumentDetails?: string;
  singingType?: string;
  musicCulture?: string;
  aboutMe?: string;
  interests: string[];
  experience?: string;
  goals?: string;
  termsAccepted: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (formData: RegistrationFormData) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  isAdmin: () => boolean;
  handleAuthCallback: (token: string, refreshToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      if (response.data && response.data.user) {
        setUserProfile(response.data.user);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
      toast.error('Failed to fetch user profile');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthCallback = async (token: string, refreshToken: string) => {
    try {
      if (!token || !refreshToken) {
        throw new Error('Invalid tokens provided');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await fetchUserProfile();
      navigate('/profile');
    } catch (error) {
      console.error('Auth callback error:', error);
      setError('Failed to complete authentication');
      navigate('/login');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/users/login', { email, password });
      
      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, refreshToken, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setUserProfile(user);
      
      toast.success('Login successful!');
      navigate('/profile');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/users/logout');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setUserProfile(null);
      navigate('/login');
    }
  };

  const register = async (formData: RegistrationFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Transform the data to match backend expectations
      const registrationData = {
        ...formData,
        termsAccepted: 'true' // Convert boolean to string 'true'
      };

      console.log('Sending registration data:', registrationData);
      const response = await axios.post('/api/users/register', registrationData);
      console.log('Registration response:', response.data);

      if (response.data.success === false && response.data.errors) {
        // Log validation errors for debugging
        console.log('Validation errors:', response.data.errors);
        // Handle validation errors
        const validationErrors = response.data.errors.reduce((acc: any, err: any) => {
          acc[err.field] = err.message;
          return acc;
        }, {});
        setError(validationErrors);
        throw new Error('Validation failed');
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setUser(response.data.data.user);
        setUserProfile(response.data.data.user);
        
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/profile');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        // Log validation errors for debugging
        console.log('Validation errors:', error.response.data.errors);
        const validationErrors = error.response.data.errors.reduce((acc: any, err: any) => {
          acc[err.field] = err.message;
          return acc;
        }, {});
        setError(validationErrors);
        toast.error('Please fix the validation errors in the form');
      } else {
        const message = error.response?.data?.message || 'Registration failed';
        setError({ general: message });
        toast.error(message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const response = await axios.post('/api/forgot-password', { email });
      if (response.data.success) {
        toast.success('Password reset instructions sent to your email');
        return response.data;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to request password reset';
      setError(message);
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await axios.post('/api/reset-password', { token, password: newPassword });
      if (response.data.success) {
        toast.success('Password reset successful! You can now login with your new password.');
        return response.data;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      setError(message);
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await axios.post('/api/change-password', { currentPassword, newPassword });
      if (response.data.success) {
        toast.success('Password changed successfully');
        return response.data;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      setError(message);
      toast.error(message);
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await axios.put(`/api/users/${user?.id}`, userData);
      if (response.data.success) {
        setUserProfile(response.data.user);
        setUser(response.data.user);
        toast.success('Profile updated successfully');
        return response.data;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      setError(message);
      toast.error(message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    changePassword,
    updateProfile,
    clearError,
    isAdmin,
    handleAuthCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 