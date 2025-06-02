import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  BarChart2, Users, Calendar, Activity, 
  TrendingUp, PieChart, LineChart, Clock,
  Globe, Music, UserPlus, UserCheck,
  DollarSign, ArrowUp, ArrowDown, RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    totalRevenue: number;
  };
  userAnalytics: {
    newUsers: number;
    userGrowth: number;
    activeMusicians: number;
    verificationRate: number;
  };
  eventAnalytics: {
    upcomingEvents: number;
    completedEvents: number;
    averageAttendance: number;
    eventSuccess: number;
  };
  performanceMetrics: {
    averageResponseTime: number;
    serverUptime: number;
    errorRate: number;
    apiCalls: number;
  };
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAdmin();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Transform the data to match our AnalyticsData interface
      const transformedData: AnalyticsData = {
        overview: {
          totalUsers: responseData.stats.totalUsers,
          activeUsers: responseData.stats.activeUsers || 0,
          totalEvents: responseData.stats.totalEvents || 0,
          totalRevenue: responseData.stats.totalRevenue || 0
        },
        userAnalytics: {
          newUsers: responseData.stats.newUsers,
          userGrowth: ((responseData.stats.newUsers / responseData.stats.totalUsers) * 100) || 0,
          activeMusicians: responseData.stats.activeMusicians || 0,
          verificationRate: ((responseData.stats.verifiedUsers || 0) / responseData.stats.totalUsers * 100) || 0
        },
        eventAnalytics: {
          upcomingEvents: responseData.recentEvents?.length || 0,
          completedEvents: responseData.stats.completedEvents || 0,
          averageAttendance: responseData.stats.averageAttendance || 0,
          eventSuccess: responseData.stats.eventSuccess || 0
        },
        performanceMetrics: {
          averageResponseTime: responseData.stats.averageResponseTime || 0,
          serverUptime: responseData.stats.serverUptime || 100,
          errorRate: responseData.stats.errorRate || 0,
          apiCalls: responseData.stats.apiCalls || 0
        }
      };
      
      setData(transformedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
      setData(null);
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

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <button 
          onClick={() => fetchAnalyticsData()} 
          className="mt-2 flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-400">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
        <button 
          onClick={() => fetchAnalyticsData()}
          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {data.overview.totalUsers}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-900/50 flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Users</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {data.overview.activeUsers}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-900/50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Events</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {data.overview.totalEvents}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-900/50 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${data.overview.totalRevenue}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-900/50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Analytics */}
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-400" />
            User Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">New Users</p>
              <span className="text-white">{data.userAnalytics.newUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">User Growth</p>
              <span className="text-green-400">+{data.userAnalytics.userGrowth}%</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Active Musicians</p>
              <span className="text-white">{data.userAnalytics.activeMusicians}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Verification Rate</p>
              <span className="text-white">{data.userAnalytics.verificationRate}%</span>
            </div>
          </div>
        </div>

        {/* Event Analytics */}
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-400" />
            Event Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Upcoming Events</p>
              <span className="text-white">{data.eventAnalytics.upcomingEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Completed Events</p>
              <span className="text-white">{data.eventAnalytics.completedEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Average Attendance</p>
              <span className="text-white">{data.eventAnalytics.averageAttendance}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Event Success Rate</p>
              <span className="text-green-400">{data.eventAnalytics.eventSuccess}%</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-blue-400" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Response Time</p>
              <span className="text-white">{data.performanceMetrics.averageResponseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Server Uptime</p>
              <span className="text-green-400">{data.performanceMetrics.serverUptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Error Rate</p>
              <span className="text-red-400">{data.performanceMetrics.errorRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">API Calls</p>
              <span className="text-white">{data.performanceMetrics.apiCalls}/min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 