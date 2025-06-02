import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserManagementContent from './UserManagement';

const RoleManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Role Management</h1>
      {/* Role management implementation */}
    </div>
  );
};

const Permissions = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Permissions</h1>
      {/* Permissions implementation */}
    </div>
  );
};

const UserManagementRoutes = () => {
  return (
    <Routes>
      <Route path="/list" element={<UserManagementContent />} />
      <Route path="/roles" element={<RoleManagement />} />
      <Route path="/permissions" element={<Permissions />} />
      <Route path="*" element={<Navigate to="/admin/users/list" replace />} />
    </Routes>
  );
};

export default UserManagementRoutes; 