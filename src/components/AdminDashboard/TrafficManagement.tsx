import React, { useState, useEffect } from 'react';
import { 
  Globe, Users, Activity, Clock, 
  AlertTriangle, Filter, Download,
  MapPin, Server, Shield, Globe2
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TrafficData {
  realtime: {
    activeUsers: number;
    currentRequests: number;
    bandwidth: number;
    topPages: { path: string; views: number }[];
    topCountries: { country: string; users: number }[];
  };
  hourly: {
    timestamp: string;
    users: number;
    requests: number;
    bandwidth: number;
  }[];
  daily: {
    date: string;
    users: number;
    requests: number;
    bandwidth: number;
  }[];
  threats: {
    total: number;
    blocked: number;
    byType: { type: string; count: number }[];
    recent: {
      timestamp: string;
      type: string;
      ip: string;
      country: string;
      action: string;
    }[];
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TrafficManagement = () => {
  const { adminPermissions } = useAdmin();
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchTrafficData();
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchTrafficData, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [timeRange, autoRefresh]);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/traffic?timeRange=${timeRange}`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      toast.error('Failed to load traffic data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/traffic/export?timeRange=${timeRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traffic-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting traffic data:', error);
      toast.error('Failed to export traffic data');
    }
  };

  if (!adminPermissions.includes('view_traffic')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">You do not have permission to view traffic data</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No traffic data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Traffic Management</h1>
        
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 rounded-lg bg-indigo-900/30 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
          </select>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
          >
            <Activity className="h-5 w-5" />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Download className="h-5 w-5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-900/30">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-white">{data.realtime.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-900/30">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Requests</p>
              <p className="text-2xl font-bold text-white">{data.realtime.currentRequests}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-900/30">
              <Globe className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bandwidth</p>
              <p className="text-2xl font-bold text-white">{(data.realtime.bandwidth / 1024 / 1024).toFixed(2)} MB/s</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-900/30">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Threats Blocked</p>
              <p className="text-2xl font-bold text-white">{data.threats.blocked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Traffic Over Time</h3>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeRange === 'hour' ? data.hourly : data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeRange === 'hour' ? 'timestamp' : 'date'} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                />
          <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Device Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Desktop', value: data.devices.desktop },
                    { name: 'Mobile', value: data.devices.mobile },
                    { name: 'Tablet', value: data.devices.tablet }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {Object.values(data.devices).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Pages and Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
          <div className="space-y-4">
            {data.realtime.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-400">{page.path}</span>
                <span className="text-white">{page.views}</span>
            </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
          <div className="space-y-4">
            {data.realtime.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-400">{country.country}</span>
                <span className="text-white">{country.users}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Threats */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Security Threats</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-4">Time</th>
                <th className="pb-4">Type</th>
                <th className="pb-4">IP Address</th>
                <th className="pb-4">Country</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.threats.recent.map((threat, index) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="py-3 text-gray-400">{threat.timestamp}</td>
                  <td className="py-3 text-white">{threat.type}</td>
                  <td className="py-3 text-white">{threat.ip}</td>
                  <td className="py-3 text-white">{threat.country}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      threat.action === 'Blocked' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {threat.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrafficManagement; 