import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Database, HardDrive, Activity, Clock,
  RefreshCw, Download, Upload, Settings,
  AlertCircle, CheckCircle, XCircle,
  BarChart2, PieChart, LineChart,
  Server, Zap, Shield, Database as DatabaseIcon,
  Users, Calendar, Music, UserCheck, UserPlus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { io, Socket } from 'socket.io-client';
import { useSocketIO } from '../../hooks/useSocketIO';

interface DatabaseStats {
  size: number;
  tables: number;
  connections: number;
  queries: number;
  lastBackup: string;
  backupSize: number;
  performance: number;
  health: 'good' | 'warning' | 'critical';
  tables: Array<{
    name: string;
    size: number;
    rows: number;
    lastOptimized: string;
  }>;
  recentQueries: Array<{
    query: string;
    executionTime: number;
    timestamp: string;
  }>;
  backupHistory: Array<{
    date: string;
    size: number;
    status: 'success' | 'failed';
  }>;
}

interface DatabaseMetrics {
  overview: {
    totalUsers: number;
    totalTracks: number;
    totalComments: number;
    totalSubscriptions: number;
    totalEvents: number;
    totalWhatsAppGroups: number;
    totalSecurityLogs: number;
  };
  growth: {
    newUsers: number;
    newTracks: number;
    userGrowthRate: string;
    trackGrowthRate: string;
  };
  active: {
    activeSubscriptions: number;
    pendingVerifications: number;
  };
  performance: {
    dataSize: number;
    storageSize: number;
    indexSize: number;
    collections: number;
    indexes: number;
    objects: number;
  };
  collections: Array<{
    name: string;
    size: number;
    count: number;
    avgObjSize: number;
    storageSize: number;
    totalIndexSize: number;
  }>;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const DatabaseOverview = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      const response = await fetch('/api/admin/database/stats', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching database stats:', error);
      toast.error('Failed to fetch database statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Database Overview</h1>
        <button
          onClick={fetchDatabaseStats}
          className="p-2 text-gray-400 hover:text-white"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Database Size</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {(stats.size / 1024 / 1024).toFixed(2)} MB
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-900/50 flex items-center justify-center">
              <Database className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Connections</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.connections}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-900/50 flex items-center justify-center">
              <Server className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Queries per Second</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.queries}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-900/50 flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Performance</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.performance}%</h3>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              stats.health === 'good' ? 'bg-green-900/50' :
              stats.health === 'warning' ? 'bg-yellow-900/50' :
              'bg-red-900/50'
            }`}>
              {stats.health === 'good' ? <CheckCircle className="h-6 w-6 text-green-400" /> :
               stats.health === 'warning' ? <AlertCircle className="h-6 w-6 text-yellow-400" /> :
               <XCircle className="h-6 w-6 text-red-400" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Table Statistics</h3>
          <div className="space-y-4">
            {stats.tables.map((table, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <span className="text-gray-400">{table.name}</span>
                  <div className="text-sm text-gray-500">
                    {(table.size / 1024).toFixed(2)} KB • {table.rows} rows
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Last optimized: {new Date(table.lastOptimized).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Queries</h3>
          <div className="space-y-4">
            {stats.recentQueries.map((query, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="text-sm text-gray-400 truncate max-w-md">
                  {query.query}
                </div>
                <div className="text-sm text-gray-500">
                  {query.executionTime}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BackupManagement = () => {
  const [backups, setBackups] = useState<DatabaseStats['backupHistory']>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/database/backups', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET
        }
      });
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Failed to fetch backup history');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET
        }
      });
      if (!response.ok) throw new Error('Backup failed');
      toast.success('Database backup created successfully');
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create database backup');
    }
  };

  const handleRestore = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/database/restore/${backupId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET
        }
      });
      if (!response.ok) throw new Error('Restore failed');
      toast.success('Database restored successfully');
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Failed to restore database backup');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Backup Management</h1>
        <button
          onClick={handleBackup}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Create Backup</span>
        </button>
      </div>

      <div className="bg-[#1a1a2e] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0a0a16]">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Size</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-900/30">
            {backups.map((backup, index) => (
              <tr key={index} className="hover:bg-[#0a0a16]">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400">
                    {new Date(backup.date).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400">
                    {(backup.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {backup.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-gray-400 capitalize">
                      {backup.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestore(backup.date)}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Restore Backup"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* Implement download */}}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Download Backup"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DatabaseOptimization = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleOptimize = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/database/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET
        }
      });
      if (!response.ok) throw new Error('Optimization failed');
      toast.success('Database optimized successfully');
    } catch (error) {
      console.error('Error optimizing database:', error);
      toast.error('Failed to optimize database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Database Optimization</h1>
        <button
          onClick={handleOptimize}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Zap className="h-5 w-5" />
          <span>Optimize Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-indigo-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Index Optimization</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Consider adding indexes to frequently queried columns to improve query performance.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <HardDrive className="h-5 w-5 text-indigo-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Storage Management</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Review and clean up unused tables and columns to reduce database size.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Activity className="h-5 w-5 text-indigo-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Query Optimization</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Analyze and optimize slow-running queries to improve overall performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Optimization History</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Last Optimization</h4>
                <p className="text-sm text-gray-400 mt-1">
                  2 hours ago
                </p>
              </div>
              <div className="text-sm text-green-400">
                +15% Performance
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Weekly Average</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Last 7 days
                </p>
              </div>
              <div className="text-sm text-green-400">
                +8% Performance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DatabaseStats = () => {
  const location = useLocation();
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAdmin();

  // Socket.IO connection handling
  const { isConnected: socketConnected, sendMessage } = useSocketIO(
    import.meta.env.VITE_API_URL || 'http://localhost:5000',
    {
      auth: {
        token: user?.token || '',
        adminToken: import.meta.env.VITE_ADMIN_SECRET
      },
      namespace: '/admin/database',
      onConnect: () => {
        console.log('Socket.IO connected to database metrics');
        setError(null);
      },
      onDisconnect: (reason) => {
        console.log('Socket.IO disconnected:', reason);
        setError('Disconnected from real-time updates. Please refresh the page.');
      },
      onError: (error) => {
        console.error('Socket.IO connection error:', error);
        setError('Failed to connect to real-time updates');
      },
      onMessage: (data) => {
        try {
          console.log('Received database metrics update:', data);
          if (data && typeof data === 'object') {
            setMetrics(data);
          } else {
            console.error('Invalid metrics data received:', data);
          }
        } catch (error) {
          console.error('Error processing metrics update:', error);
          setError('Error processing real-time update');
        }
      }
    }
  );

  // Update local connection state when socket connection changes
  useEffect(() => {
    setError(null);
  }, [socketConnected]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching database metrics...');
      
      let retryCount = 0;
      const maxRetries = 3;
      let response;

      while (retryCount < maxRetries) {
        try {
          // First try the metrics endpoint
          response = await api.get('/api/admin/database/metrics', {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
              'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET
            },
            timeout: 10000 // 10 second timeout
          });
          console.log('Metrics endpoint response:', response.data);
          break;
        } catch (metricsError) {
          console.log(`Metrics endpoint attempt ${retryCount + 1} failed, trying stats endpoint...`);
          try {
            response = await api.get('/api/admin/database/stats', {
              headers: {
                'Authorization': `Bearer ${user?.token}`,
                'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET
              },
              timeout: 10000 // 10 second timeout
            });
            console.log('Stats endpoint response:', response.data);
            break;
          } catch (statsError) {
            retryCount++;
            if (retryCount === maxRetries) {
              throw new Error('Failed to fetch database metrics after multiple attempts');
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
      
      if (!response) {
        throw new Error('Failed to fetch database metrics');
      }

      const data = response.data;
      
      // Transform the data if it's from the stats endpoint
      if (data.overview) {
        console.log('Using data in overview format');
        setMetrics(data);
      } else {
        console.log('Transforming data to overview format');
        // Transform the old format to the new format
        const transformedData = {
          overview: {
            totalUsers: data.users || 0,
            totalTracks: data.tracks || 0,
            totalComments: data.comments || 0,
            totalSubscriptions: data.subscriptions || 0,
            totalEvents: data.events || 0,
            totalWhatsAppGroups: data.whatsappGroups || 0,
            totalSecurityLogs: data.securityLogs || 0
          },
          growth: {
            newUsers: data.newUsers || 0,
            newTracks: data.newTracks || 0,
            userGrowthRate: data.userGrowthRate || '0%',
            trackGrowthRate: data.trackGrowthRate || '0%'
          },
          active: {
            activeSubscriptions: data.activeSubscriptions || 0,
            pendingVerifications: data.pendingVerifications || 0
          },
          performance: data.performance || {
            dataSize: 0,
            storageSize: 0,
            indexSize: 0,
            collections: 0,
            indexes: 0,
            objects: 0
          },
          collections: data.collections || []
        };
        setMetrics(transformedData);
      }

      // If socket is connected, emit a metrics_fetched event
      if (socketConnected) {
        sendMessage({ timestamp: new Date().toISOString() });
      }
    } catch (error: any) {
      console.error('Error fetching database metrics:', error.response || error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch database metrics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
  };

  const handleExportMetrics = async () => {
    try {
      const response = await fetch('/api/admin/database/metrics/export', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || '',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to export metrics');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database-metrics.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting metrics:', error);
      toast.error('Failed to export database metrics');
    }
  };

  // Add a connection status indicator
  const ConnectionStatus = () => (
    <div className={`fixed bottom-4 right-4 p-2 rounded-lg ${
      socketConnected ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          socketConnected ? 'bg-green-400' : 'bg-red-400'
        }`} />
        <span className="text-sm">
          {socketConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        <p className="text-gray-400">Loading database metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleRefresh}
            className="flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center text-gray-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No database metrics available</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/stats" element={<DatabaseOverview />} />
        <Route path="/backup" element={<BackupManagement />} />
        <Route path="/optimization" element={<DatabaseOptimization />} />
        <Route path="*" element={<Navigate to="/admin/database/stats" replace />} />
      </Routes>
      <ConnectionStatus />
    </>
  );
};

export default DatabaseStats; 