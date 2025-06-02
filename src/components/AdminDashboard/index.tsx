import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Users, Settings, Shield, LogOut, Menu, X, Activity, 
  Database, BarChart2, Bell, UserCheck, Globe, Music, 
  Calendar, FileText, Server, Cpu, Network, Lock, 
  AlertTriangle, UserX, UserPlus, Mail, CreditCard,
  LineChart, PieChart, BarChart, Map, Clock, 
  CheckCircle, XCircle, AlertCircle, RefreshCw,
  Database as DatabaseIcon, HardDrive, Zap, ShieldCheck,
  Users as UsersIcon, UserCog, UserCheck2, UserX2,
  Calendar as CalendarIcon, Ticket, List,
  BarChart2 as AnalyticsIcon, TrendingUp, Activity as ActivityIcon,
  Network as NetworkIcon, Server as ServerIcon, Cpu as CpuIcon,
  Shield as SecurityIcon, Lock as LockIcon, AlertTriangle as AlertIcon,
  Database as DatabaseIcon2, HardDrive as HardDriveIcon,
  Settings as SettingsIcon, Cog, Sliders
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import UserManagementRoutes from './UserManagementRoutes';
import SecurityLogs from './SecurityLogs';
import SystemSettings from './SystemSettings';
import TrafficManagement from './TrafficManagement';
import DatabaseStats from './DatabaseStats';
import EventManagement from './EventManagement';
import Analytics from './Analytics';
import UserVerification from './UserVerification';
import PerformanceMonitor from './PerformanceMonitor';
import AdminHome from './AdminHome';
import { toast } from 'react-toastify';
import CreateEvent from './CreateEvent';
import { db } from '../../firebase/config';
import { ref, onValue, off } from 'firebase/database';
import UserAnalytics from './UserAnalytics';
import AdminLayout from './AdminLayout';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  country?: string;
  profileImage?: string;
  verificationStatus?: string;
  instrument?: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
  lastLogin?: string;
  ipAddress?: string;
  deviceInfo?: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

interface SystemStatus {
  status: string;
  uptime: string;
  activeUsers: number;
  serverLoad: number;
  memoryUsage: number;
  lastUpdate: Date;
  securityStatus: {
    threats: number;
    blockedAttempts: number;
    lastScan: Date;
  };
  databaseStatus: {
    size: number;
    connections: number;
    queries: number;
    lastBackup: Date;
  };
  performanceMetrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
}

const AdminDashboardContent = () => {
  const { user, logout } = useAuth();
  const { adminPermissions, isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'online',
    uptime: '0',
    activeUsers: 0,
    serverLoad: 0,
    memoryUsage: 0,
    lastUpdate: new Date(),
    securityStatus: {
      threats: 0,
      blockedAttempts: 0,
      lastScan: new Date()
    },
    databaseStatus: {
      size: 0,
      connections: 0,
      queries: 0,
      lastBackup: new Date()
    },
    performanceMetrics: {
      responseTime: 0,
      throughput: 0,
      errorRate: 0
    }
  });

  // Enhanced security features
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [lastSecurityCheck, setLastSecurityCheck] = useState(new Date());

  // Real-time monitoring
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setIsLoading(true);
        const headers: HeadersInit = {
          'Authorization': `Bearer ${user?.token || ''}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || ''
        };

        const response = await fetch('/api/admin/system-status', { headers });
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        setSystemStatus(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching system status:', error);
        setError('Failed to fetch system status. Please try again later.');
        toast.error('Failed to fetch system status');
      } finally {
        setIsLoading(false);
      }
    };

    const interval = setInterval(fetchSystemStatus, 30000); // Update every 30 seconds
    fetchSystemStatus(); // Initial fetch

    return () => clearInterval(interval);
  }, [user]);

  // Enhanced navigation with all requested features
  const navItems = [
    {
      path: '/admin/users',
      icon: <UsersIcon className="h-5 w-5" />,
      label: 'User Management',
      description: 'Manage users, roles, and permissions',
      permission: 'manage_users',
      subItems: [
        { path: '/admin/users/list', label: 'User List' },
        { path: '/admin/users/roles', label: 'Role Management' },
        { path: '/admin/users/permissions', label: 'Permissions' }
      ]
    },
    {
      path: '/admin/verification',
      icon: <UserCheck2 className="h-5 w-5" />,
      label: 'User Verification',
      description: 'Review and approve user verifications',
      permission: 'manage_verifications',
      subItems: [
        { path: '/admin/verification/pending', label: 'Pending Verifications' },
        { path: '/admin/verification/history', label: 'Verification History' }
      ]
    },
    {
      path: '/admin/events',
      icon: <CalendarIcon className="h-5 w-5" />,
      label: 'Event Management',
      description: 'Manage upcoming events and registrations',
      permission: 'manage_events',
      subItems: [
        { path: '/admin/events/create', label: 'Create Event' },
        { path: '/admin/events/registrations', label: 'Registrations' },
        { path: '/admin/events/analytics', label: 'Event Analytics' }
      ]
    },
    {
      path: '/admin/analytics',
      icon: <AnalyticsIcon className="h-5 w-5" />,
      label: 'Analytics',
      description: 'View detailed analytics and insights',
      permission: 'view_analytics',
      subItems: [
        { path: '/admin/analytics/overview', label: 'Overview' },
        { path: '/admin/analytics/users', label: 'User Analytics' },
        { path: '/admin/analytics/events', label: 'Event Analytics' },
        { path: '/admin/analytics/performance', label: 'Performance' }
      ]
    },
    {
      path: '/admin/traffic',
      icon: <NetworkIcon className="h-5 w-5" />,
      label: 'Traffic Monitor',
      description: 'Monitor system traffic and performance',
      permission: 'monitor_traffic',
      subItems: [
        { path: '/admin/traffic/real-time', label: 'Real-time Traffic' },
        { path: '/admin/traffic/balance', label: 'Traffic Balance' },
        { path: '/admin/traffic/load', label: 'Load Balancing' }
      ]
    },
    {
      path: '/admin/performance',
      icon: <CpuIcon className="h-5 w-5" />,
      label: 'Performance',
      description: 'Monitor and optimize system performance',
      permission: 'monitor_performance',
      subItems: [
        { path: '/admin/performance/metrics', label: 'Performance Metrics' },
        { path: '/admin/performance/optimization', label: 'Optimization' },
        { path: '/admin/performance/caching', label: 'Caching' }
      ]
    },
    {
      path: '/admin/security',
      icon: <SecurityIcon className="h-5 w-5" />,
      label: 'Security',
      description: 'Manage security settings and logs',
      permission: 'manage_security',
      subItems: [
        { path: '/admin/security/logs', label: 'Security Logs' },
        { path: '/admin/security/threats', label: 'Threat Detection' },
        { path: '/admin/security/audit', label: 'Audit Logs' }
      ]
    },
    {
      path: '/admin/database',
      icon: <DatabaseIcon2 className="h-5 w-5" />,
      label: 'Database',
      description: 'Monitor and manage database operations',
      permission: 'manage_database',
      subItems: [
        { path: '/admin/database/stats', label: 'Database Stats' },
        { path: '/admin/database/backup', label: 'Backup & Restore' },
        { path: '/admin/database/optimization', label: 'Optimization' }
      ]
    },
    {
      path: '/admin/settings',
      icon: <SettingsIcon className="h-5 w-5" />,
      label: 'Settings',
      description: 'Configure system settings',
      permission: 'manage_settings',
      subItems: [
        { path: '/admin/settings/general', label: 'General Settings' },
        { path: '/admin/settings/security', label: 'Security Settings' },
        { path: '/admin/settings/email', label: 'Email Settings' },
        { path: '/admin/settings/notifications', label: 'Notifications' }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a16]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-signin" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a16]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-indigo-900/30 text-white"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a16] border-r border-indigo-900/30 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Admin Info */}
        <div className="p-6 border-b border-indigo-900/30">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-indigo-900/50 flex items-center justify-center">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <Users className="h-6 w-6 text-indigo-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
              <p className="text-sm text-indigo-400">Administrator</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="p-4 border-b border-indigo-900/30">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className={`