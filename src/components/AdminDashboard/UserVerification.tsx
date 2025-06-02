import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  UserCheck, Clock, CheckCircle, XCircle, 
  AlertCircle, Search, Filter, Download,
  FileText, Shield, Globe, Music,
  Calendar, Clock as ClockIcon, User,
  CheckCircle2, FileCheck, FileX, FileClock,
  Download as DownloadIcon, Upload as UploadIcon,
  RefreshCw, Filter as FilterIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';

interface VerificationRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    type: string;
    url: string;
    name: string;
  }[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  userDetails: {
    country: string;
    instrument?: string;
    genre?: string;
    experience?: string;
    socialLinks?: {
      platform: string;
      url: string;
    }[];
  };
}

const PendingVerifications = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: 'all',
    instrument: 'all',
    genre: 'all'
  });
  const { user } = useAuth();
  const { adminPermissions } = useAdmin();

  useEffect(() => {
    fetchVerificationRequests();
  }, [filters]);

  const fetchVerificationRequests = async () => {
    try {
      const headers = new Headers({
        'Authorization': `Bearer ${user?.token}`,
        'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || ''
      });

      const response = await fetch('/api/admin/verifications/pending', {
        headers
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast.error('Failed to fetch verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const headers = new Headers({
        'Authorization': `Bearer ${user?.token}`,
        'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || ''
      });

      const response = await fetch(`/api/admin/verifications/${requestId}/${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Action failed');

      toast.success(`Verification ${action} successful`);
      fetchVerificationRequests();
    } catch (error) {
      console.error(`Error ${action} verification:`, error);
      toast.error(`Failed to ${action} verification`);
    }
  };

  const handleDocumentDownload = async (documentUrl: string, fileName: string) => {
    try {
      const headers = new Headers({
        'Authorization': `Bearer ${user?.token}`,
        'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || ''
      });

      const response = await fetch(documentUrl, { headers });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filters.country === 'all' || request.userDetails.country === filters.country;
    const matchesInstrument = filters.instrument === 'all' || request.userDetails.instrument === filters.instrument;
    const matchesGenre = filters.genre === 'all' || request.userDetails.genre === filters.genre;

    return matchesSearch && matchesCountry && matchesInstrument && matchesGenre;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Pending Verifications</h1>
        <div className="flex space-x-4">
          {adminPermissions?.includes('manage_verifications') && (
            <>
              <button
                onClick={() => {/* Implement bulk approve */}}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => {/* Implement bulk reject */}}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Bulk Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search verifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-indigo-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filters.country}
          onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
          className="px-4 py-2 bg-[#1a1a2e] border border-indigo-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Countries</option>
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="CA">Canada</option>
          {/* Add more countries */}
        </select>
        <select
          value={filters.instrument}
          onChange={(e) => setFilters(prev => ({ ...prev, instrument: e.target.value }))}
          className="px-4 py-2 bg-[#1a1a2e] border border-indigo-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Instruments</option>
          <option value="guitar">Guitar</option>
          <option value="piano">Piano</option>
          <option value="drums">Drums</option>
          {/* Add more instruments */}
        </select>
        <select
          value={filters.genre}
          onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
          className="px-4 py-2 bg-[#1a1a2e] border border-indigo-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Genres</option>
          <option value="rock">Rock</option>
          <option value="jazz">Jazz</option>
          <option value="classical">Classical</option>
          {/* Add more genres */}
        </select>
      </div>

      {/* Verification Requests Table */}
      <div className="bg-[#1a1a2e] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0a0a16]">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Details</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Documents</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Submitted</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-900/30">
            {filteredRequests.map((request) => (
              <tr key={request._id} className="hover:bg-[#0a0a16]">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{request.userName}</div>
                      <div className="text-sm text-gray-400">{request.userEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-400">
                      <Globe className="h-4 w-4 mr-2" />
                      {request.userDetails.country}
                    </div>
                    {request.userDetails.instrument && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Music className="h-4 w-4 mr-2" />
                        {request.userDetails.instrument}
                      </div>
                    )}
                    {request.userDetails.genre && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Music className="h-4 w-4 mr-2" />
                        {request.userDetails.genre}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {request.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <FileText className="h-4 w-4 mr-2" />
                          {doc.name}
                        </div>
                        <button
                          onClick={() => handleDocumentDownload(doc.url, doc.name)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {adminPermissions?.includes('manage_verifications') && (
                      <>
                        <button
                          onClick={() => handleVerificationAction(request._id, 'approve')}
                          className="p-1 text-gray-400 hover:text-green-400"
                          title="Approve"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              handleVerificationAction(request._id, 'reject', reason);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-400"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
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

const VerificationHistory = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Verification History</h1>
      {/* Verification history implementation */}
    </div>
  );
};

const UserVerification = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/pending" element={<PendingVerifications />} />
      <Route path="/history" element={<VerificationHistory />} />
      <Route path="*" element={<Navigate to="/admin/verification/pending" replace />} />
    </Routes>
  );
};

export default UserVerification; 