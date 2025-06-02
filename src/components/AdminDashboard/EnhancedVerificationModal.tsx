import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiUserCheck, FiUserX, FiAlertCircle,
  FiShield, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import tw from 'tailwind-styled-components';
import { User } from '../../types/user';

const ModalOverlay = tw.div`
  fixed inset-0 bg-black bg-opacity-50 z-50
  flex items-center justify-center p-4
`;

const ModalContent = tw(motion.div)`
  bg-white dark:bg-gray-800 rounded-xl shadow-xl
  w-full max-w-xl
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

const Form = tw.form`
  p-6 space-y-6
`;

const UserInfo = tw.div`
  flex items-center space-x-4 p-4
  bg-gray-50 dark:bg-gray-700 rounded-lg
`;

const UserAvatar = tw.div`
  w-12 h-12 rounded-full
  bg-blue-100 dark:bg-blue-900
  flex items-center justify-center
  text-blue-600 dark:text-blue-300
`;

const UserDetails = tw.div`
  flex-1
`;

const UserName = tw.div`
  font-medium text-gray-900 dark:text-white
`;

const UserEmail = tw.div`
  text-sm text-gray-500 dark:text-gray-400
`;

const VerificationSection = tw.div`
  space-y-4
`;

const Label = tw.label`
  block text-sm font-medium text-gray-700 dark:text-gray-300
`;

const TextArea = tw.textarea`
  w-full px-4 py-2 rounded-lg
  border border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-white
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  transition-colors duration-200
  resize-none
`;

const CheckboxGroup = tw.div`
  space-y-3
`;

const Checkbox = tw.div`
  flex items-center space-x-3
`;

const ErrorMessage = tw.div`
  text-sm text-red-600 dark:text-red-400
  flex items-center gap-1 mt-1
`;

const ButtonGroup = tw.div`
  flex justify-end gap-4 mt-6
  border-t border-gray-200 dark:border-gray-700
  pt-6
`;

const Button = tw.button`
  px-6 py-2 rounded-lg font-medium
  flex items-center gap-2
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
  ${(p: { variant?: 'success' | 'danger' | 'secondary' }) => {
    switch (p.variant) {
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
    }
  }}
`;

interface EnhancedVerificationModalProps {
  isOpen: boolean;
  user: User | null;
  action: 'verify' | 'reject';
  onClose: () => void;
  onVerify: (userId: string, verificationData?: any) => Promise<void>;
  onReject: (userId: string, rejectionReason?: string) => Promise<void>;
}

export const EnhancedVerificationModal: React.FC<EnhancedVerificationModalProps> = ({
  isOpen,
  user,
  action,
  onClose,
  onVerify,
  onReject
}) => {
  const [reason, setReason] = useState('');
  const [requirements, setRequirements] = useState({
    identityVerified: false,
    documentsChecked: false,
    termsAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (action === 'verify') {
        if (!Object.values(requirements).every(Boolean)) {
          setError('Please complete all verification requirements');
          return;
        }
        await onVerify(user.id, { requirements });
      } else {
        if (!reason.trim()) {
          setError('Please provide a reason for rejection');
          return;
        }
        await onReject(user.id, reason);
      }

      onClose();
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!user) return null;

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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {action === 'verify' ? (
                  <>
                    <FiUserCheck className="text-green-500" size={24} />
                    Verify User
                  </>
                ) : (
                  <>
                    <FiUserX className="text-red-500" size={24} />
                    Reject User
                  </>
                )}
              </h2>
              <CloseButton onClick={onClose}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <UserInfo>
                <UserAvatar>
                  <FiShield size={24} />
                </UserAvatar>
                <UserDetails>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserDetails>
              </UserInfo>

              <VerificationSection>
                {action === 'verify' ? (
                  <CheckboxGroup>
                    <Checkbox>
                      <input
                        type="checkbox"
                        checked={requirements.identityVerified}
                        onChange={(e) =>
                          setRequirements(prev => ({
                            ...prev,
                            identityVerified: e.target.checked
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Identity verification completed
                      </span>
                    </Checkbox>
                    <Checkbox>
                      <input
                        type="checkbox"
                        checked={requirements.documentsChecked}
                        onChange={(e) =>
                          setRequirements(prev => ({
                            ...prev,
                            documentsChecked: e.target.checked
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Required documents verified
                      </span>
                    </Checkbox>
                    <Checkbox>
                      <input
                        type="checkbox"
                        checked={requirements.termsAccepted}
                        onChange={(e) =>
                          setRequirements(prev => ({
                            ...prev,
                            termsAccepted: e.target.checked
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Terms and conditions accepted
                      </span>
                    </Checkbox>
                  </CheckboxGroup>
                ) : (
                  <>
                    <Label htmlFor="reason">Rejection Reason</Label>
                    <TextArea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      placeholder="Please provide a detailed reason for rejection..."
                    />
                  </>
                )}

                {error && (
                  <ErrorMessage>
                    <FiAlertCircle size={16} />
                    {error}
                  </ErrorMessage>
                )}
              </VerificationSection>

              <ButtonGroup>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={action === 'verify' ? 'success' : 'danger'}
                  disabled={isSubmitting}
                >
                  {action === 'verify' ? (
                    <>
                      <FiCheckCircle size={18} />
                      Verify User
                    </>
                  ) : (
                    <>
                      <FiXCircle size={18} />
                      Reject User
                    </>
                  )}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default EnhancedVerificationModal; 