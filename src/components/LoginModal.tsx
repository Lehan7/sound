import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { X, Eye, EyeOff, Mail, Lock, AlertCircle, Phone, Music, Globe, User, Mic, Plus, Loader2, Check, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import Select, { components, OptionProps, SingleValueProps } from 'react-select';
import countryList from 'react-select-country-list';
import * as flags from 'country-flag-icons/react/3x2';
import 'react-phone-input-2/lib/style.css';
import type { CountryOption, CountryGroupBase } from '../types/country';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { 
  RegistrationFormData, 
  INSTRUMENT_TYPES, 
  SINGING_TYPES, 
  MUSIC_CULTURES, 
  INTERESTS 
} from '../types/user';
import LoadingSpinner from './common/LoadingSpinner';
import axios from '../utils/axios';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GoogleUserData {
  _id: string;
  name: string;
  email: string;
  country?: string;
  instrument?: string;
  role: string;
  token: string;
  refreshToken?: string;
  profileImage?: string;
  isActive?: boolean;
  isEmailVerified: boolean;
  verificationStatus: string;
}

interface RegistrationStep {
  title: string;
  description: string;
  fields: React.ReactNode;
}

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled: boolean;
  id: string;
  text?: string;
}

interface GoogleAuthSuccessEvent {
  type: 'GOOGLE_AUTH_SUCCESS';
  user: GoogleUserData;
  state: string;
}

interface GoogleAuthErrorEvent {
  type: 'GOOGLE_AUTH_ERROR';
  error: string;
}

type GoogleAuthEvent = GoogleAuthSuccessEvent | GoogleAuthErrorEvent;

const singerTypes = [
  'Lead Vocalist',
  'Backing Vocalist',
  'Choir Singer',
  'Opera Singer',
  'Rock Vocalist',
  'Jazz Singer',
  'Gospel Singer',
  'Pop Singer',
  'R&B Singer',
  'Classical Singer',
  'Musical Theater',
  'Rap/Hip-Hop Artist',
  'Folk Singer',
  'Country Singer',
  'Blues Singer',
  'Metal Vocalist',
  'World Music Vocalist',
  'Other'
];

const instruments = [
  { 
    category: 'String Instruments',
    items: [
      'Acoustic Guitar',
      'Electric Guitar',
      'Bass Guitar',
      'Violin',
      'Viola',
      'Cello',
      'Double Bass',
      'Harp',
      'Ukulele',
      'Mandolin',
      'Banjo',
      'Sitar',
      'Other String'
    ]
  },
  {
    category: 'Keyboard Instruments',
    items: [
      'Piano',
      'Digital Piano',
      'Synthesizer',
      'Organ',
      'Accordion',
      'MIDI Controller',
      'Melodica',
      'Keytar',
      'Other Keyboard'
    ]
  },
  {
    category: 'Wind Instruments',
    items: [
      'Flute',
      'Clarinet',
      'Saxophone',
      'Trumpet',
      'Trombone',
      'French Horn',
      'Oboe',
      'Bassoon',
      'Piccolo',
      'Pan Flute',
      'Other Wind'
    ]
  },
  {
    category: 'Percussion',
    items: [
      'Drum Kit',
      'Cajon',
      'Congas',
      'Bongos',
      'Djembe',
      'Xylophone',
      'Marimba',
      'Vibraphone',
      'Timpani',
      'Cymbals',
      'Tambourine',
      'Other Percussion'
    ]
  },
  {
    category: 'Electronic & Digital',
    items: [
      'DJ Controller',
      'Drum Machine',
      'Sampler',
      'Groovebox',
      'Digital Audio Workstation',
      'Electronic Wind Instrument',
      'Electronic Drum Kit',
      'MIDI Controller',
      'Other Electronic'
    ]
  },
  {
    category: 'Traditional & World',
    items: [
      'Sitar',
      'Tabla',
      'Didgeridoo',
      'Shamisen',
      'Koto',
      'Oud',
      'Kalimba',
      'Steel Pan',
      'Bagpipes',
      'Other Traditional'
    ]
  },
  {
    category: 'Audio Engineering',
    items: [
      'Recording Engineer',
      'Mix Engineer',
      'Mastering Engineer',
      'Live Sound Engineer',
      'Studio Producer',
      'Sound Designer',
      'Audio Post-Production',
      'Broadcast Engineer',
      'Studio Technician',
      'Acoustics Engineer',
      'System Engineer',
      'Other Audio Engineering'
    ]
  },
  {
    category: 'Music Production',
    items: [
      'Music Producer',
      'Beat Maker',
      'Composer',
      'Arranger',
      'Sound Designer',
      'Film Scoring',
      'Game Audio',
      'Orchestrator',
      'Music Director',
      'Other Production'
    ]
  }
];

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login, register, requestPasswordReset, error: authError, clearError, handleAuthCallback } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    country: '',
    instrumentType: '',
    instrumentDetails: '',
    singingType: '',
    musicCulture: '',
    aboutMe: '',
    interests: [],
    experience: '',
    goals: '',
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});

  // Move countryOptions inside the component
  const countryOptions = useMemo(() => {
    const countries = countryList().getData();
    return countries.map(country => ({
      ...country,
      search: country.label.toLowerCase()
    }));
  }, []);

  // Custom option component
  const CountryOptionComponent = ({ innerProps, label, data }: OptionProps<CountryOption, false, CountryGroupBase>) => {
    const Flag = (flags as any)[data.value];
    return (
      <div 
        {...innerProps}
        className="flex items-center px-3 py-2 hover:bg-indigo-500/10 cursor-pointer transition-all duration-200 ease-in-out rounded-md mx-1"
      >
        {Flag && (
          <div className="mr-2 w-5 h-4 rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
            <Flag title={label} className="w-full h-full object-cover" />
          </div>
        )}
        <span className="text-white text-sm font-medium whitespace-normal flex-1">{label}</span>
      </div>
    );
  };

  // Custom value container
  const CountryValueComponent = ({ children, data }: SingleValueProps<CountryOption, false, CountryGroupBase>) => {
    const Flag = data ? (flags as any)[data.value] : null;
    return (
      <div className="flex items-center pl-8">
        {Flag && (
          <div className="absolute left-8 w-4 h-3 rounded-sm overflow-hidden shadow-sm">
            <Flag title={data.label} className="w-full h-full object-cover" />
          </div>
        )}
        <span className="ml-6 text-sm">{children}</span>
      </div>
    );
  };

  // Custom no options message
  const NoOptionsMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <div className="flex items-center justify-center text-gray-400 text-sm py-2">
        <span>No country found</span>
      </div>
    </components.NoOptionsMessage>
  );

  // Custom loading message
  const LoadingMessage = (props: any) => (
    <components.LoadingMessage {...props}>
      <div className="flex items-center justify-center text-gray-400 text-sm py-2">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <span>Loading countries...</span>
      </div>
    </components.LoadingMessage>
  );

  // Update phone input styles
  const phoneInputStyles = (isErrored: boolean) => ({
    container: "w-full relative", // Added relative for absolute positioning of country dropdown
    input: `w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 pl-[5rem] pr-4 ${isErrored ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/50'}`, // Increased left padding for country button
    button: `absolute left-0 top-0 bottom-0 flex items-center px-4 bg-gray-700 border-r border-gray-600 rounded-l-lg text-white hover:bg-gray-600 focus:outline-none focus:ring-2 transition-all duration-200 ${isErrored ? 'border-red-500' : 'border-gray-700'}`, // Positioned left, aligned vertically, adjusted colors
    dropdown: "bg-gray-800 border border-gray-700 text-white rounded-lg shadow-lg z-70", // Higher z-index
    search: "bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent", // Added focus styles
    // Add style for selected country flag/dial code in the button
    selectedFlag: "flex items-center",
    countryName: "ml-2 mr-1 text-sm text-gray-300", // Style for country name in dropdown
    dialCode: "text-gray-400 text-sm", // Style for dial code in dropdown
  });

  // Add custom styles for react-select
  const customSelectStyles = {
    control: (base: any, state: any) => {
      // Access isInvalid from selectProps, defaulting to checking validationErrors
      const isErrored = validationErrors.country; // Directly use validationErrors
      const baseStyles = {
        ...base,
        backgroundColor: '#1f2937',
        borderColor: isErrored ? '#ef4444' : (state.isFocused ? '#6366f1' : '#374151'),
        boxShadow: isErrored ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : (state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none'),
        '&:hover': {
          borderColor: isErrored ? '#ef4444' : (state.isFocused ? '#6366f1' : '#4b5563') // Darker hover border when not focused
        },
        minHeight: '48px', // Ensure minimum height
        borderRadius: '0.5rem', // Rounded corners consistent with other inputs
        padding: '0 12px', // Horizontal padding
        fontSize: '1rem', // Match font size
        lineHeight: '1.5rem', // Match line height
      };
      return baseStyles;
    },
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '0.5rem', // Rounded corners for menu
      overflow: 'hidden', // Hide overflow for rounded corners
      zIndex: 60, // Ensure menu is above other elements
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#374151' : state.isSelected ? '#4f46e5' : '#1f2937',
      color: state.isSelected ? '#fff' : '#ccc',
      cursor: 'pointer',
      '&:active': {
          backgroundColor: '#4338ca',
      },
      padding: '12px 15px', // Add padding for better touch targets
      fontSize: '0.9rem', // Slightly smaller font for options
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#fff', // Ensure selected value is white
    }),
    input: (base: any) => ({
      ...base,
      color: '#fff', // Ensure typing text is white
      padding: '0', // Remove default input padding
      margin: '0', // Remove default input margin
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af',
    }),
    indicatorSeparator: (base: any) => ({
      ...base,
      backgroundColor: '#374151', // Darken separator
    }),
    dropdownIndicator: (base: any, state: any) => ({
      ...base,
      color: state.isFocused || state.selectProps.menuIsOpen ? '#6366f1' : '#9ca3af', // Highlight arrow when focused or menu open
      '&:hover': {
        color: '#6366f1',
      }
    }),
    clearIndicator: (base: any, state: any) => ({
      ...base,
      color: state.isFocused ? '#ef4444' : '#9ca3af', // Darken clear icon
      '&:hover': {
        color: '#ef4444',
      }
    }),
    menuList: (base: any) => ({
      ...base,
      padding: '0', // Remove default padding from menu list
      // Styles for the scrollbar if needed (can be tricky with react-select)
      // Let's rely on default system scrollbars first
    }),
  };

  // Enhanced input styles
  const inputStyles = (fieldName: keyof RegistrationFormData) => {
    const baseStyles = "w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";
    const errorBorder = validationErrors[fieldName] ? "border-red-500" : "border-gray-700";
    const focusBorder = validationErrors[fieldName] ? "focus:border-red-500 focus:ring-red-500/50" : "focus:border-indigo-500 focus:ring-indigo-500/50";
    return `${baseStyles} ${errorBorder} ${focusBorder}`;
  };

  const selectStyles = (fieldName: keyof RegistrationFormData) => {
    const baseStyles = "w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";
    const errorBorder = validationErrors[fieldName] ? "border-red-500" : "border-gray-700";
     const focusBorder = validationErrors[fieldName] ? "focus:border-red-500 focus:ring-red-500/50" : "focus:border-indigo-500 focus:ring-indigo-500/50";
    return `${baseStyles} ${errorBorder} ${focusBorder}`;
  };

  const errorStyles = "mt-1 text-sm text-red-500";

  // Handle input changes for login form
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  // Handle input changes for registration form
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle interest checkbox changes
  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Handle phone number changes
  const handlePhoneChange = (value: string) => {
    if (!value) {
      setValidationErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }));
    } else if (value.length < 10) { // Basic length check, more robust validation might be needed
      setValidationErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number' }));
    } else {
      setValidationErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
    handleRegisterChange({ target: { name: 'phoneNumber', value } } as any); // Update form data
  };

  // Handle country selection changes
  const handleCountryChange = (option: CountryOption | null) => {
    if (!option) {
      setValidationErrors(prev => ({ ...prev, country: 'Country is required' }));
    } else {
      setValidationErrors(prev => ({ ...prev, country: '' }));
    }
    handleRegisterChange({ target: { name: 'country', value: option?.value } } as any); // Update form data
  };

  // Validation function for each step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.fullName.trim()) {
          errors.fullName = 'Full name is required';
        }
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Invalid email format';
        }
        break;

      case 1: // Password
        if (!formData.password) {
          errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2: // Contact Information
        if (!formData.phoneNumber) {
          errors.phoneNumber = 'Phone number is required';
        }
        if (!formData.country) {
          errors.country = 'Country is required';
        }
        break;

      case 3: // Musical Background
        if (!formData.instrumentType) {
          errors.instrumentType = 'Primary instrument is required';
        }
        break;

      case 4: // Musical Interests
        if (formData.interests.length === 0) {
          errors.interests = 'Please select at least one interest';
        }
        break;

      case 5: // Final Review
        if (!formData.termsAccepted) {
          errors.termsAccepted = 'You must accept the terms and conditions';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced handleNextStep with validation
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setIsTransitioning(true);
      setStepValidation(prev => ({ ...prev, [currentStep]: true }));
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  // Enhanced handlePrevStep
  const handlePrevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  // Enhanced handleRegisterSubmit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateStep(currentStep)) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Creating your account...', { id: 'register' });

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!formData.termsAccepted) {
        setError('You must accept the terms and conditions');
        return;
      }

      await register(formData);
      toast.success('Registration successful! Welcome to SoundAlchemy! 🎵', { id: 'register' });
      onClose();
      navigate('/profile');
    } catch (error: any) {
      setError(error.message);
      toast.error('Registration failed. Please try again.', { id: 'register' });
    } finally {
      setLoading(false);
    }
  };

  // Update the registration steps with enhanced styling
  const registrationSteps: RegistrationStep[] = [
    {
      title: "Welcome to SoundAlchemy",
      description: "Let's start with your basic information",
      fields: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleRegisterChange}
                required
                className={inputStyles('fullName')}
                placeholder="Enter your full name"
              />
              {validationErrors.fullName && (
                <p className={errorStyles}>{validationErrors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleRegisterChange}
                required
                className={inputStyles('email')}
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <p className={errorStyles}>{validationErrors.email}</p>
              )}
            </div>
          </div>
        </motion.div>
      )
    },
    {
      title: "Create Your Password",
      description: "Choose a strong password to secure your account",
      fields: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleRegisterChange}
                  required
                  minLength={8}
                  className={inputStyles('password')}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors.password && (
                <p className={errorStyles}>{validationErrors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  minLength={8}
                  className={inputStyles('confirmPassword')}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className={errorStyles}>{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        </motion.div>
      )
    },
    {
      title: "Contact Information",
      description: "How can we reach you?",
      fields: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <PhoneInput
                country={'us'}
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                inputClass={phoneInputStyles(!!validationErrors.phoneNumber).input}
                containerClass={phoneInputStyles(!!validationErrors.phoneNumber).container}
                buttonClass={phoneInputStyles(!!validationErrors.phoneNumber).button}
                dropdownClass={phoneInputStyles(!!validationErrors.phoneNumber).dropdown}
                searchClass={phoneInputStyles(!!validationErrors.phoneNumber).search}
                enableSearch={true}
                searchPlaceholder="Search country..."
                inputProps={{
                  required: true,
                  className: "w-full", // Ensure input takes full width within its container
                }}
              />
              {validationErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
              <Select<CountryOption, false, CountryGroupBase>
                options={countryOptions}
                value={countryOptions.find(option => option.value === formData.country) || null}
                onChange={handleCountryChange}
                components={{
                  Option: CountryOptionComponent,
                  SingleValue: CountryValueComponent,
                  NoOptionsMessage,
                  LoadingMessage
                }}
                styles={customSelectStyles}
                className="w-full"
                classNamePrefix="select"
                placeholder="Select your country"
                isSearchable={true}
                isClearable={true}
                // Pass validation state to styles for dynamic border color
              />
              {validationErrors.country && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.country}</p>
              )}
            </div>
          </div>
        </motion.div>
      )
    },
    {
      title: "Musical Background",
      description: "Tell us about your musical journey",
      fields: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Instrument</label>
              <select
                name="instrumentType"
                value={formData.instrumentType}
                onChange={handleRegisterChange}
                required
                className={selectStyles('instrumentType')}
              >
                <option value="">Select an instrument</option>
                {INSTRUMENT_TYPES.map(instrument => (
                  <option key={instrument.value} value={instrument.value}>
                    {instrument.label}
                  </option>
                ))}
              </select>
              {validationErrors.instrumentType && (
                <p className={errorStyles}>{validationErrors.instrumentType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Singing Type (if applicable)</label>
              <select
                name="singingType"
                value={formData.singingType}
                onChange={handleRegisterChange}
                className={selectStyles('singingType')}
              >
                <option value="">Select singing type</option>
                {SINGING_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )
    },
    {
      title: "Musical Interests",
      description: "What are you passionate about?",
      fields: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {INTERESTS.map(interest => (
              <motion.label
                key={interest.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest.value)}
                  onChange={() => handleInterestChange(interest.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{interest.label}</span>
              </motion.label>
            ))}
          </div>
        </motion.div>
      )
    },
    {
      title: "Almost Done!",
      description: "Review your information and accept the terms",
      fields: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h4 className="text-lg font-medium text-white mb-4">Your Information</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-sm font-medium text-white">{formData.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-sm font-medium text-white">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Instrument</p>
                <p className="text-sm font-medium text-white">{formData.instrumentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Country</p>
                <p className="text-sm font-medium text-white">
                  {countryOptions.find(option => option.value === formData.country)?.label || 'Not selected'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleRegisterChange}
                required
                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border rounded bg-gray-800 ${validationErrors.termsAccepted ? 'border-red-500' : 'border-gray-600'}`}
              />
            </div>
            <div className="ml-3">
              <label className="text-sm text-gray-300">
                I agree to the{' '}
                <a href="/terms" className="text-indigo-400 hover:text-indigo-300">
                  Terms and Conditions
                </a>
              </label>
            </div>
          </div>
          {validationErrors.termsAccepted && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.termsAccepted}</p>
          )}
        </motion.div>
      )
    }
  ];

  // Google Sign In Button Component
  const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onClick, disabled, id, text = "Continue with Google" }) => (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 py-3 px-6 rounded-xl font-medium text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden shadow-md"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      id={id}
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      <span className="relative z-10">{text}</span>
    </motion.button>
  );

  // Check database connection status
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await axios.get('/api/health');
        if (response.data.status === 'ok') {
          setDbStatus('connected');
          toast.success('Database connected successfully', {
            icon: '🟢',
            duration: 3000,
          });
        } else {
          setDbStatus('disconnected');
          toast.error('Database connection failed', {
            icon: '🔴',
            duration: 3000,
          });
        }
      } catch (error) {
        setDbStatus('disconnected');
        toast.error('Database connection failed', {
          icon: '🔴',
          duration: 3000,
        });
      }
    };

    checkDbStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkDbStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await login(loginData.email, loginData.password);
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken && credential.idToken) {
        await handleAuthCallback(credential.accessToken, credential.idToken);
      } else {
        throw new Error('Failed to get Google credentials');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Database Status Indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                dbStatus === 'connected' 
                  ? 'bg-green-500/20 text-green-400' 
                  : dbStatus === 'disconnected'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                <Database className="w-3 h-3" />
                <span>
                  {dbStatus === 'connected' 
                    ? 'DB Connected' 
                    : dbStatus === 'disconnected'
                    ? 'DB Disconnected'
                    : 'Checking DB...'}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isRegistering ? 'Create Account' : 'Login'}
                </h2>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {!isRegistering ? (
                // Login Form
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Remember me</label>
                    </div>

                    <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? <LoadingSpinner size="small" /> : 'Login'}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Don't have an account? Register here
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-8">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <motion.div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / registrationSteps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Step Header */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {registrationSteps[currentStep].title}
                    </h2>
                    <p className="text-gray-400">
                      {registrationSteps[currentStep].description}
                    </p>
                  </div>

                  {/* Step Content */}
                  <AnimatePresence mode="wait">
                    {!isTransitioning && registrationSteps[currentStep].fields}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                      >
                        Back
                      </button>
                    )}
                    {currentStep < registrationSteps.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="ml-auto px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="ml-auto px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="small" />
                            <span className="ml-2">Creating Account...</span>
                          </div>
                        ) : (
                          'Complete Registration'
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;