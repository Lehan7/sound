import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, AuthError, signInWithEmailAndPassword, deleteUser, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { auth, db, storage, userProfilePhotosRef, getStoragePath } from '../config/firebase';
import { sendEmail, getNewMusicianEmailTemplate } from '../config/emailService';
import { generateWelcomeMessage } from '../config/aiService';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Music, Check, X, Camera, Loader } from 'lucide-react';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import countryList from 'react-select-country-list';
import { validateImage } from '../utils/imageValidation';
import { compressImage } from '../utils/imageCompression';
import { components } from 'react-select';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaGlobe, FaMusic, FaMicrophone, FaPalette, FaSpinner, FaLightbulb, FaRobot } from 'react-icons/fa';

// Form step interface
interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  country: string;
  instrumentType: string;
  singingType: string;
  musicCulture: string;
  bio: string;
  profileImage: File | null;
  profileImagePath: string;
  talentDescription: string;
}

// Enhanced dropdown data structures
const countries = [
  { value: 'us', label: 'United States', icon: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', icon: '🇬🇧' },
  { value: 'ca', label: 'Canada', icon: '🇨🇦' },
  { value: 'au', label: 'Australia', icon: '🇦🇺' },
  { value: 'fr', label: 'France', icon: '🇫🇷' },
  { value: 'de', label: 'Germany', icon: '🇩🇪' },
  { value: 'jp', label: 'Japan', icon: '🇯🇵' },
  { value: 'in', label: 'India', icon: '🇮🇳' },
  { value: 'br', label: 'Brazil', icon: '🇧🇷' },
  { value: 'ng', label: 'Nigeria', icon: '🇳🇬' },
  // Add more countries as needed
].sort((a, b) => a.label.localeCompare(b.label));

const instruments = [
  {
    label: 'String Instruments',
    options: [
      { value: 'guitar', label: 'Guitar', icon: '🎸' },
      { value: 'violin', label: 'Violin', icon: '🎻' },
      { value: 'cello', label: 'Cello', icon: '🎻' },
      { value: 'bass', label: 'Bass', icon: '🎸' },
      { value: 'harp', label: 'Harp', icon: '🎼' },
    ]
  },
  {
    label: 'Percussion',
    options: [
      { value: 'drums', label: 'Drums', icon: '🥁' },
      { value: 'piano', label: 'Piano', icon: '🎹' },
      { value: 'xylophone', label: 'Xylophone', icon: '🎵' },
    ]
  },
  {
    label: 'Wind Instruments',
    options: [
      { value: 'saxophone', label: 'Saxophone', icon: '🎷' },
      { value: 'trumpet', label: 'Trumpet', icon: '🎺' },
      { value: 'flute', label: 'Flute', icon: '🎵' },
      { value: 'clarinet', label: 'Clarinet', icon: '🎵' },
    ]
  },
  {
    label: 'Other',
    options: [
      { value: 'other', label: 'Other Instrument', icon: '🎵' },
    ]
  }
];

const singingTypes = [
  {
    label: 'Vocal Styles',
    options: [
      { value: 'solo', label: 'Solo Vocalist', icon: '🎤' },
      { value: 'choir', label: 'Choir', icon: '👥' },
      { value: 'opera', label: 'Opera', icon: '🎭' },
    ]
  },
  {
    label: 'Genres',
    options: [
      { value: 'rap', label: 'Rap/Hip-Hop', icon: '🎵' },
      { value: 'folk', label: 'Folk', icon: '🎵' },
      { value: 'jazz', label: 'Jazz', icon: '🎵' },
      { value: 'rock', label: 'Rock', icon: '🎸' },
      { value: 'pop', label: 'Pop', icon: '🎵' },
    ]
  },
  {
    label: 'Other',
    options: [
      { value: 'other', label: 'Other Style', icon: '🎵' },
      { value: 'none', label: 'I don\'t sing', icon: '❌' },
    ]
  }
];

const musicCultures = [
  {
    label: 'Western',
    options: [
      { value: 'western', label: 'Western', icon: '🎵' },
      { value: 'classical', label: 'Classical', icon: '🎼' },
      { value: 'jazz', label: 'Jazz', icon: '🎷' },
      { value: 'blues', label: 'Blues', icon: '🎸' },
    ]
  },
  {
    label: 'World Music',
    options: [
      { value: 'folk', label: 'Folk', icon: '🎵' },
      { value: 'latin', label: 'Latin', icon: '🎵' },
      { value: 'african', label: 'African', icon: '🥁' },
      { value: 'asian', label: 'Asian', icon: '🎵' },
      { value: 'middleeastern', label: 'Middle Eastern', icon: '🎵' },
    ]
  },
  {
    label: 'Modern',
    options: [
      { value: 'fusion', label: 'Fusion', icon: '🎵' },
      { value: 'electronic', label: 'Electronic', icon: '🎧' },
      { value: 'experimental', label: 'Experimental', icon: '🎵' },
    ]
  }
];

// Enhanced select styles
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    borderColor: state.isFocused ? '#1a237e' : '#333',
    boxShadow: state.isFocused ? '0 0 0 1px #1a237e' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#1a237e' : '#555'
    },
    minHeight: '42px',
    borderRadius: '0.5rem',
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 10,
    padding: '0.5rem',
  }),
  group: (base: any) => ({
    ...base,
    paddingBottom: '0.5rem',
  }),
  groupHeading: (base: any) => ({
    ...base,
    color: '#888',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '0.5rem',
    paddingLeft: '0.5rem',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#1a237e' : state.isFocused ? '#333' : 'transparent',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#1a237e' : '#333'
    },
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  input: (base: any) => ({
    ...base,
    color: 'white',
    margin: '0',
    padding: '0',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#888'
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    backgroundColor: '#555'
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: '#888',
    padding: '0 0.5rem',
  }),
  clearIndicator: (base: any) => ({
    ...base,
    color: '#888',
    padding: '0 0.5rem',
    '&:hover': {
      color: '#fff'
    }
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#1a237e',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'white',
    padding: '0.25rem 0.5rem',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'white',
    padding: '0.25rem',
    '&:hover': {
      backgroundColor: '#283593',
      color: 'white',
    },
  }),
};

// Custom components for Select
const Option = ({ data, ...props }: any) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      {data.icon && <span className="text-lg">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </components.Option>
);

const SingleValue = ({ data, ...props }: any) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      {data.icon && <span className="text-lg">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </components.SingleValue>
);

// Add custom styles for PhoneInput
const phoneInputStyles = {
  container: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: '42px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    paddingLeft: '48px',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: '#1a237e',
      boxShadow: '0 0 0 1px #1a237e',
    },
    '&:hover': {
      borderColor: '#555',
    },
  },
  button: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRight: 'none',
    borderRadius: '0.5rem 0 0 0.5rem',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
  dropdown: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  search: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: 'white',
    '&:focus': {
      borderColor: '#1a237e',
      boxShadow: '0 0 0 1px #1a237e',
    },
  },
  country: {
    backgroundColor: '#1a1a1a',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
  selectedFlag: {
    backgroundColor: '#1a1a1a',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
  flag: {
    backgroundColor: '#1a1a1a',
  },
  arrow: {
    borderTop: '4px solid #888',
    '&:hover': {
      borderTop: '4px solid #fff',
    },
  },
  searchBox: {
    margin: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: 'white',
    '&:focus': {
      borderColor: '#1a237e',
      boxShadow: '0 0 0 1px #1a237e',
    },
  },
  countryList: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.5rem',
    marginTop: '0.5rem',
  },
  countryListItem: {
    backgroundColor: '#1a1a1a',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
  selectedCountry: {
    backgroundColor: '#1a237e',
    '&:hover': {
      backgroundColor: '#1a237e',
    },
  },
};

// Add validation functions
const validateUserData = (data: FormData) => {
  const errors: { [key: string]: string } = {};

  // Validate full name
  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  // Validate email
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Validate password
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and numbers';
  }

  // Validate contact number
  if (!data.contactNumber) {
    errors.contactNumber = 'Contact number is required';
  }

  // Validate country
  if (!data.country) {
    errors.country = 'Country is required';
  }

  // Validate instrument type
  if (!data.instrumentType) {
    errors.instrumentType = 'Instrument type is required';
  }

  // Validate music culture
  if (!data.musicCulture) {
    errors.musicCulture = 'Music culture is required';
  }

  // Validate bio
  if (!data.bio.trim()) {
    errors.bio = 'Bio is required';
  } else if (data.bio.length < 30) {
    errors.bio = 'Bio must be at least 30 characters';
  }

  return errors;
};

// Image validation and upload utilities
const validateAndProcessImage = async (file: File): Promise<{ isValid: boolean; error?: string; processedFile?: File }> => {
  return new Promise((resolve) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      resolve({ isValid: false, error: 'Image size must be less than 5MB' });
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      resolve({ isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' });
      return;
    }

    // Check image dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        resolve({ isValid: false, error: 'Image dimensions must be at least 100x100 pixels' });
        return;
      }
      if (img.width > 2000 || img.height > 2000) {
        resolve({ isValid: false, error: 'Image dimensions must not exceed 2000x2000 pixels' });
        return;
      }
      resolve({ isValid: true, processedFile: file });
    };
    img.onerror = () => {
      resolve({ isValid: false, error: 'Invalid image file' });
    };
    img.src = URL.createObjectURL(file);
  });
};

// Add function to check existing profile image
const checkExistingProfileImage = async (userId: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, `usersproflesphotos/${userId}`);
    const result = await listAll(storageRef);
    return result.items.length > 0;
  } catch (error) {
    console.error('Error checking existing profile image:', error);
    return false;
  }
};

// Add function to verify image path in Firebase
const verifyImagePathInFirebase = async (userId: string, imagePath: string): Promise<boolean> => {
  try {
    // Check if image exists in storage
    const storageRef = ref(storage, imagePath);
    await getDownloadURL(storageRef);

    // Check if path is saved in user document
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    if (userData?.profileImagePath !== imagePath) {
      throw new Error('Image path not saved correctly in user document');
    }

    return true;
  } catch (error) {
    console.error('Error verifying image path:', error);
    return false;
  }
};

// Add function to handle duplicate image replacement
const replaceExistingImage = async (userId: string, newFile: File): Promise<{ path: string; url: string }> => {
  try {
    // Get existing image path
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    const existingPath = userData?.profileImagePath;

    // Delete existing image if it exists
    if (existingPath) {
      try {
        const existingRef = ref(storage, existingPath);
        await deleteObject(existingRef);
        toast.info('Replacing existing profile image...');
      } catch (error) {
        console.error('Error deleting existing image:', error);
        // Continue even if delete fails
      }
    }

    // Upload new image
    const timestamp = Date.now();
    const fileExtension = newFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `profile_${timestamp}.${fileExtension}`;
    const newPath = `usersproflesphotos/${userId}/${fileName}`;

    // Upload new file
    const uploadResult = await uploadBytes(ref(storage, newPath), newFile);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    return {
      path: newPath,
      url: downloadURL
    };
  } catch (error) {
    console.error('Error replacing image:', error);
    throw error;
  }
};

// Enhanced upload profile photo function
const uploadProfilePhoto = async (file: File, userId: string): Promise<{ path: string; url: string }> => {
  try {
    // Check if user already has a profile image
    const hasExistingImage = await checkExistingProfileImage(userId);
    
    let profileImageData;
    if (hasExistingImage) {
      // Replace existing image
      profileImageData = await replaceExistingImage(userId, file);
      toast.info('Replacing existing profile image...');
    } else {
      // Upload new image
      const validation = await validateAndProcessImage(file);
      if (!validation.isValid || !validation.processedFile) {
        throw new Error(validation.error);
      }

      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `profile_${timestamp}.${fileExtension}`;
      const storagePath = `usersproflesphotos/${userId}/${fileName}`;

      const uploadResult = await uploadBytes(ref(storage, storagePath), validation.processedFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      profileImageData = {
        path: storagePath,
        url: downloadURL
      };
    }

    // Verify the upload
    if (!profileImageData?.path || !profileImageData?.url) {
      throw new Error('Failed to verify image upload');
    }

    // Verify image exists in storage
    const storageRef = ref(storage, profileImageData.path);
    await getDownloadURL(storageRef);

    return profileImageData;
  } catch (error) {
    console.error('Error in uploadProfilePhoto:', error);
    throw error;
  }
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [countries, setCountries] = useState(countryList().getData());
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    country: '',
    instrumentType: '',
    singingType: '',
    musicCulture: '',
    bio: '',
    profileImage: null,
    profileImagePath: '',
    talentDescription: '',
  });

  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    country: '',
    instrumentType: '',
    singingType: '',
    musicCulture: '',
    bio: '',
  });

  // Add new state for photo validation
  const [isPhotoValidating, setIsPhotoValidating] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Add new state for registration progress
  const [registrationProgress, setRegistrationProgress] = useState<{
    step: string;
    message: string;
    error?: string;
  } | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const validateStep = (step: number): boolean => {
    let isValid = true;
    const errors = { ...formErrors };

    if (step === 1) {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Name is required';
        isValid = false;
      } else {
        errors.fullName = '';
      }

      if (!formData.email.trim()) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
        isValid = false;
      } else {
        errors.email = '';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
        isValid = false;
      } else {
        errors.password = '';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      } else {
        errors.confirmPassword = '';
      }
    } 
    
    else if (step === 2) {
      if (!formData.contactNumber.trim()) {
        errors.contactNumber = 'Contact number is required';
        isValid = false;
      } else {
        errors.contactNumber = '';
      }

      if (!formData.country) {
        errors.country = 'Country is required';
        isValid = false;
      } else {
        errors.country = '';
      }

      if (!formData.instrumentType) {
        errors.instrumentType = 'Instrument type is required';
        isValid = false;
      } else {
        errors.instrumentType = '';
      }

      if (!formData.musicCulture) {
        errors.musicCulture = 'Music culture is required';
        isValid = false;
      } else {
        errors.musicCulture = '';
      }
    } 
    
    else if (step === 3) {
      if (!formData.bio.trim()) {
        errors.bio = 'Bio is required';
        isValid = false;
      } else if (formData.bio.length < 30) {
        errors.bio = 'Bio should be at least 30 characters';
        isValid = false;
      } else {
        errors.bio = '';
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string) => (selectedOption: any) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : '',
    });
  };

  // Enhanced handleImageChange
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoValidating(true);
    setPhotoError(null);

    try {
      // Validate and process image
      const validation = await validateAndProcessImage(file);
      if (!validation.isValid) {
        setPhotoError(validation.error);
        return;
      }
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));

      // Show success message
      toast.success('Profile image selected successfully');
    } catch (error) {
      console.error('Error handling image:', error);
      setPhotoError(error instanceof Error ? error.message : 'Failed to process image');
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsPhotoValidating(false);
    }
  };

  const handlePhoneChange = (value: string, data: any) => {
      setFormData({
        ...formData,
      contactNumber: value,
      country: data.countryCode.toUpperCase()
      });
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Enhanced handleSubmit with strict image path verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    setRegistrationProgress(null);
    
    try {
      // Step 1: Validate all user data
      setRegistrationProgress({ step: 'Validating', message: 'Validating your information...' });
      const validationErrors = validateUserData(formData);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        toast.error('Please fix the validation errors before proceeding');
        return;
      }

      // Step 2: Create Firebase Auth account
      setRegistrationProgress({ step: 'Creating Account', message: 'Creating your account...' });
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Step 3: Handle profile image
      let profileImageData = null;
      if (formData.profileImage) {
        try {
          setRegistrationProgress({ 
            step: 'Processing Photo', 
            message: 'Processing your profile photo...' 
          });

          // Upload and verify image
          profileImageData = await uploadProfilePhoto(formData.profileImage, user.uid);

          // Verify the upload was successful
          if (!profileImageData?.path || !profileImageData?.url) {
            throw new Error('Failed to verify profile image upload');
          }

          // Verify image path in Firebase
          const storageRef = ref(storage, profileImageData.path);
          await getDownloadURL(storageRef);

          toast.success(
            <div>
              <p>Profile image processed successfully</p>
              <p className="text-sm mt-1">Path: {profileImageData.path}</p>
            </div>
          );
        } catch (error) {
          console.error('Error processing profile photo:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to process profile photo';
          
          // Stop registration if image processing fails
          toast.error(
            <div>
              <p>{errorMessage}</p>
              <p className="text-sm mt-1">Registration cannot proceed. Please try again.</p>
            </div>
          );
          
          setRegistrationProgress({
            step: 'Error',
            message: 'Profile photo processing failed',
            error: errorMessage
          });

          // Delete the created user account
          await deleteUser(user);
          return;
        }
      }
      
      // Step 4: Save user data to Firestore
      setRegistrationProgress({ step: 'Saving Data', message: 'Saving your profile data...' });
      
      const userData = {
        uid: user.uid,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        contactNumber: formData.contactNumber,
        country: formData.country,
        instrumentType: formData.instrumentType,
        singingType: formData.singingType || 'none',
        musicCulture: formData.musicCulture,
        bio: formData.bio.trim(),
        profileImagePath: profileImageData?.path || '',
        profileImageUrl: profileImageData?.url || '',
        profileImageStatus: profileImageData ? 'uploaded' : 'none',
        profileImageUploadedAt: profileImageData ? new Date() : null,
        isVerified: false,
        verificationStatus: 'pending',
        role: 'user',
        welcomeMessage: await generateWelcomeMessage(
          formData.fullName,
          formData.instrumentType
        ),
        createdAt: new Date(),
        lastUpdated: new Date(),
        lastLogin: new Date(),
        accountStatus: 'active',
        emailVerified: false,
        phoneVerified: false,
        registrationIP: '', // You can add IP tracking if needed
        registrationDevice: navigator.userAgent,
        securitySettings: {
          twoFactorEnabled: false,
          loginNotifications: true,
          profileVisibility: 'public'
        },
        registrationCompleted: true,
        registrationSteps: {
          accountCreated: true,
          profilePhotoUploaded: !!profileImageData,
          welcomeMessageGenerated: true,
          dataSaved: false
        },
        talentDescription: formData.talentDescription,
      };

      // Save data with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let saveSuccess = false;

      while (retryCount < maxRetries && !saveSuccess) {
        try {
      await setDoc(doc(db, 'users', user.uid), userData);
          saveSuccess = true;

          // Verify data was saved correctly
          const savedUserDoc = await getDoc(doc(db, 'users', user.uid));
          if (!savedUserDoc.exists()) {
            throw new Error('Failed to verify user data was saved');
          }

          const savedData = savedUserDoc.data();
          if (profileImageData && savedData?.profileImagePath !== profileImageData.path) {
            throw new Error('Failed to verify image path was saved correctly');
          }

          // Auto-login
          if (auth.currentUser?.uid !== user.uid) {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
          }
      
      // Show success message
          toast.success(
            <div>
              <p>Registration completed successfully!</p>
              {profileImageData && (
                <p className="text-sm mt-1">
                  Profile image saved at: {savedData?.profileImagePath}
                </p>
              )}
            </div>
          );

          // Navigate to profile
      setTimeout(() => {
            navigate('/profile', { 
              state: { 
                userData,
                isNewRegistration: true 
              }
            });
      }, 1500);
        } catch (error) {
          retryCount++;
          console.error(`Attempt ${retryCount} failed:`, error);
          
          if (retryCount === maxRetries) {
            // Delete user account if data saving fails
            await deleteUser(user);
            throw new Error('Failed to save user data after multiple attempts');
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Failed to register. Please try again.';
      
      if ((error as AuthError)?.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in or use a different email.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setRegistrationProgress({
        step: 'Error',
        message: 'Registration failed',
        error: errorMessage
      });

        toast.error(
          <div>
          <p>{errorMessage}</p>
          {(error as AuthError)?.code === 'auth/email-already-in-use' && (
            <p className="text-sm mt-1">
              Please <Link to="/login" className="underline">log in</Link> or use a different email address.
            </p>
          )}
          </div>
        );
    } finally {
      setIsLoading(false);
    }
  };

  // Progress bar component
  const ProgressBar = () => {
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex flex-col items-center ${
                currentStep >= step ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep > step
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : currentStep === step
                    ? 'border-primary-500 text-primary-500'
                    : 'border-gray-500 text-gray-500'
                }`}
              >
                {currentStep > step ? <Check size={20} /> : step}
              </div>
              <span className="text-sm mt-1">
                {step === 1 ? 'Account' : step === 2 ? 'Music Profile' : 'Bio'}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Add registration progress display
  const renderRegistrationProgress = () => {
    if (!registrationProgress) return null;

    return (
      <div className={`mt-4 p-4 rounded-lg ${
        registrationProgress.step === 'Error' 
          ? 'bg-red-900/30 border border-red-500' 
          : 'bg-dark-700 border border-dark-600'
      }`}>
        <div className="flex items-center">
          {registrationProgress.step === 'Error' ? (
            <X className="text-red-500 mr-2" size={20} />
          ) : (
            <Loader className="animate-spin text-primary-500 mr-2" size={20} />
          )}
          <div>
            <p className="text-sm font-medium">
              {registrationProgress.step}
            </p>
            <p className="text-sm text-gray-400">
              {registrationProgress.message}
            </p>
            {registrationProgress.error && (
              <p className="text-sm text-red-500 mt-1">
                {registrationProgress.error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-8 w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Join SoundAlchemy</h2>
        <p className="text-gray-400 mt-2">Create your musician account</p>
      </div>

      <ProgressBar />

      <form onSubmit={handleSubmit}>
        {/* Step 1: Account Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="Your full name"
              />
              {formErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="your.email@example.com"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a strong password"
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
              />
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                Next Step
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Music Profile */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Music Profile</h3>
            
            <div className="mb-4">
              <label htmlFor="contactNumber" className="block text-gray-300 mb-1">
                Contact Number
              </label>
              <PhoneInput
                country={formData.country.toLowerCase()}
                value={formData.contactNumber}
                onChange={handlePhoneChange}
                inputClass="form-input !w-full !pl-14"
                buttonClass="!bg-dark-700 !border-dark-600"
                dropdownClass="!bg-dark-700 !border-dark-600"
                searchClass="!bg-dark-700 !border-dark-600 !text-white"
                containerClass="!w-full"
                searchPlaceholder="Search country..."
                enableSearch
                searchNotFound="No country found"
                inputProps={{
                  name: 'contactNumber',
                  required: true,
                  autoFocus: true
                }}
                specialLabel=""
                inputStyle={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  paddingLeft: '48px',
                  transition: 'all 0.2s ease',
                }}
                buttonStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRight: 'none',
                  borderRadius: '0.5rem 0 0 0.5rem',
                }}
                dropdownStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
                searchStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '0.375rem',
                  color: 'white',
                  margin: '0.5rem',
                  padding: '0.5rem',
                }}
                countryCodeEditable={false}
                enableAreaCodes={true}
                disableSearchIcon={true}
                disableDropdown={false}
                preferredCountries={['us', 'gb', 'ca', 'au']}
                enableTerritories={true}
                enableAreaCodeStretch={true}
                autoFormat={true}
              />
              {formErrors.contactNumber && (
                <p className="text-red-500 text-sm mt-1">{formErrors.contactNumber}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="country" className="block text-gray-300 mb-1">
                Country
              </label>
              <Select
                id="country"
                options={countries}
                styles={selectStyles}
                placeholder="Select your country"
                onChange={handleSelectChange('country')}
                className="react-select-container"
                classNamePrefix="react-select"
                components={{ Option, SingleValue }}
                isSearchable
                isClearable
                noOptionsMessage={() => "No countries found"}
                value={countries.find(option => option.value === formData.country)}
              />
              {formErrors.country && (
                <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="instrumentType" className="block text-gray-300 mb-1">
                Instrument Type
              </label>
              <Select
                id="instrumentType"
                options={instruments}
                styles={selectStyles}
                placeholder="Select your instrument"
                onChange={handleSelectChange('instrumentType')}
                className="react-select-container"
                classNamePrefix="react-select"
                components={{ Option, SingleValue }}
                isSearchable
                isClearable
                noOptionsMessage={() => "No instruments found"}
              />
              {formErrors.instrumentType && (
                <p className="text-red-500 text-sm mt-1">{formErrors.instrumentType}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="singingType" className="block text-gray-300 mb-1">
                Singing Type (Optional)
              </label>
              <Select
                id="singingType"
                options={singingTypes}
                styles={selectStyles}
                placeholder="Select your singing type"
                onChange={handleSelectChange('singingType')}
                className="react-select-container"
                classNamePrefix="react-select"
                components={{ Option, SingleValue }}
                isSearchable
                isClearable
                noOptionsMessage={() => "No singing types found"}
              />
              {formErrors.singingType && (
                <p className="text-red-500 text-sm mt-1">{formErrors.singingType}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="musicCulture" className="block text-gray-300 mb-1">
                Music Culture
              </label>
              <Select
                id="musicCulture"
                options={musicCultures}
                styles={selectStyles}
                placeholder="Select your music culture"
                onChange={handleSelectChange('musicCulture')}
                className="react-select-container"
                classNamePrefix="react-select"
                components={{ Option, SingleValue }}
                isSearchable
                isClearable
                noOptionsMessage={() => "No music cultures found"}
              />
              {formErrors.musicCulture && (
                <p className="text-red-500 text-sm mt-1">{formErrors.musicCulture}</p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="btn-outline"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                Next Step
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Bio and Talent Description */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Bio & Talent Description</h3>
            
            <div className="mb-4">
              <label htmlFor="bio" className="block text-gray-300 mb-1">
                Personal Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-input h-32 resize-none"
                placeholder="Tell us about yourself, your musical journey, and what you're looking to collaborate on..."
              ></textarea>
              {formErrors.bio && (
                <p className="text-red-500 text-sm mt-1">{formErrors.bio}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-1">
                Talent Description
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    name="talentDescription"
                    value={formData.talentDescription}
                    onChange={handleChange}
                    placeholder="Share what makes you unique! For example: 'I'm a classical pianist who loves to blend traditional compositions with modern electronic elements. I've been playing for 10 years and specialize in creating emotional, cinematic soundscapes.'"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400 min-h-[120px]"
                    required
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <FaRobot className="w-5 h-5" />
                </div>
                </div>
                <p className="text-sm text-gray-400">
                  Be specific about your musical journey, unique style, and what sets you apart
                </p>
              </div>
            </div>

            {renderRegistrationProgress()}
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handlePrev}
                className="btn-outline"
                disabled={isLoading}
              >
                Previous
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader size={18} className="animate-spin mr-2" />
                    Registering...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300">
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;