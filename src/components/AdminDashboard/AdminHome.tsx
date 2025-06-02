import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, Music, Calendar, Database,
  Shield, Activity, BarChart2, Settings,
  TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useSocketIO } from '../../hooks/useSocketIO';
import { ErrorBoundary } from 'react-error-boundary';
import toast from 'react-hot-toast';

interface StatsData {
  stats: {
    totalUsers: number;
    newUsers: number;
    totalTracks: number;
    newTracks: number;
    activeSubscriptions: number;
  };
  recentEvents: any[];
  recentSecurityLogs: any[];
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
    <p className="text-red-300 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="space-y-6">
    <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const AdminHome: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, isAdmin } = useAdmin();
  const reconnectAttempts = useRef(0);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // Socket.IO connection for real-time updates
  const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log('Initializing Socket.IO connection to:', socketUrl);
  
  const { isConnected, sendMessage } = useSocketIO(socketUrl, {
    auth: {
      token: user?.token || '',
      adminToken: import.meta.env.VITE_ADMIN_SECRET || ''
    },
    namespace: '/admin',
    onConnect: () => {
      console.log('Socket.IO connected successfully to:', socketUrl);
      toast.success('Connected to real-time updates');
      // Request initial data after connection
      sendMessage('request_stats', {});
    },
    onError: (error) => {
      console.error('Socket.IO connection error:', error, 'URL:', socketUrl);
      toast.error(`Failed to connect to real-time updates: ${error.message}`);
    },
    onDisconnect: (reason: string) => {
      console.log('Socket.IO disconnected. Reason:', reason);
      if (reason === 'io client disconnect') {
        toast.error('Disconnected from real-time updates. Please refresh the page.');
      } else {
        toast.error(`Disconnected from real-time updates: ${reason}`);
      }
    },
    onMessage: (data) => {
      console.log('Received Socket.IO message:', data);
      if (data.type === 'stats') {
        setStats(data.stats);
        setLastUpdated(new Date());
        toast.success('Dashboard data updated');
      }
    }
  });

  // Add connection status indicator in the UI
  const connectionStatus = (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={`${isConnected ? 'text-green-400' : 'text-red-400'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin, fetchDashboardStats]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4 text-sm">
            {connectionStatus}
            {lastUpdated && (
              <p className="text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={fetchDashboardStats}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg transition-colors flex items-center gap-2"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* User Stats */}
          <div className="bg-[#1a1a2e] rounded-xl p-6 hover:bg-[#1f1f35] transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats?.stats?.totalUsers || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-900/50 flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+{stats?.stats?.newUsers || 0}</span>
              <span className="text-gray-500 ml-2">new this month</span>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-6 hover:bg-[#1f1f35] transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Total Tracks</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats?.stats?.totalTracks || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-900/50 flex items-center justify-center">
                <Music className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+{stats?.stats?.newTracks || 0}</span>
              <span className="text-gray-500 ml-2">new this month</span>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-6 hover:bg-[#1f1f35] transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Active Subscriptions</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats?.stats?.activeSubscriptions || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-900/50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Current active subscriptions</span>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-6 hover:bg-[#1f1f35] transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Upcoming Events</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats?.recentEvents?.length || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-900/50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Scheduled events</span>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        {stats?.recentEvents && stats.recentEvents.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Events</h3>
            <div className="space-y-4">
              {stats.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-white">{event.title}</p>
                    <p className="text-sm text-gray-400">{new Date(event.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {event.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Security Logs */}
        {stats?.recentSecurityLogs && stats.recentSecurityLogs.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Security Logs</h3>
            <div className="space-y-4">
              {stats.recentSecurityLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-white">{log.action}</p>
                    <p className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {log.ipAddress}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AdminHome; 