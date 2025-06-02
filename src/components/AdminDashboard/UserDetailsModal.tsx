import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isValid } from 'date-fns';
import {
  FiX, FiUser, FiMail, FiPhone, FiMapPin,
  FiCalendar, FiClock, FiShield, FiActivity
} from 'react-icons/fi';
import tw from 'tailwind-styled-components';
import { User } from '../../types/user';

const ModalOverlay = tw.div`
  fixed inset-0 bg-black bg-opacity-50 z-50
  flex items-center justify-center p-4
`;

const ModalContent = tw(motion.div)`
  bg-white dark:bg-gray-800 rounded-xl shadow-xl
  w-full max-w-2xl max-h-[90vh] overflow-y-auto
`;

const ModalHeader = tw.div`
  flex items-center justify-between p-6
  border-b border-gray-200 dark:border-gray-700
`;

const CloseButton = tw.button`
  p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
  text-gray-500 dark:text-gray-400
  transition-colors duration-200
`;

const DetailSection = tw.div`
  p-6 space-y-6
`;

const DetailGroup = tw.div`
  grid grid-cols-1 md:grid-cols-2 gap-6
`;

const DetailItem = tw.div`
  flex items-start space-x-3
`;

const DetailIcon = tw.div`
  flex-shrink-0 w-10 h-10 rounded-full
  bg-blue-100 dark:bg-blue-900
  text-blue-600 dark:text-blue-300
  flex items-center justify-center
`;

const DetailContent = tw.div`
  flex-1
`;

const DetailLabel = tw.div`
  text-sm font-medium text-gray-500 dark:text-gray-400
`;

const DetailValue = tw.div`
  text-base font-medium text-gray-900 dark:text-white
`;

const ActivitySection = tw.div`
  border-t border-gray-200 dark:border-gray-700 p-6
`;

const ActivityHeader = tw.h3`
  text-lg font-medium text-gray-900 dark:text-white mb-4
`;

const ActivityList = tw.div`
  space-y-4
`;

const ActivityItem = tw.div`
  flex items-center space-x-3 text-sm
  text-gray-600 dark:text-gray-300
`;

interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

const formatDate = (dateString: string | undefined, formatString: string): string => {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  return isValid(date) ? format(date, formatString) : 'Invalid date';
};

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  user,
  onClose
}) => {
  if (!user) return null;

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          onClick={onClose}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ModalHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Details
              </h2>
              <CloseButton onClick={onClose}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <DetailSection>
              <DetailGroup>
                <DetailItem>
                  <DetailIcon>
                    <FiUser size={20} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Full Name</DetailLabel>
                    <DetailValue>{user.name}</DetailValue>
                  </DetailContent>
                </DetailItem>

                <DetailItem>
                  <DetailIcon>
                    <FiMail size={20} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Email Address</DetailLabel>
                    <DetailValue>{user.email}</DetailValue>
                  </DetailContent>
                </DetailItem>

                <DetailItem>
                  <DetailIcon>
                    <FiPhone size={20} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Phone Number</DetailLabel>
                    <DetailValue>{user.phone || 'Not provided'}</DetailValue>
                  </DetailContent>
                </DetailItem>

                <DetailItem>
                  <DetailIcon>
                    <FiMapPin size={20} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Location</DetailLabel>
                    <DetailValue>{user.location || 'Not provided'}</DetailValue>
                  </DetailContent>
                </DetailItem>

                <DetailItem>
                  <DetailIcon>
                    <FiCalendar size={20} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Joined Date</DetailLabel>
                    <DetailValue>
                      {formatDate(user.createdAt, 'MMM d, yyyy')}
                    </DetailValue>
                  </DetailContent>
                </DetailItem>

                <DetailItem>
                  <DetailIcon>
                    <FiClock size={20} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Last Active</DetailLabel>
                    <DetailValue>
                      {formatDate(user.lastActive, 'MMM d, yyyy HH:mm')}
                    </DetailValue>
                  </DetailContent>
                </DetailItem>

                <DetailItem>
                  <DetailIcon>
                    <FiShield size={20} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Role & Status</DetailLabel>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </DetailContent>
                </DetailItem>
              </DetailGroup>
            </DetailSection>

            <ActivitySection>
              <ActivityHeader>Recent Activity</ActivityHeader>
              <ActivityList>
                {user.recentActivity?.map((activity, index) => (
                  <ActivityItem key={index}>
                    <FiActivity size={16} />
                    <span>{activity.description}</span>
                    <span className="text-gray-400">
                      {formatDate(activity.timestamp, 'MMM d, HH:mm')}
                    </span>
                  </ActivityItem>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400">
                    No recent activity
                  </p>
                )}
              </ActivityList>
            </ActivitySection>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default UserDetailsModal;