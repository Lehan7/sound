import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiUser, FiMail, FiPhone, FiMapPin,
  FiSave, FiShield, FiAlertCircle
} from 'react-icons/fi';
import tw from 'tailwind-styled-components';
import { User } from '../../types/user';
import { RoleSelector } from './RoleSelector';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ModalOverlay = tw.div`
  fixed inset-0 bg-black bg-opacity-50 z-50
  flex items-center justify-center p-4
`;

const ModalContent = tw(motion.div)`
  bg-white dark:bg-gray-800 rounded-xl shadow-xl
  w-full max-w-2xl
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

const FormGroup = tw.div`
  grid grid-cols-1 md:grid-cols-2 gap-6
`;

const InputGroup = tw.div`
  space-y-2
`;

const Label = tw.label`
  block text-sm font-medium text-gray-700 dark:text-gray-300
`;

const Input = tw.input`
  w-full px-4 py-2 rounded-lg
  border border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-white
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  transition-colors duration-200
`;

const Select = tw.select`
  w-full px-4 py-2 rounded-lg
  border border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-white
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  transition-colors duration-200
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
  ${(p: { variant?: 'primary' | 'secondary' }) =>
    p.variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
  }
`;

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, userData: Partial<User>) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
    location: user?.location || '',
    verificationStatus: user?.verificationStatus || 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Role validation
    if (!['user', 'admin', 'moderator'].includes(formData.role)) {
      newErrors.role = 'Invalid role selected';
    }

    // Status validation
    if (!['active', 'inactive', 'suspended'].includes(formData.status)) {
      newErrors.status = 'Invalid status selected';
    }

    // Verification status validation
    if (!['verified', 'pending', 'rejected'].includes(formData.verificationStatus)) {
      newErrors.verificationStatus = 'Invalid verification status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      location: true,
      verificationStatus: true
    });

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!user?._id) {
      toast.error('Invalid user data');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(user._id, formData);
      toast.success('User updated successfully');
      onClose();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateForm();
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit User
              </h2>
              <CloseButton onClick={onClose}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <InputGroup>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter full name"
                    className={touched.name && errors.name ? 'border-red-500' : ''}
                  />
                  {touched.name && errors.name && (
                    <ErrorMessage>
                      <FiAlertCircle size={16} />
                      {errors.name}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter email address"
                    className={touched.email && errors.email ? 'border-red-500' : ''}
                  />
                  {touched.email && errors.email && (
                    <ErrorMessage>
                      <FiAlertCircle size={16} />
                      {errors.email}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter phone number"
                    className={touched.phone && errors.phone ? 'border-red-500' : ''}
                  />
                  {touched.phone && errors.phone && (
                    <ErrorMessage>
                      <FiAlertCircle size={16} />
                      {errors.phone}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.role && errors.role ? 'border-red-500' : ''}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </Select>
                  {touched.role && errors.role && (
                    <ErrorMessage>
                      <FiAlertCircle size={16} />
                      {errors.role}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.status && errors.status ? 'border-red-500' : ''}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </Select>
                  {touched.status && errors.status && (
                    <ErrorMessage>
                      <FiAlertCircle size={16} />
                      {errors.status}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="verificationStatus">Verification Status</Label>
                  <Select
                    id="verificationStatus"
                    name="verificationStatus"
                    value={formData.verificationStatus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.verificationStatus && errors.verificationStatus ? 'border-red-500' : ''}
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                  {touched.verificationStatus && errors.verificationStatus && (
                    <ErrorMessage>
                      <FiAlertCircle size={16} />
                      {errors.verificationStatus}
                    </ErrorMessage>
                  )}
                </InputGroup>
              </FormGroup>

              {errors.submit && (
                <ErrorMessage>
                  <FiAlertCircle size={16} />
                  {errors.submit}
                </ErrorMessage>
              )}

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
                  variant="primary"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={18} />
                      Save Changes
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

export default EditUserModal; 