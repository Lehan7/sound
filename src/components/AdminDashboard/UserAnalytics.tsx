import React from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiUserX,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiAlertCircle,
  FiLoader
} from 'react-icons/fi';
import { UserStats, TrafficStats } from '../../types/user';

interface UserAnalyticsProps {
  userStats: UserStats | null;
  trafficStats: TrafficStats | null;
  isVisible: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const UserAnalytics: React.FC<UserAnalyticsProps> = ({
  userStats,
  trafficStats,
  isVisible,
  isLoading = false,
  error = null
}) => {
  if (!isVisible) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div className="flex items-center text-red-700">
          <FiAlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!userStats || !trafficStats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-center text-yellow-700">
          <FiAlertCircle className="w-5 h-5 mr-2" />
          <span>No statistics available</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-6"
    >
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="text-blue-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active</span>
              <span className="text-green-600">{userStats.activeUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verified Users</p>
              <p className="text-2xl font-bold text-green-600">{userStats.verifiedUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiUserCheck className="text-green-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Pending</span>
              <span className="text-yellow-600">{userStats.pendingVerification}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suspended Users</p>
              <p className="text-2xl font-bold text-red-600">{userStats.suspendedUsers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiUserX className="text-red-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Inactive</span>
              <span className="text-gray-600">
                {userStats.totalUsers - userStats.activeUsers}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Session</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((trafficStats.averageSessionTime || 0) / 60)} min
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiClock className="text-purple-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Logins</span>
              <span className="text-purple-600">{trafficStats.totalLogins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Distribution by Role */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Users by Role</h3>
            <FiPieChart className="text-gray-400 h-5 w-5" />
          </div>
          <div className="space-y-2">
            {userStats.usersByRole && Object.entries(userStats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    role === 'admin' ? 'bg-purple-500' :
                    role === 'moderator' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">{role}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <FiActivity className="text-gray-400 h-5 w-5" />
          </div>
          <div className="space-y-3">
            {userStats.recentActivity?.slice(0, 5)?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{activity.date}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-blue-600">{activity.registrations} new</span>
                  <span className="text-sm text-green-600">{activity.verifications} verified</span>
                </div>
              </div>
            )) || (
              <div className="text-sm text-gray-500">No recent activity available</div>
            )}
          </div>
        </div>

        {/* Traffic Stats */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Traffic Overview</h3>
            <FiBarChart2 className="text-gray-400 h-5 w-5" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Desktop</span>
              <span className="text-sm font-medium text-gray-700">
                {trafficStats.deviceStats.desktop}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mobile</span>
              <span className="text-sm font-medium text-gray-700">
                {trafficStats.deviceStats.mobile}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tablet</span>
              <span className="text-sm font-medium text-gray-700">
                {trafficStats.deviceStats.tablet}
              </span>
            </div>
            {trafficStats.peakHours?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Hours</span>
                  <span className="text-sm font-medium text-gray-700">
                    {trafficStats.peakHours[0].hour}:00
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 