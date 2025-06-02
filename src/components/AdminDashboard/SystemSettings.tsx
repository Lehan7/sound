import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCcw, 
  Mail, Shield, Clock, Users,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { useAdmin } from "../../contexts/AdminContext";
import { useAuth } from "../../contexts/AuthContext";
import toast from 'react-hot-toast';

interface SystemConfig {
  security: {
    maxLoginAttempts: number;
    passwordMinLength: number;
    sessionTimeout: number;
    requireTwoFactor: boolean;
    allowedOrigins: string[];
  };
  email: {
    requireVerification: boolean;
    verificationTimeout: number;
    allowedDomains: string[];
    notificationTypes: string[];
  };
  users: {
    allowRegistration: boolean;
    defaultRole: string;
    autoApprove: boolean;
    maxInactivityDays: number;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
    scheduledTime?: string;
  };
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { adminPermissions } = useAdmin();

  const getHeaders = (): HeadersInit => ({
    'Authorization': `Bearer ${token}`,
    'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || '',
    'Content-Type': 'application/json'
  });

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/system/config', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch system configuration');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching system configuration:', error);
      toast.error('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const response = await fetch('/api/admin/system/config', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update system configuration');
      toast.success('System configuration updated successfully');
    } catch (error) {
      console.error('Error updating system configuration:', error);
      toast.error('Failed to update system configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    section: keyof SystemConfig,
    field: string,
    value: any
  ) => {
    if (!config) return;
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center text-gray-400">
        Failed to load system configuration
      </div>
    );
  }

  if (!adminPermissions.includes('manage_settings')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">
          You do not have permission to manage system settings
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Settings */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-indigo-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Maximum Login Attempts
              </label>
              <input
                type="number"
                value={config.security.maxLoginAttempts}
                onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={config.security.passwordMinLength}
                onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={config.security.sessionTimeout}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.security.requireTwoFactor}
                onChange={(e) => handleInputChange('security', 'requireTwoFactor', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-400">
                Require Two-Factor Authentication
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Mail className="h-6 w-6 text-green-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Email Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.email.requireVerification}
                onChange={(e) => handleInputChange('email', 'requireVerification', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-400">
                Require Email Verification
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Verification Timeout (hours)
              </label>
              <input
                type="number"
                value={config.email.verificationTimeout}
                onChange={(e) => handleInputChange('email', 'verificationTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Allowed Email Domains
              </label>
              <input
                type="text"
                value={config.email.allowedDomains.join(', ')}
                onChange={(e) => handleInputChange('email', 'allowedDomains', e.target.value.split(',').map(d => d.trim()))}
                placeholder="example.com, another.com"
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-yellow-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">User Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.users.allowRegistration}
                onChange={(e) => handleInputChange('users', 'allowRegistration', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-400">
                Allow New Registrations
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Default User Role
              </label>
              <select
                value={config.users.defaultRole}
                onChange={(e) => handleInputChange('users', 'defaultRole', e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="user">User</option>
                <option value="musician">Musician</option>
                <option value="producer">Producer</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.users.autoApprove}
                onChange={(e) => handleInputChange('users', 'autoApprove', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-400">
                Auto-approve New Users
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Max Inactivity Days
              </label>
              <input
                type="number"
                value={config.users.maxInactivityDays}
                onChange={(e) => handleInputChange('users', 'maxInactivityDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Settings */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Settings className="h-6 w-6 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Maintenance Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.maintenance.enabled}
                onChange={(e) => handleInputChange('maintenance', 'enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-400">
                Enable Maintenance Mode
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Maintenance Message
              </label>
              <textarea
                value={config.maintenance.message}
                onChange={(e) => handleInputChange('maintenance', 'message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Allowed IP Addresses
              </label>
              <input
                type="text"
                value={config.maintenance.allowedIPs.join(', ')}
                onChange={(e) => handleInputChange('maintenance', 'allowedIPs', e.target.value.split(',').map(ip => ip.trim()))}
                placeholder="127.0.0.1, 192.168.1.1"
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Scheduled Maintenance Time
              </label>
              <input
                type="datetime-local"
                value={config.maintenance.scheduledTime || ''}
                onChange={(e) => handleInputChange('maintenance', 'scheduledTime', e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;