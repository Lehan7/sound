import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, 
  XCircle, Search, Download, RefreshCcw,
  Filter, Clock, User, Activity
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

interface SecurityLog {
  _id: string;
  timestamp: string;
  type: 'auth' | 'user' | 'system' | 'api';
  severity: 'info' | 'warning' | 'error';
  action: string;
  description: string;
  ip: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  metadata: Record<string, any>;
}

const SecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | SecurityLog['type']>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | SecurityLog['severity']>('all');
  const { token } = useAuth();

  const getHeaders = (): HeadersInit => ({
    'Authorization': `Bearer ${token}`,
    'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || '',
    'Content-Type': 'application/json'
  });

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/security/logs', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch security logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/admin/security/logs/export', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to export logs');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'security-logs.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || log.type === selectedType;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const getSeverityIcon = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
  };

  const getTypeIcon = (type: SecurityLog['type']) => {
    switch (type) {
      case 'auth':
        return <Shield className="h-5 w-5 text-indigo-400" />;
      case 'user':
        return <User className="h-5 w-5 text-blue-400" />;
      case 'system':
        return <Activity className="h-5 w-5 text-green-400" />;
      case 'api':
        return <Clock className="h-5 w-5 text-yellow-400" />;
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
        <h1 className="text-2xl font-bold text-white">Security Logs</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportLogs}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as 'all' | SecurityLog['type'])}
          className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="auth">Authentication</option>
          <option value="user">User Activity</option>
          <option value="system">System</option>
          <option value="api">API</option>
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value as 'all' | SecurityLog['severity'])}
          className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-[#1a1a2e] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#2a2a3e] text-gray-400">
              <th className="px-6 py-3 text-left">Timestamp</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Action</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">IP</th>
              <th className="px-6 py-3 text-left">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredLogs.map((log) => (
              <tr key={log._id} className="text-white hover:bg-[#2a2a3e]">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(log.type)}
                    <span className="capitalize">{log.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4">
                  <div className="max-w-md truncate" title={log.description}>
                    {log.description}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {log.user ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{log.user.name}</span>
                      <span className="text-sm text-gray-400">{log.user.email}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">System</span>
                  )}
                </td>
                <td className="px-6 py-4">{log.ip}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(log.severity)}
                    <span className={`capitalize ${
                      log.severity === 'error' ? 'text-red-400' :
                      log.severity === 'warning' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {log.severity}
                    </span>
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

export default SecurityLogs;