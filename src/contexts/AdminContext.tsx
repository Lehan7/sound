import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/axios';

// Import User type from AuthContext
import { User as AuthUser } from './AuthContext';

interface AdminUser {
  id: string;
  username?: string;
  name?: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  address?: string;
  preferences?: {
    theme: string;
    notifications: boolean;
    language: string;
  };
}

interface UserResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SecurityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

interface SystemSettings {
  id: string;
  name: string;
  value: any;
  category: string;
  description: string;
  lastUpdated: string;
}

interface AdminPermissions {
  manage_users: boolean;
  manage_events: boolean;
  manage_verifications: boolean;
  view_analytics: boolean;
  monitor_traffic: boolean;
  monitor_performance: boolean;
  manage_security: boolean;
  manage_database: boolean;
  manage_settings: boolean;
}

interface AdminContextType {
  users: AdminUser[];
  securityLogs: SecurityLog[];
  systemSettings: SystemSettings[];
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
  adminPermissions: AdminPermissions;
  getUsers: (page?: number, limit?: number, search?: string) => Promise<UserResponse>;
  updateUser: (userId: string, data: Partial<AdminUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  verifyUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  getSecurityLogs: () => Promise<SecurityLog[]>;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([]);
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions>({
    manage_users: true,
    manage_events: true,
    manage_verifications: true,
    view_analytics: true,
    monitor_traffic: true,
    monitor_performance: true,
    manage_security: true,
    manage_database: true,
    manage_settings: true
  });

  const isAdmin = user?.role === 'admin';

  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${user?.token}`,
    'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || '',
    'Content-Type': 'application/json'
  }), [user?.token]);

  const getUsers = useCallback(async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}&search=${search}`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setError(null);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch users';
      console.error('Error fetching users:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const updateUser = useCallback(async (userId: string, data: Partial<AdminUser>) => {
    try {
      setLoading(true);
      await api.put(`/api/admin/users/${userId}`, data);
      toast.success('User updated successfully');
      await getUsers();
    } catch (error) {
      setError('Failed to update user');
      toast.error('Failed to update user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      await getUsers();
    } catch (error) {
      setError('Failed to delete user');
      toast.error('Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  const verifyUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/admin/users/${userId}/verify`);
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to verify user');
      }
      
      toast.success('User verified successfully');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to verify user';
      console.error('Error verifying user:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectUser = useCallback(async (userId: string, notes?: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/admin/users/${userId}/reject`, { notes });
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to reject user');
      }
      
      toast.success('User rejected successfully');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to reject user';
      console.error('Error rejecting user:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSecurityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/security/logs', {
        headers: getHeaders()
      });
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to fetch security logs');
      }
      
      setSecurityLogs(response.data.logs);
      return response.data.logs;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch security logs';
      console.error('Error fetching security logs:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>) => {
    try {
      setLoading(true);
      const response = await api.put('/api/admin/settings', settings, {
        headers: getHeaders()
      });
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to update system settings');
      }
      
      setSystemSettings(response.data.settings);
      toast.success('System settings updated successfully');
      return response.data.settings;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update system settings';
      console.error('Error updating system settings:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        getUsers(),
        getSecurityLogs()
      ]);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh data';
      console.error('Error refreshing data:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getUsers, getSecurityLogs]);

  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [isAdmin, refreshData]);

  const value = {
    users,
    securityLogs,
    systemSettings,
    loading,
    error,
    user,
    isAdmin,
    adminPermissions,
    getUsers,
    updateUser,
    deleteUser,
    verifyUser,
    rejectUser,
    getSecurityLogs,
    updateSystemSettings,
    refreshData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 