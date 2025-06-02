import React from 'react';
import { motion } from 'framer-motion';
import { UserFilters } from '../../types/user';

interface AdvancedFiltersProps {
  filters: UserFilters;
  onFilterChange: (filterType: keyof UserFilters, value: any) => void;
  isVisible: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="pt-4 border-t border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            value={filters.role || ''}
            onChange={(e) => onFilterChange('role', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 text-gray-700"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Verification</label>
          <select
            value={filters.verified === undefined ? '' : filters.verified.toString()}
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange('verified', value === '' ? undefined : value === 'true');
            }}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 text-gray-700"
          >
            <option value="">All Users</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date Range</label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => onFilterChange('dateRange', {
                ...filters.dateRange,
                start: e.target.value
              })}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 text-gray-700"
            />
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => onFilterChange('dateRange', {
                ...filters.dateRange,
                end: e.target.value
              })}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            onFilterChange('role', '');
            onFilterChange('status', '');
            onFilterChange('verified', undefined);
            onFilterChange('dateRange', undefined);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          Clear Filters
        </button>
      </div>
    </motion.div>
  );
}; 