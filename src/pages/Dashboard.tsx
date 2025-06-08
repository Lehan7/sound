import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProfileImageAlert from '../components/ProfileImageAlert';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Bell, ChevronDown, ChevronUp, Phone, Mail, MapPin, Music, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [reminderCount, setReminderCount] = useState(0);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    musicalProfile: true,
    contactInfo: true,
    talents: true
  });

  // Function to check if user has a profile image
  const checkProfileImage = useCallback((data: any) => {
    return data && data.profileImage && data.profileImage.trim() !== '';
  }, []);

  // Function to show reminder toast
  const showReminderToast = useCallback(() => {
    toast.info(
      <div className="flex items-center space-x-2">
        <Bell className="text-yellow-500" size={20} />
        <span>Please add your profile image to complete your profile</span>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }, []);

  // Function to show all reminders
  const showAllReminders = useCallback(() => {
    if (!userData || checkProfileImage(userData)) return;
    
    // Show toast notification
    showReminderToast();
    
    // Show banner
    setShowBanner(true);
    
    // Show modal alert
    setShowProfileAlert(true);
  }, [userData, checkProfileImage, showReminderToast]);

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        
        // Check if user has a profile image
        if (!checkProfileImage(data)) {
          console.log('No profile image found, showing reminders');
          showAllReminders();
        } else {
          console.log('Profile image exists:', data.profileImage);
          setShowProfileAlert(false);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, checkProfileImage, showAllReminders]);

  // Initial data fetch and setup
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Effect to handle profile image changes and reminders
  useEffect(() => {
    if (!userData || checkProfileImage(userData)) return;

    // Show initial reminders
    showAllReminders();

    // Set up periodic reminders
    const reminderInterval = setInterval(() => {
      setReminderCount(prev => prev + 1);
      showAllReminders();
    }, 180000); // Show reminder every 3 minutes

    // Set up page visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        showAllReminders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(reminderInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userData, checkProfileImage, showAllReminders]);

  // Effect to handle page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!userData || checkProfileImage(userData)) return;
      localStorage.setItem('showProfileReminder', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userData, checkProfileImage]);

  // Effect to check for reminder flag on mount
  useEffect(() => {
    const shouldShowReminder = localStorage.getItem('showProfileReminder') === 'true';
    if (shouldShowReminder && userData && !checkProfileImage(userData)) {
      showAllReminders();
      localStorage.removeItem('showProfileReminder');
    }
  }, [userData, checkProfileImage, showAllReminders]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-white p-4 md:p-6 lg:p-8"
    >
      {/* Alert Banner */}
      <AnimatePresence>
        {userData && !checkProfileImage(userData) && showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg mb-6 overflow-hidden shadow-lg"
          >
            <div className="p-4 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500/20 p-2 rounded-full animate-pulse">
                  <Bell className="text-yellow-500" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Profile Image Required</h3>
                  <p className="text-yellow-500/90 text-sm">Please add a profile image to complete your profile setup</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowProfileAlert(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm hover:bg-yellow-600 transition-colors shadow-md"
                >
                  Add Photo Now
                </button>
                <button
                  onClick={() => {
                    setShowBanner(false);
                    setTimeout(() => setShowBanner(true), 30000);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h1>
        
        {userData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-4 md:p-6 lg:p-8 shadow-xl"
          >
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
              <div 
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-600 cursor-pointer hover:border-yellow-500 transition-colors"
                onClick={() => !checkProfileImage(userData) && setShowProfileAlert(true)}
              >
                {checkProfileImage(userData) ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-sm text-center p-2 flex flex-col items-center">
                    <Bell className="text-yellow-500 mb-1 animate-bounce" size={24} />
                    <span>Add Photo</span>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-semibold">{userData.fullName}</h2>
                <p className="text-gray-400">{userData.email}</p>
              </div>
            </div>

            {/* Musical Profile Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('musicalProfile')}
                className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Music className="text-primary-500" size={20} />
                  <h3 className="text-lg font-semibold">Musical Profile</h3>
                </div>
                {expandedSections.musicalProfile ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <AnimatePresence>
                {expandedSections.musicalProfile && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Instrument</p>
                          <p className="font-medium">{userData.instrumentType}</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Singing Type</p>
                          <p className="font-medium">{userData.singingType}</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Music Culture</p>
                          <p className="font-medium">{userData.musicCulture}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact Information Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('contactInfo')}
                className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Phone className="text-primary-500" size={20} />
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                {expandedSections.contactInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <AnimatePresence>
                {expandedSections.contactInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Country</p>
                          <p className="font-medium">{userData.country}</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Contact Number</p>
                          <p className="font-medium">{userData.contactNumber}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Talents Section */}
            {userData.talentDescription && (
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('talents')}
                  className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <User className="text-primary-500" size={20} />
                    <h3 className="text-lg font-semibold">Your Unique Talents</h3>
                  </div>
                  {expandedSections.talents ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {expandedSections.talents && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <p className="text-gray-300 whitespace-pre-wrap">{userData.talentDescription}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Profile Image Alert */}
      <ProfileImageAlert
        isOpen={showProfileAlert}
        onClose={() => {
          setShowProfileAlert(false);
          fetchUserData();
        }}
      />
    </motion.div>
  );
};

export default Dashboard; 