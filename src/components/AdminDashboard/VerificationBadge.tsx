import React from 'react';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

interface VerificationBadgeProps {
  status: 'verified' | 'pending' | 'rejected';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status }) => {
  const getBadgeStyles = () => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'verified':
        return <FiCheck className="mr-1" />;
      case 'pending':
        return <FiClock className="mr-1" />;
      case 'rejected':
        return <FiX className="mr-1" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyles()}`}>
      {getIcon()}
      {getStatusText()}
    </span>
  );
};

export default VerificationBadge; 