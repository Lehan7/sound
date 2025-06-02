import React from 'react';
import { FiShield, FiUser, FiUsers, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import tw from 'tailwind-styled-components';

const RoleContainer = tw.div`
  relative w-full
`;

const RoleSelect = tw.select`
  w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  appearance-none cursor-pointer
  ${(p: { size?: 'small' | 'normal' }) => 
    p.size === 'small' ? 'text-sm' : 'text-base'
  }
`;

const RoleIcon = tw.div`
  absolute right-3 top-1/2 transform -translate-y-1/2
  pointer-events-none text-gray-400 dark:text-gray-500
`;

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'normal';
  className?: string;
  disabled?: boolean;
}

const roleOptions = [
  { value: 'user', label: 'User', icon: FiUser },
  { value: 'admin', label: 'Admin', icon: FiShield },
  { value: 'moderator', label: 'Moderator', icon: FiUsers },
  { value: 'premium', label: 'Premium', icon: FiStar }
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  size = 'normal',
  className = '',
  disabled = false
}) => {
  const IconComponent = roleOptions.find(option => option.value === value)?.icon || FiUser;

  return (
    <RoleContainer className={className}>
      <RoleSelect
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={size}
        disabled={disabled}
      >
        <option value="">Select Role</option>
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </RoleSelect>
      <RoleIcon>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <IconComponent size={size === 'small' ? 16 : 20} />
        </motion.div>
      </RoleIcon>
    </RoleContainer>
  );
};

export default RoleSelector; 