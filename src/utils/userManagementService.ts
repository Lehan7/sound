import api from './api';
import { User, UserFilters, UserResponse } from '../types/user';
import { toast } from 'react-hot-toast';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface BulkActionResponse {
  success: boolean;
  data: {
    successCount: number;
    failureCount: number;
    errors?: Array<{
      userId: string;
      error: string;
    }>;
  };
}

const userManagementService = {
  async getUsers(page = 1, limit = 10, search = '', filters: UserFilters = {}) {
    try {
      const response = await api.get<ApiResponse<UserResponse>>('/api/admin/users', {
        params: {
          page,
          limit,
          search,
          ...filters
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      throw error;
    }
  },

  isApiHealthy() {
    return api.get('/health').then(() => true).catch(() => false);
  },

  async verifyUser(userId: string) {
    try {
      const response = await api.post<ApiResponse<User>>(`/api/admin/users/${userId}/verify`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to verify user');
      }
      toast.success('User verified successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error verifying user:', error);
      toast.error(error.response?.data?.message || 'Failed to verify user');
      throw error;
    }
  },

  async rejectUser(userId: string, reason?: string) {
    try {
      const response = await api.post<ApiResponse<User>>(`/api/admin/users/${userId}/reject`, { reason });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reject user');
      }
      toast.success('User rejected successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast.error(error.response?.data?.message || 'Failed to reject user');
      throw error;
    }
  },

  async bulkAction(action: 'verify' | 'reject' | 'delete', userIds: string[]) {
    try {
      const response = await api.post<ApiResponse<BulkActionResponse>>(`/api/admin/users/bulk-${action}`, { userIds });
      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to ${action} users`);
      }
      
      const { successCount, failureCount, errors } = response.data.data;
      
      if (failureCount > 0) {
        toast.error(`Failed to ${action} ${failureCount} users`);
        if (errors) {
          console.error('Bulk action errors:', errors);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully ${action}ed ${successCount} users`);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error(`Error in bulk ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} users`);
      throw error;
    }
  },

  async updateUser(userId: string, userData: Partial<User>) {
    try {
      const response = await api.put<ApiResponse<User>>(`/api/admin/users/${userId}`, userData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user');
      }
      toast.success('User updated successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      const response = await api.delete<ApiResponse<null>>(`/api/admin/users/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
      toast.success('User deleted successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
      throw error;
    }
  },

  async exportUsers(userIds: string[]) {
    try {
      const response = await api.post('/api/admin/users/export', { userIds }, { 
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Users exported successfully');
    } catch (error: any) {
      console.error('Error exporting users:', error);
      toast.error(error.response?.data?.message || 'Failed to export users');
      throw error;
    }
  },

  async getTrafficStats() {
    try {
      const response = await api.get<ApiResponse<any>>('/api/admin/stats/traffic');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get traffic stats');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting traffic stats:', error);
      toast.error(error.response?.data?.message || 'Failed to get traffic stats');
      throw error;
    }
  },

  async getVerificationStats() {
    try {
      const response = await api.get<ApiResponse<any>>('/api/admin/verification/stats');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get verification stats');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting verification stats:', error);
      toast.error(error.response?.data?.message || 'Failed to get verification stats');
      throw error;
    }
  },

  cleanup() {
    // Optional: implement if you need to clean up sockets, listeners, etc.
  }
};

export default userManagementService; 