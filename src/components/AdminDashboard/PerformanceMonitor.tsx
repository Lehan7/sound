import React, { useState, useEffect } from 'react';
import { 
  Cpu,
  HardDrive,
  Activity,
  Network,
  Clock,
  RefreshCcw,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PerformanceMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    cached: number;
    buffers: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    readSpeed: number;
    writeSpeed: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
    connections: number;
  };
  system: {
    uptime: number;
    processCount: number;
    lastBoot: string;
    osVersion: string;
  };
  application: {
    responseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    activeUsers: number;
  };
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { token } = useAuth();

  const getHeaders = (): HeadersInit => ({
    'Authorization': `Bearer ${token}`,
    'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || '',
    'Content-Type': 'application/json'
  });

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/performance/metrics', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch performance metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
  };

  const handleExportMetrics = async () => {
    try {
      const response = await fetch('/api/admin/performance/metrics/export', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to export metrics');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'performance-metrics.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting metrics:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-400">
        Failed to load performance metrics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Performance Monitor</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportMetrics}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Metrics
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing || autoRefresh}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              (refreshing || autoRefresh) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* CPU & Memory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Usage */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Cpu className="h-6 w-6 text-indigo-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">CPU Usage</h2>
            </div>
            <span className={`text-2xl font-bold ${
              metrics.cpu.usage > 80 ? 'text-red-400' :
              metrics.cpu.usage > 60 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {metrics.cpu.usage.toFixed(1)}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Temperature</span>
              <span className="text-white">{metrics.cpu.temperature}°C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cores</span>
              <span className="text-white">{metrics.cpu.cores}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Load Average</span>
              <span className="text-white">
                {metrics.cpu.loadAverage.map(load => load.toFixed(2)).join(' | ')}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HardDrive className="h-6 w-6 text-green-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Memory Usage</h2>
            </div>
            <span className={`text-2xl font-bold ${
              (metrics.memory.used / metrics.memory.total) * 100 > 80 ? 'text-red-400' :
              (metrics.memory.used / metrics.memory.total) * 100 > 60 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="text-white">{formatBytes(metrics.memory.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Used</span>
              <span className="text-white">{formatBytes(metrics.memory.used)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Free</span>
              <span className="text-white">{formatBytes(metrics.memory.free)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cached</span>
              <span className="text-white">{formatBytes(metrics.memory.cached)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disk & Network */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Disk Usage */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HardDrive className="h-6 w-6 text-yellow-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Disk Usage</h2>
            </div>
            <span className={`text-2xl font-bold ${
              (metrics.disk.used / metrics.disk.total) * 100 > 80 ? 'text-red-400' :
              (metrics.disk.used / metrics.disk.total) * 100 > 60 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {((metrics.disk.used / metrics.disk.total) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Space</span>
              <span className="text-white">{formatBytes(metrics.disk.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Used Space</span>
              <span className="text-white">{formatBytes(metrics.disk.used)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Free Space</span>
              <span className="text-white">{formatBytes(metrics.disk.free)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Read Speed</span>
              <span className="text-white">{formatBytes(metrics.disk.readSpeed)}/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Write Speed</span>
              <span className="text-white">{formatBytes(metrics.disk.writeSpeed)}/s</span>
            </div>
          </div>
        </div>

        {/* Network Usage */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Network className="h-6 w-6 text-blue-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Network Usage</h2>
            </div>
            <span className="text-2xl font-bold text-blue-400">
              {metrics.network.connections}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Data Received</span>
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-white">{formatBytes(metrics.network.bytesReceived)}/s</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Data Sent</span>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                <span className="text-white">{formatBytes(metrics.network.bytesSent)}/s</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Packets Received</span>
              <span className="text-white">{metrics.network.packetsReceived.toLocaleString()}/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Packets Sent</span>
              <span className="text-white">{metrics.network.packetsSent.toLocaleString()}/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* System & Application */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">System Information</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white">{formatDuration(metrics.system.uptime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Process Count</span>
              <span className="text-white">{metrics.system.processCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Last Boot</span>
              <span className="text-white">{new Date(metrics.system.lastBoot).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">OS Version</span>
              <span className="text-white">{metrics.system.osVersion}</span>
            </div>
          </div>
        </div>

        {/* Application Performance */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-pink-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Application Performance</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Response Time</span>
              <span className={`text-white ${
                metrics.application.responseTime > 1000 ? 'text-red-400' :
                metrics.application.responseTime > 500 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {metrics.application.responseTime.toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Requests/Second</span>
              <span className="text-white">{metrics.application.requestsPerSecond.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Error Rate</span>
              <span className={`text-white ${
                metrics.application.errorRate > 5 ? 'text-red-400' :
                metrics.application.errorRate > 1 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {metrics.application.errorRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Users</span>
              <span className="text-white">{metrics.application.activeUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor; 