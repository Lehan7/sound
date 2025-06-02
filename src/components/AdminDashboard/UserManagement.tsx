import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { 
  FiSearch, FiCheck, FiX, FiUserCheck, FiUserX, FiFilter,
  FiArrowUp, FiArrowDown, FiDownload, FiUpload, FiEdit2,
  FiTrash2, FiEye, FiLock, FiUnlock, FiShield, FiAlertCircle,
  FiClock, FiActivity, FiSettings, FiUser, FiMail, FiPhone,
  FiMapPin, FiGlobe, FiCalendar, FiBarChart2, FiPieChart,
  FiTrendingUp, FiUsers, FiBell, FiChevronsLeft, FiChevronLeft,
  FiChevronRight, FiChevronsRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { User, UserStats, TrafficStats, UserFilters } from '../../types/user';
import { EditUserModal } from './EditUserModal';
import { EnhancedVerificationModal } from './EnhancedVerificationModal';
import { UserDetailsModal } from './UserDetailsModal';
import { UserAnalytics } from './UserAnalytics';
import { AdvancedFilters } from './AdvancedFilters';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import debounce from 'lodash/debounce';
import userManagementService from '../../utils/userManagementService';
import api from '../../utils/api';
import { RoleSelector } from './RoleSelector';
import {
  DashboardContainer,
  Header,
  SearchBar,
  SearchInput,
  ActionButton,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Badge,
  Card,
  StatsGrid,
  StatCard,
  UserAvatar,
  UserInfo,
  UserName,
  UserEmail,
  LastActive,
  ActionButtons,
  LoadingContainer
} from './styles/UserManagement.styles';

const UserManagementContent: React.FC = () => {
  // Get admin context first
  const { isAdmin, user } = useAdmin();

  // Add loading state for initialization
  const [initializing, setInitializing] = useState(true);

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    status: '',
    verificationStatus: '',
    country: '',
    dateRange: undefined
  });

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal State
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: 'verify' | 'reject';
  }>({
    isOpen: false,
    user: null,
    action: 'verify'
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {}
  });

  // Stats State
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Add API health state
  const [isApiHealthy, setIsApiHealthy] = useState(true);

  // Error handling utility
  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    const errorMessage = error.response?.data?.message || error.message || `Failed to ${context}`;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Function to fetch users data
  const fetchUsers = async (params: any, retryCount = 0) => {
    try {
      if (!isApiHealthy) {
        setError('API service is currently unavailable. Please try again later.');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Fetching users with params:', params);

      const response = await api.get('/api/admin/users', { params });

      if (!response.data?.data?.users) {
        throw new Error('No users data received from server');
      }

      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.totalPages);
      setError(null);
    } catch (error: any) {
      console.error('Error in fetch users:', error);
      
      // Retry logic for timeout errors
      if (error.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
        return fetchUsers(params, retryCount + 1);
      }

      handleError(error, 'fetch users');
      setUsers([]);
      setTotalPages(1);
      
      // Show specific error message for common issues
      if (error.code === 'ECONNABORTED') {
        setError('Connection timed out. Please check if the server is running.');
      } else if (!error.response) {
        setError('Cannot connect to the server. Please check if the server is running and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      if (isAdmin === undefined) {
        setError('Admin status not available');
        setInitializing(false);
        return;
      }

      if (!isAdmin) {
        setError('Admin access required');
        setInitializing(false);
        return;
      }

      try {
        await fetchUsers({
          page,
          limit: itemsPerPage,
          search: searchTerm,
          ...filters,
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        });
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to fetch initial data. Please check server connection and try again.');
      } finally {
        setInitializing(false);
      }
    };

    initializeData();
  }, [isAdmin]);

  // Add server status check with debouncing
  useEffect(() => {
    let isComponentMounted = true;
    let checkTimeout: NodeJS.Timeout;

    const checkServerStatus = async () => {
      try {
        const response = await api.get('/api/health');
        if (isComponentMounted) {
          setIsApiHealthy(response.status === 200);
          setError(null);
        }
      } catch (error) {
        console.error('Server health check failed:', error);
        if (isComponentMounted) {
          setIsApiHealthy(false);
          setError('Cannot connect to server. Please ensure the server is running.');
        }
      }
    };

    // Initial check with delay
    checkTimeout = setTimeout(checkServerStatus, 1000);

    // Check every minute instead of every 30 seconds
    const interval = setInterval(checkServerStatus, 60000);

    return () => {
      isComponentMounted = false;
      clearTimeout(checkTimeout);
      clearInterval(interval);
    };
  }, []);

  // Debounce the fetchUsers function
  const debouncedFetchUsers = useCallback(
    debounce((params: any) => {
      if (!isApiHealthy) {
        console.log('Skipping fetch - API is not healthy');
        return;
      }
      fetchUsers(params);
    }, 1000), // Increase debounce time to 1 second
    [isApiHealthy, fetchUsers]
  );

  // Effect for search and filter changes with debouncing
  useEffect(() => {
    if (!isAdmin) return;
    
    const params = {
      page,
      limit: itemsPerPage,
      search: searchTerm,
      ...filters,
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction
    };

    debouncedFetchUsers(params);
  }, [page, searchTerm, filters, sortConfig, debouncedFetchUsers, isAdmin]);

  // Add WebSocket event listeners
  useEffect(() => {
    const handleWsConnected = () => {
      setIsConnected(true);
      toast.success('Connected to real-time updates');
    };

    const handleWsDisconnected = () => {
      setIsConnected(false);
      toast.error('Disconnected from real-time updates. Please refresh the page.');
    };

    const handleWsError = (event: CustomEvent) => {
      console.error('WebSocket error:', event.detail);
      toast.error('Error in real-time connection');
    };

    const handleWsMessage = (event: CustomEvent) => {
      const data = event.detail;
      if (data.type === 'USER_UPDATE') {
        // Refresh user data
        debouncedFetchUsers({
          page,
          limit: itemsPerPage,
          search: searchTerm,
          ...filters,
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        });
      } else if (data.type === 'STATS_UPDATE') {
        // Refresh stats
        fetchUserStats();
        fetchTrafficStats();
      }
    };

    // Add event listeners
    window.addEventListener('wsConnected', handleWsConnected);
    window.addEventListener('wsDisconnected', handleWsDisconnected);
    window.addEventListener('wsError', handleWsError as EventListener);
    window.addEventListener('wsMessage', handleWsMessage as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('wsConnected', handleWsConnected);
      window.removeEventListener('wsDisconnected', handleWsDisconnected);
      window.removeEventListener('wsError', handleWsError as EventListener);
      window.removeEventListener('wsMessage', handleWsMessage as EventListener);
    };
  }, [page, searchTerm, filters]);

  // Add useEffect to fetch stats when analytics is shown
  useEffect(() => {
    if (showAnalytics) {
      setStatsLoading(true);
      Promise.all([
        api.get('/api/admin/verification/stats'),
        api.get('/api/admin/stats/traffic')
      ])
        .then(([verificationResponse, trafficResponse]) => {
          setUserStats(verificationResponse.data.data);
          setTrafficStats(trafficResponse.data.data);
          setStatsError(null);
        })
        .catch((error) => {
          console.error('Failed to load statistics:', error);
          setStatsError('Failed to load statistics. Please try again.');
          setUserStats(null);
          setTrafficStats(null);
        })
        .finally(() => {
          setStatsLoading(false);
        });
    }
  }, [showAnalytics]);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilter = (filterType: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1);
  };

  const handleSort = (field: keyof User) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.filter(user => user.id).map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId: string) => {
    if (userId) {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleVerification = async (userId: string, verificationData?: any) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/admin/users/${userId}/verify`, verificationData);
      
      if (response.data?.success) {
        toast.success('User verified successfully');
        await fetchUsers({
          page,
          limit: itemsPerPage,
          search: searchTerm,
          ...filters,
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        });
      } else {
        throw new Error(response.data?.message || 'Failed to verify user');
      }
    } catch (error: any) {
      console.error('Error verifying user:', error);
      toast.error(error.message || 'Failed to verify user');
    } finally {
      setLoading(false);
    }
  };

  const handleRejection = async (userId: string, rejectionReason?: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/admin/users/${userId}/reject`, { reason: rejectionReason });
      
      if (response.data?.success) {
        toast.success('User rejected successfully');
        await fetchUsers({
          page,
          limit: itemsPerPage,
          search: searchTerm,
          ...filters,
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        });
      } else {
        throw new Error(response.data?.message || 'Failed to reject user');
      }
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast.error(error.message || 'Failed to reject user');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'verify' | 'reject' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    try {
      setLoading(true);
      let response;

      switch (action) {
        case 'verify':
          response = await api.post('/api/admin/users/bulk-verify', { userIds: selectedUsers });
          break;
        case 'reject':
          response = await api.post('/api/admin/users/bulk-reject', { userIds: selectedUsers });
          break;
        case 'delete':
          response = await api.post('/api/admin/users/bulk-delete', { userIds: selectedUsers });
          break;
      }

      if (response?.data?.success) {
        toast.success(`Successfully ${action}ed ${selectedUsers.length} users`);
        setSelectedUsers([]);
        setSelectAll(false);
        await fetchUsers({
          page,
          limit: itemsPerPage,
          search: searchTerm,
          ...filters,
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        });
      } else {
        throw new Error(response?.data?.message || `Failed to ${action} users`);
      }
    } catch (error: any) {
      console.error(`Error in bulk ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} users`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updateData: any) => {
    try {
      if (!userId) {
        toast.error('Invalid user ID');
        return;
      }

      setLoading(true);
      const response = await api.put(`/api/admin/users/${userId}`, updateData);
      
      if (response.data.success) {
        // Show different success messages based on what was updated
        if (updateData.verificationStatus) {
          toast.success(`User verification status updated to ${updateData.verificationStatus}`);
        } else if (updateData.role) {
          toast.success(`User role updated to ${updateData.role}`);
        } else if (updateData.status) {
          toast.success(`User status updated to ${updateData.status}`);
        } else {
          toast.success('User updated successfully');
        }

        // Refresh the users list
        await fetchUsers({
          page,
          limit: itemsPerPage,
          search: searchTerm,
          ...filters,
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        });
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      action: async () => {
        try {
          await userManagementService.deleteUser(userId);
          toast.success('User deleted successfully');
          await fetchUsers({
            page,
            limit: itemsPerPage,
            search: searchTerm,
            ...filters,
            sortField: sortConfig.field,
            sortDirection: sortConfig.direction
          });
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete user');
        }
      }
    });
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/admin/users/export', 
        { userIds: selectedUsers.length > 0 ? selectedUsers : 'all' },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Users exported successfully');
    } catch (error: any) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrafficStats = async () => {
    try {
      const stats = await userManagementService.getTrafficStats();
      setTrafficStats(stats);
    } catch (error) {
      console.error('Failed to load traffic statistics:', error);
      setTrafficStats(null);
    }
  };

  const fetchUserStats = async () => {
    try {
      const stats = await userManagementService.getVerificationStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user statistics:', error);
      setUserStats(null);
    }
  };

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Render functions
  const renderHeader = () => (
    <Header>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <div className="flex items-center gap-4">
          <SearchBar>
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <SearchInput
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search users"
            />
          </SearchBar>
          <ActionButton
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <FiFilter />
            Filters
          </ActionButton>
        </div>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-6"
          >
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <RoleSelector
                  value={filters.role}
                  onChange={(value) => handleFilter('role', value)}
                  className="w-full"
                />
                <select
                  value={filters.status}
                  onChange={(e) => handleFilter('status', e.target.value)}
                  className="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => handleFilter('verificationStatus', e.target.value)}
                  className="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ActionButton
                  variant="secondary"
                  onClick={() => setShowAdvancedFilters(true)}
                  className="w-full"
                >
                  Advanced Filters
                </ActionButton>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Header>
  );

  const renderStats = () => (
    <StatsGrid>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.totalUsers || 0}
            </h3>
          </div>
          <FiUsers className="text-blue-500" size={24} />
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.activeUsers || 0}
            </h3>
          </div>
          <FiUserCheck className="text-green-500" size={24} />
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Verification</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.pendingVerification || 0}
            </h3>
          </div>
          <FiClock className="text-yellow-500" size={24} />
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recent Signups</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.recentSignups || 0}
            </h3>
          </div>
          <FiTrendingUp className="text-purple-500" size={24} />
        </div>
      </motion.div>
    </StatsGrid>
  );

  const renderTable = () => (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              <TableHeader>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="form-checkbox rounded text-blue-500"
                />
              </TableHeader>
              <TableHeader>User</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Verification</TableHeader>
              <TableHeader>Last Active</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="form-checkbox rounded text-blue-500"
                  />
                </TableCell>
                <TableCell>
                  <UserInfo>
                    {user.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar}
                        alt={user.name}
                      />
                    ) : (
                      <UserAvatar>
                        <FiUser className="text-gray-500 dark:text-gray-400" size={20} />
                      </UserAvatar>
                    )}
                    <div>
                      <UserName>{user.name}</UserName>
                      <UserEmail>{user.email}</UserEmail>
                    </div>
                  </UserInfo>
                </TableCell>
                <TableCell>
                  <RoleSelector
                    value={user.role}
                    onChange={(value) => {
                      if (!user._id) {
                        toast.error('Invalid user data');
                        return;
                      }
                      handleUpdateUser(user._id, { role: value });
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Badge status={user.status === 'active' ? 'success' : 'danger'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    status={
                      user.verificationStatus === 'verified'
                        ? 'success'
                        : user.verificationStatus === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {user.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <LastActive>
                    <FiClock size={16} />
                    <span>{formatDate(user.lastActive)}</span>
                  </LastActive>
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionButton
                      variant="secondary"
                      onClick={() => setDetailsModal({ isOpen: true, user })}
                      aria-label="View details"
                    >
                      <FiEye size={18} />
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      onClick={() => setEditModal({ isOpen: true, user })}
                      aria-label="Edit user"
                    >
                      <FiEdit2 size={18} />
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
                      aria-label="Delete user"
                    >
                      <FiTrash2 size={18} />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
      
      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </Card>
  );

  if (initializing) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-500">Initializing dashboard...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <ErrorMessage message={error} />
        <button
          onClick={() => {
            setError(null);
            fetchUsers({
              page,
              limit: itemsPerPage,
              search: searchTerm,
              ...filters,
              sortField: sortConfig.field,
              sortDirection: sortConfig.direction
            });
          }}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading && !users.length) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-500">Loading users...</p>
      </LoadingContainer>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardContainer>
        {renderHeader()}
        {renderStats()}
        {renderTable()}
        
        <EditUserModal
          isOpen={editModal.isOpen}
          user={editModal.user}
          onClose={() => setEditModal({ isOpen: false, user: null })}
          onSave={handleUpdateUser}
        />
        
        <UserDetailsModal
          isOpen={detailsModal.isOpen}
          user={detailsModal.user}
          onClose={() => setDetailsModal({ isOpen: false, user: null })}
        />
        
        <EnhancedVerificationModal
          isOpen={verificationModal.isOpen}
          user={verificationModal.user}
          action={verificationModal.action}
          onClose={() => setVerificationModal({ isOpen: false, user: null, action: 'verify' })}
          onVerify={handleVerification}
          onReject={handleRejection}
        />
        
        <AdvancedFilters
          isOpen={showAdvancedFilters}
          filters={filters}
          onClose={() => setShowAdvancedFilters(false)}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setShowAdvancedFilters(false);
          }}
        />
        
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          onConfirm={confirmationDialog.action}
          onCancel={() => setConfirmationDialog({ ...confirmationDialog, isOpen: false })}
        />
      </DashboardContainer>
    </ErrorBoundary>
  );
};

const UserManagement: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserManagementContent />
    </ErrorBoundary>
  );
};

export default UserManagement;