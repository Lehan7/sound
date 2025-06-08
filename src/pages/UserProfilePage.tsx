import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { compressImage, validateImage } from '../utils/imageUtils';
import { 
  User, 
  Music, 
  MapPin, 
  Phone, 
  Mail, 
  Edit3, 
  Camera,
  Save,
  X,
  Loader,
  BookOpen,
  LightbulbIcon,
  HandHelping,
  BarChart2,
  FileMusic,
  Users,
  Book,
  Award,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Mic,
  Headphones,
  Video,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  MessageCircle as MessageCircleIcon,
  Share2 as Share2Icon,
  ChevronUp,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { analyzeBioForSuggestions, generateCollaborationIdeas } from '../config/aiService';
import { Country, countries, getCountryInfo } from '../utils/countries';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { INSTRUMENT_TYPES, SINGING_TYPES } from '../utils/constants';

interface UserProfile {
  id?: string;
  fullName: string;
  email?: string;
  contactNumber: string;
  countryCode: string;
  bio: string;
  profileImagePath?: string;
  profileImage?: File | null;
  previewURL?: string;
  talentDescription: string;
  instrumentTypes: string[];
  singingTypes: string[];
  lastUpdated?: Date;
  createdAt?: Date;
  isVerified?: boolean;
  verificationStatus?: string;
  role?: string;
  welcomeMessage?: string;
  musicCulture?: string;
  instrumentType?: string;
  singingType?: string;
  skills?: string[];
  interests?: string[];
  analytics?: {
    totalPlays: number;
    followers: number;
    collaborations: number;
    monthlyGrowth: number;
    profileViews: number;
    projects: number;
  };
  portfolio?: {
    tracks: Array<{
      id: string;
      title: string;
      genre: string;
      duration: string;
      uploadDate: Date;
      plays: number;
    }>;
  };
}

interface PracticeSession {
  id: string;
  date: Date;
  duration: number;
  focus: string;
  notes: string;
  mood: string;
  achievements: string[];
}

interface MusicEvent {
  id: string;
  title: string;
  type: 'concert' | 'workshop' | 'collaboration' | 'recording';
  date: Date;
  location: string;
  description: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  participants?: string[];
}

interface SkillProgress {
  skill: string;
  level: number;
  lastPracticed: Date;
  goals: {
    shortTerm: string;
    longTerm: string;
  };
  achievements: string[];
}

const API_URL = 'http://localhost:3001';

const CountrySelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = countries.find((country: Country) => country.code === value);
  const filteredCountries = countries.filter((country: Country) => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer bg-background hover:bg-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl">{selectedCountry?.flag || '🌍'}</span>
        <span className="flex-grow">{selectedCountry?.name || 'Select Country'}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-[300px] overflow-hidden">
          <div className="sticky top-0 bg-background p-2 border-b">
            <input
              type="text"
              placeholder="Search countries..."
              className="w-full p-2 rounded-md bg-input border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-[250px] custom-scrollbar">
            {filteredCountries.map((country: Country) => (
              <div
                key={country.code}
                className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-accent transition-colors ${
                  value === country.code ? 'bg-accent' : ''
                }`}
                onClick={() => {
                  onChange(country.code);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
              >
                <span className="text-xl">{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">{country.phoneCode}</span>
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const formatPhoneNumber = (phoneNumber: string) => {
  // Remove any non-digit characters except '+'
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check if it starts with '+'
  const hasPlus = cleaned.startsWith('+');
  
  // Format the number: +XX XXXXXXXXX
  if (cleaned.length >= 11) {
    const countryCode = hasPlus ? cleaned.slice(0, 3) : '+' + cleaned.slice(0, 2);
    const restOfNumber = hasPlus ? cleaned.slice(3) : cleaned.slice(2);
    return `${countryCode} ${restOfNumber}`;
  }
  
  return cleaned;
};

const PhoneNumberDisplay = ({ phoneNumber }: { phoneNumber: string }) => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  
  return (
    <div className="flex items-center gap-3">
      <div className="text-xl font-medium tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {formattedNumber}
      </div>
    </div>
  );
};

const TalentBadge = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 backdrop-blur-sm rounded-full">
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium text-gray-300">{text}</span>
  </div>
);

const MusicianTalents = ({ profile }: { profile: UserProfile }) => {
  const hasInstruments = (profile?.instrumentTypes?.length ?? 0) > 0;
  const hasSinging = (profile?.singingTypes?.length ?? 0) > 0;

  if (!hasInstruments && !hasSinging) return null;

  const instrumentNames = profile?.instrumentTypes?.map(id => 
    INSTRUMENT_TYPES.find(type => type.id === id)
  ).filter(Boolean);

  const singingNames = profile?.singingTypes?.map(id => 
    SINGING_TYPES.find(type => type.id === id)
  ).filter(Boolean);

  return (
    <div className="mt-4 space-y-3">
      {hasInstruments && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-400">Instruments</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {instrumentNames?.map(instrument => instrument && (
              <TalentBadge 
                key={instrument.id} 
                icon={instrument.icon} 
                text={instrument.name}
              />
            ))}
          </div>
        </div>
      )}
      
      {hasSinging && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-400">Singing Styles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {singingNames?.map(style => style && (
              <TalentBadge 
                key={style.id} 
                icon={style.icon} 
                text={style.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TalentDisplay = ({ profile }: { profile: UserProfile }) => {
  const hasInstruments = (profile?.instrumentTypes?.length ?? 0) > 0;
  const hasSinging = (profile?.singingTypes?.length ?? 0) > 0;

  if (!hasInstruments && !hasSinging) return null;

  const instrumentNames = profile?.instrumentTypes?.map(id => 
    INSTRUMENT_TYPES.find(type => type.id === id)?.name
  ).filter(Boolean);

  const singingNames = profile?.singingTypes?.map(id => 
    SINGING_TYPES.find(type => type.id === id)?.name
  ).filter(Boolean);

  const talents = [];
  if (hasInstruments) {
    talents.push(`${instrumentNames?.join(', ')} Player`);
  }
  if (hasSinging) {
    talents.push(`${singingNames?.join(', ')} Singer`);
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-primary-400 font-medium">
        {talents.join(' & ')}
      </span>
      {profile?.verificationStatus === 'pending' && (
        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full">
          Verification Pending
        </span>
      )}
    </div>
  );
};

const ProfileHeader = ({ profile }: { profile: UserProfile }) => {
  const hasInstruments = (profile?.instrumentTypes?.length ?? 0) > 0;
  const hasSinging = (profile?.singingTypes?.length ?? 0) > 0;

  const getTalentText = () => {
    const talents = [];
    
    if (hasInstruments) {
      const instruments = profile?.instrumentTypes
        ?.map(id => INSTRUMENT_TYPES.find(type => type.id === id))
        .filter(Boolean)
        .map(inst => inst?.name);
      if (instruments?.length) {
        talents.push(instruments.join(', '));
      }
    }
    
    if (hasSinging) {
      const styles = profile?.singingTypes
        ?.map(id => SINGING_TYPES.find(type => type.id === id))
        .filter(Boolean)
        .map(style => style?.name);
      if (styles?.length) {
        talents.push(styles.join(', '));
      }
    }
    
    return talents.length > 0 ? talents.join(' • ') : 'Musician';
  };

  return (
    <div className="text-center mb-6">
      <div className="relative inline-block">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-primary-500">
          <img
            src={profile?.profileImagePath ? `${API_URL}${profile.profileImagePath}` : '/default-avatar.png'}
            alt={profile?.fullName}
            className="w-full h-full object-cover"
          />
        </div>
        {profile?.isVerified && (
          <div className="absolute bottom-4 -right-1 bg-primary-500 rounded-full p-1">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">{profile?.fullName}</h1>
      
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-primary-400 font-medium">
          {getTalentText()}
        </span>
        {profile?.verificationStatus === 'pending' && (
          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full">
            Verification pending
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="flex items-center gap-1.5 text-gray-400">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{getCountryInfo(profile?.countryCode || 'US').name}</span>
        </div>
      </div>

      {(hasInstruments || hasSinging) && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {profile?.instrumentTypes?.map(id => {
            const instrument = INSTRUMENT_TYPES.find(type => type.id === id);
            if (!instrument) return null;
            return (
              <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 backdrop-blur-sm rounded-full">
                <span className="text-lg">{instrument.icon}</span>
                <span className="text-sm font-medium text-gray-300">{instrument.name}</span>
              </div>
            );
          })}
          {profile?.singingTypes?.map(id => {
            const style = SINGING_TYPES.find(type => type.id === id);
            if (!style) return null;
            return (
              <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 backdrop-blur-sm rounded-full">
                <span className="text-lg">{style.icon}</span>
                <span className="text-sm font-medium text-gray-300">{style.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MusicianTypeSection = ({ profile }: { profile: UserProfile }) => {
  const hasInstruments = (profile?.instrumentTypes?.length ?? 0) > 0;
  const hasSinging = (profile?.singingTypes?.length ?? 0) > 0;

  const getMusicianType = () => {
    if (hasInstruments && hasSinging) return "Instrumentalist & Singer";
    if (hasInstruments) return "Instrumentalist";
    if (hasSinging) return "Singer";
    return "Musician";
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-white">Musician Type</h3>
        </div>
        <span className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 font-medium">
          {(() => {
            const hasInstruments = profile?.instrumentTypes && profile.instrumentTypes.length > 0;
            const hasSinging = profile?.singingTypes && profile.singingTypes.length > 0;
            if (hasInstruments && hasSinging) return 'Instrumentalist & Singer';
            if (hasInstruments) return 'Instrumentalist';
            if (hasSinging) return 'Singer';
            return 'Musician';
          })()}
        </span>
      </div>

      {hasInstruments && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">Instruments</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.instrumentTypes?.map(id => {
              const instrument = INSTRUMENT_TYPES.find(type => type.id === id);
              if (!instrument) return null;
              return (
                <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 backdrop-blur-sm rounded-full">
                  <span className="text-lg">{instrument.icon}</span>
                  <span className="text-sm font-medium text-gray-300">{instrument.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasSinging && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">Singing Styles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.singingTypes?.map(id => {
              const style = SINGING_TYPES.find(type => type.id === id);
              if (!style) return null;
              return (
                <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 backdrop-blur-sm rounded-full">
                  <span className="text-lg">{style.icon}</span>
                  <span className="text-sm font-medium text-gray-300">{style.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bioSuggestions, setBioSuggestions] = useState<string[]>([]);
  const [collaborationIdeas, setCollaborationIdeas] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>({
    fullName: '',
    contactNumber: '',
    countryCode: '',
    bio: '',
    talentDescription: '',
    profileImage: null as File | null,
    previewURL: '',
    instrumentTypes: [],
    singingTypes: []
  });

  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState<any>(null);
  const [collaborationOpportunities, setCollaborationOpportunities] = useState<any[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [musicEvents, setMusicEvents] = useState<MusicEvent[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [communityFeed, setCommunityFeed] = useState<any[]>([]);
  const [showFullBio, setShowFullBio] = useState(false);
  const [bioOverflow, setBioOverflow] = useState(false);
  const bioRef = React.useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);
          
          // Get profile image URL if path exists
          if (userData.profileImagePath) {
            setImageUrl(`http://localhost:3001${userData.profileImagePath}`);
          }
          
          // Initialize edit form
          setEditForm({
            fullName: userData.fullName,
            contactNumber: userData.contactNumber,
            countryCode: userData.countryCode,
            bio: userData.bio,
            talentDescription: userData.talentDescription,
            profileImage: null,
            previewURL: imageUrl || '',
            instrumentTypes: userData.instrumentTypes || [],
            singingTypes: userData.singingTypes || []
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Load AI suggestions when profile is loaded
    const loadAISuggestions = async () => {
      if (profile && profile.bio) {
        setSuggestionsLoading(true);
        try {
          const suggestions = await analyzeBioForSuggestions(profile.bio);
          setBioSuggestions(suggestions);
        } catch (error) {
          console.error('Error getting bio suggestions:', error);
        } finally {
          setSuggestionsLoading(false);
        }
      }
    };

    const loadCollaborationIdeas = async () => {
      if (profile && profile.instrumentType && profile.musicCulture) {
        setIdeasLoading(true);
        try {
          const ideas = await generateCollaborationIdeas(
            profile.instrumentType,
            profile.musicCulture
          );
          setCollaborationIdeas(ideas);
        } catch (error) {
          console.error('Error getting collaboration ideas:', error);
        } finally {
          setIdeasLoading(false);
        }
      }
    };

    if (profile) {
      loadAISuggestions();
      loadCollaborationIdeas();
    }
  }, [profile]);

  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!user) return;
      
      try {
        // Load portfolio data
        const portfolioDoc = await getDoc(doc(db, 'portfolios', user.uid));
        if (portfolioDoc.exists()) {
          setPortfolio(portfolioDoc.data().tracks || []);
        }
        
        // Load analytics data
        const analyticsDoc = await getDoc(doc(db, 'analytics', user.uid));
        if (analyticsDoc.exists()) {
          setAnalytics(analyticsDoc.data());
        }
        
        // Load learning progress
        const learningDoc = await getDoc(doc(db, 'learning', user.uid));
        if (learningDoc.exists()) {
          setLearningProgress(learningDoc.data());
        }
        
        // Load collaboration opportunities
        const collabDoc = await getDoc(doc(db, 'collaborations', user.uid));
        if (collabDoc.exists()) {
          setCollaborationOpportunities(collabDoc.data().opportunities || []);
        }
        
        // Load practice sessions
        const practiceDoc = await getDoc(doc(db, 'practice_sessions', user.uid));
        if (practiceDoc.exists()) {
          setPracticeSessions(practiceDoc.data().sessions || []);
        }
        
        // Load music events
        const eventsDoc = await getDoc(doc(db, 'music_events', user.uid));
        if (eventsDoc.exists()) {
          setMusicEvents(eventsDoc.data().events || []);
        }
        
        // Load skill progress
        const skillsDoc = await getDoc(doc(db, 'skill_progress', user.uid));
        if (skillsDoc.exists()) {
          setSkillProgress(skillsDoc.data().skills || []);
        }
        
        // Load community feed
        const feedDoc = await getDoc(doc(db, 'community_feed', user.uid));
        if (feedDoc.exists()) {
          setCommunityFeed(feedDoc.data().posts || []);
        }
      } catch (error) {
        console.error('Error loading additional data:', error);
      }
    };
    
    loadAdditionalData();
  }, [user]);

  useEffect(() => {
    if (bioRef.current) {
      setBioOverflow(bioRef.current.scrollHeight > bioRef.current.clientHeight);
    }
  }, [profile?.bio]);

  const handleEditToggle = () => {
    setShowEditModal(true);
    setEditForm({
      fullName: profile?.fullName || '',
      contactNumber: profile?.contactNumber || '',
      countryCode: profile?.countryCode || 'US',
      bio: profile?.bio || '',
      talentDescription: profile?.talentDescription || '',
      profileImage: null,
      previewURL: profile?.profileImagePath ? `http://localhost:3001${profile.profileImagePath}` : '',
      instrumentTypes: profile?.instrumentTypes || [],
      singingTypes: profile?.singingTypes || []
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    // Check if this is the same file as before
    if (editForm.profileImage && 
        editForm.profileImage.name === file.name && 
        editForm.profileImage.size === file.size) {
      return;
    }

    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setPreviewUrl(previewURL);
    setSelectedImage(file);
    setEditForm(prev => ({
      ...prev,
      profileImage: file,
      previewURL: previewURL
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Update profile data
      const userData: Partial<UserProfile> = {
        fullName: editForm.fullName,
        contactNumber: editForm.contactNumber,
        countryCode: editForm.countryCode,
        bio: editForm.bio,
        talentDescription: editForm.talentDescription,
        lastUpdated: new Date(),
        instrumentTypes: editForm.instrumentTypes,
        singingTypes: editForm.singingTypes
      };

      // Handle image upload
      if (editForm.profileImage) {
        try {
          const formData = new FormData();
          formData.append('image', editForm.profileImage);
          formData.append('userId', user.uid);

          const response = await fetch('http://localhost:3001/api/upload-profile-image', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload image');
          }
          // Save the returned path in Firestore
          userData.profileImagePath = data.path;
          setPreviewUrl(`http://localhost:3001${data.path}`);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to upload profile image');
          return;
        }
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), userData);

      // Update local state
      setProfile(prev => prev ? { ...prev, ...userData } : null);
      setShowEditModal(false);
      setSelectedImage(null);
      setEditForm({
        fullName: '',
        contactNumber: '',
        countryCode: 'US',
        bio: '',
        talentDescription: '',
        profileImage: null,
        previewURL: '',
        instrumentTypes: [],
        singingTypes: []
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = () => {
    if (!profile) return null;
    
    if (profile.isVerified) {
      return (
        <div className="inline-flex items-center bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
          </svg>
          Verified Musician
        </div>
      );
    }
    
    return (
      <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Verification {profile.verificationStatus}
      </div>
    );
  };

  const getCountryInfo = (countryCode: string): { name: string; flag: string; phoneCode: string } => {
    const country = countries.find((c: Country) => c.code === countryCode);
    return {
      name: country?.name || 'Unknown',
      flag: country?.flag || '🌍',
      phoneCode: country?.phoneCode || '+1'
    };
  };

  const TalentTypeSelector = ({ 
    types, 
    selectedTypes, 
    onChange, 
    title, 
    icon: Icon 
  }: { 
    types: typeof INSTRUMENT_TYPES | typeof SINGING_TYPES;
    selectedTypes: string[];
    onChange: (types: string[]) => void;
    title: string;
    icon: React.ElementType;
  }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-5 h-5 text-primary-500" />
          <label className="text-sm font-medium text-gray-400">{title}</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {types.map((type) => (
            <div
              key={type.id}
              onClick={() => {
                const isSelected = selectedTypes.includes(type.id);
                onChange(
                  isSelected
                    ? selectedTypes.filter((id) => id !== type.id)
                    : [...selectedTypes, type.id]
                );
              }}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                selectedTypes.includes(type.id)
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
              }`}
            >
              <span className="text-xl">{type.icon}</span>
              <span className="text-sm font-medium truncate">{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TalentDisplay = ({ 
    types, 
    selectedIds,
    title,
    icon: Icon 
  }: { 
    types: typeof INSTRUMENT_TYPES | typeof SINGING_TYPES;
    selectedIds: string[];
    title: string;
    icon: React.ElementType;
  }) => {
    if (selectedIds.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-500" />
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const type = types.find((t) => t.id === id);
            if (!type) return null;
            return (
              <div
                key={type.id}
                className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg"
              >
                <span className="text-xl">{type.icon}</span>
                <span className="text-sm text-gray-300">{type.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-8 py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-primary-500/20 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800"
          >
            <div className="relative h-40 bg-gradient-to-r from-primary-600 to-secondary-600">
              <button 
                onClick={handleEditToggle} 
                className="absolute top-4 right-4 p-2.5 bg-dark-800/50 rounded-full hover:bg-dark-700/60 transition-colors duration-300 backdrop-blur-sm"
              >
                <Edit3 size={18} className="text-white" />
              </button>
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
                <div className="w-40 h-40 rounded-full border-4 border-dark-700 overflow-hidden shadow-xl">
                  {profile?.profileImagePath ? (
                    <img 
                      src={profile?.profileImagePath ? `http://localhost:3001${profile.profileImagePath}` : ''} 
                      alt={profile.fullName} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dark-600">
                      <User size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-24 px-6 pb-6">
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold text-white text-center break-all mb-2">{profile?.fullName}</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {getVerificationBadge()}
                  <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium">
                    {profile?.role || 'Musician'}
                  </span>
                </div>
              </div>
              
              {/* Bio with improved see more/less */}
              <div className="mb-8 relative">
                <div 
                  ref={bioRef}
                  className={`text-gray-300 transition-all duration-300 ${
                    showFullBio ? 'max-h-none' : 'max-h-24 overflow-hidden'
                  }`}
                >
                  <p className="leading-relaxed">{profile?.bio}</p>
                </div>
                {bioOverflow && (
                  <button 
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-2 text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
                  >
                    {showFullBio ? (
                      <>Show Less <ChevronUp size={16} /></>
                    ) : (
                      <>Show More <ChevronDown size={16} /></>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start p-3 rounded-lg bg-dark-700/50 backdrop-blur-sm">
                  <MapPin size={18} className="text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" role="img" aria-label="country flag">
                        {getCountryInfo(profile?.countryCode || 'US').flag}
                      </span>
                      <p className="text-gray-200">{getCountryInfo(profile?.countryCode || 'US').name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 rounded-lg bg-dark-700/50 backdrop-blur-sm">
                  <Phone size={18} className="text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Contact Number</p>
                    <PhoneNumberDisplay phoneNumber={profile?.contactNumber || ''} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-700/50 backdrop-blur-sm">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-primary-400" />
                    Personal Bio
                  </h4>
                  <div className="relative">
                    <div 
                      ref={bioRef}
                      className={`text-gray-300 transition-all duration-300 prose prose-invert prose-sm max-w-none ${
                        showFullBio ? 'max-h-[300px]' : 'max-h-24'
                      } overflow-y-auto overflow-x-hidden custom-scrollbar`}
                      style={{
                        scrollbarGutter: 'stable',
                        paddingRight: '16px'
                      }}
                    >
                      <p className="leading-relaxed whitespace-pre-line break-words">{profile?.bio}</p>
                    </div>
                    {bioOverflow && (
                      <button 
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="mt-2 text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
                      >
                        {showFullBio ? (
                          <>Show Less <ChevronUp size={16} /></>
                        ) : (
                          <>Show More <ChevronDown size={16} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-dark-700/50 backdrop-blur-sm">
                  <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Star size={16} className="text-primary-400" />
                    Talent Description
                  </h4>
                  <div className="text-gray-300 prose prose-invert prose-sm max-w-none">
                    <p className="leading-relaxed">{profile?.talentDescription || 'No talent description added yet.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-6 shadow-xl bg-gradient-to-br from-purple-900/20 to-red-900/20 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <BookOpen size={28} className="text-primary-400 mr-3" />
              <h3 className="text-2xl font-bold">Welcome Message</h3>
            </div>
            <p className="text-gray-300 italic">
              {profile?.welcomeMessage || "Welcome to SoundAlchemy! Complete your profile to connect with musicians worldwide."}
            </p>
          </motion.div>

          {/* User Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="glass-card rounded-2xl p-6 shadow-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">User Details</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Account Status</h4>
                  <div className="flex items-center gap-2">
                    {getVerificationBadge()}
                    <span className="text-gray-300">
                      {profile?.isVerified ? 'Verified Account' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Join Date</h4>
                  <p className="text-gray-300">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Last Updated</h4>
                  <p className="text-gray-300">
                    {profile?.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Music Culture</h4>
                  <p className="text-gray-300">{profile?.musicCulture || 'Not specified'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Role</h4>
                  <p className="text-gray-300">{profile?.role || 'Musician'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Account Type</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-sm">
                      {profile?.isVerified ? 'Professional' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Musical Talents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 shadow-xl bg-gradient-to-br from-red-900/20 to-amber-900/20 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Music size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Musical Talents</h3>
              </div>
              <span className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 font-medium">
                {(() => {
                  const hasInstruments = profile?.instrumentTypes && profile.instrumentTypes.length > 0;
                  const hasSinging = profile?.singingTypes && profile.singingTypes.length > 0;
                  if (hasInstruments && hasSinging) return 'Instrumentalist & Singer';
                  if (hasInstruments) return 'Instrumentalist';
                  if (hasSinging) return 'Singer';
                  return 'Musician';
                })()}
              </span>
            </div>

            <div className="space-y-6">
              {profile?.instrumentTypes && profile.instrumentTypes.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileMusic className="w-5 h-5 text-primary-400" />
                    Instruments
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {profile.instrumentTypes.map(id => {
                      const instrument = INSTRUMENT_TYPES.find(type => type.id === id);
                      if (!instrument) return null;
                      return (
                        <div key={id} className="flex items-center gap-2 px-4 py-2 bg-dark-700/50 backdrop-blur-sm rounded-xl">
                          <span className="text-2xl">{instrument.icon}</span>
                          <span className="text-gray-200 font-medium">{instrument.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {profile?.singingTypes && profile.singingTypes.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary-400" />
                    Singing Styles
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {profile.singingTypes.map(id => {
                      const style = SINGING_TYPES.find(type => type.id === id);
                      if (!style) return null;
                      return (
                        <div key={id} className="flex items-center gap-2 px-4 py-2 bg-dark-700/50 backdrop-blur-sm rounded-xl">
                          <span className="text-2xl">{style.icon}</span>
                          <span className="text-gray-200 font-medium">{style.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!profile?.instrumentTypes?.length && !profile?.singingTypes?.length) && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No musical talents added yet.</p>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="mt-4 px-6 py-2 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors"
                  >
                    Add Your Talents
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-6">
              <BarChart2 size={28} className="text-primary-400 mr-3" />
              <h3 className="text-2xl font-bold">Profile Analytics</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-dark-700/50 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Profile Views</h4>
                <p className="text-2xl font-bold text-white">
                  {profile?.analytics?.profileViews || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-700/50 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Followers</h4>
                <p className="text-2xl font-bold text-white">
                  {profile?.analytics?.followers || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-700/50 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Collaborations</h4>
                <p className="text-2xl font-bold text-white">
                  {profile?.analytics?.collaborations || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-700/50 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Projects</h4>
                <p className="text-2xl font-bold text-white">
                  {profile?.analytics?.projects || 0}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Skills & Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-6">
              <Star size={28} className="text-primary-400 mr-3" />
              <h3 className="text-2xl font-bold">Skills & Interests</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Musical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {profile?.skills?.map((skill: string, index: number) => (
                    <span key={index} className="text-sm text-gray-300">
                      {skill}
                    </span>
                  )) || (
                    <p className="text-gray-400">No skills added yet</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile?.interests?.map((interest: string, index: number) => (
                    <span key={index} className="text-sm text-gray-300">
                      {interest}
                    </span>
                  )) || (
                    <p className="text-gray-400">No interests added yet</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Collaboration Ideas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-6">
              <HandHelping size={28} className="text-secondary-400 mr-3" />
              <h3 className="text-2xl font-bold">Collaboration Ideas for You</h3>
            </div>
            
            {ideasLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader size={24} className="animate-spin text-secondary-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {collaborationIdeas.map((idea, index) => (
                  <div key={index} className="bg-dark-700 p-4 rounded-lg">
                    <p className="text-gray-200">{idea}</p>
                  </div>
                ))}
              </div>
            )}
            
            {!ideasLoading && collaborationIdeas.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-lg flex flex-col items-center">
                <span className="mb-2">🎵</span>
                Complete your profile to get personalized collaboration ideas.
              </p>
            )}
          </motion.div>

          {/* Music Portfolio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileMusic size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  Music Portfolio
                </h3>
              </div>
              <button className="btn-primary text-lg px-6 py-2 rounded-lg shadow-lg hover:bg-primary-600 transition-colors duration-200">Add Track</button>
            </div>
            
            {portfolio.length > 0 ? (
              <div className="space-y-4">
                {portfolio.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-dark-600 rounded flex items-center justify-center">
                        <Music size={24} className="text-primary-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium">{track.title}</h4>
                        <p className="text-sm text-gray-400">{track.genre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{track.duration}</p>
                      <p className="text-sm text-primary-400">{track.plays} plays</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8 text-lg flex flex-col items-center">
                <span className="mb-2">🎵</span>
                No tracks uploaded yet. Start building your portfolio!
              </p>
            )}
          </motion.div>
          
          {/* Music Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <BarChart2 size={28} className="text-primary-400 mr-3" />
              <h3 className="text-2xl font-bold">Music Analytics</h3>
            </div>
            
            {analytics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Total Plays</p>
                  <p className="text-2xl font-semibold">{analytics.totalPlays}</p>
                </div>
                <div className="bg-dark-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Followers</p>
                  <p className="text-2xl font-semibold">{analytics.followers}</p>
                </div>
                <div className="bg-dark-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Collaborations</p>
                  <p className="text-2xl font-semibold">{analytics.collaborations}</p>
                </div>
                <div className="bg-dark-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Monthly Growth</p>
                  <p className="text-2xl font-semibold">{analytics.monthlyGrowth}%</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Start uploading music to see your analytics!
              </p>
            )}
          </motion.div>
          
          {/* Learning & Resources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Book size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Learning & Resources</h3>
              </div>
              <button className="btn-outline text-sm">Browse Courses</button>
            </div>
            
            {learningProgress ? (
              <div className="space-y-4">
                <div className="bg-dark-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">Completed Courses</p>
                    <span className="text-primary-400">{learningProgress.completedCourses}</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${(learningProgress.completedCourses / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {learningProgress.currentCourses.map((course: { id: string; title: string; progress: number }) => (
                  <div key={course.id} className="bg-dark-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{course.title}</h4>
                      <span className="text-primary-400">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-600 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {learningProgress.certificates.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Certificates</h4>
                    <div className="space-y-2">
                      {learningProgress.certificates.map((cert: { id: string; title: string; issueDate: string | Date }) => (
                        <div key={cert.id} className="flex items-center justify-between bg-dark-700 p-3 rounded-lg">
                          <div className="flex items-center">
                            <Award size={16} className="text-primary-400 mr-2" />
                            <span>{cert.title}</span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {typeof cert.issueDate === 'string' ? cert.issueDate : cert.issueDate.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Start your learning journey today!
              </p>
            )}
          </motion.div>
          
          {/* Collaboration Opportunities Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Collaboration Opportunities</h3>
              </div>
              <button className="btn-outline text-sm">Find Collaborators</button>
            </div>
            
            {collaborationOpportunities.length > 0 ? (
              <div className="space-y-4">
                {collaborationOpportunities.map((opp) => (
                  <div key={opp.id} className="bg-dark-700 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{opp.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{opp.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="flex items-center text-sm text-gray-400">
                            <Music size={14} className="mr-1" />
                            {opp.genre}
                          </span>
                          <span className="flex items-center text-sm text-gray-400">
                            <Calendar size={14} className="mr-1" />
                            {opp.deadline}
                          </span>
                        </div>
                      </div>
                      <button className="btn-primary text-sm">Connect</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                No collaboration opportunities found. Update your profile to get matched!
              </p>
            )}
          </motion.div>

          {/* Music Journey Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Music Journey Timeline</h3>
              </div>
              <button className="btn-outline text-sm">Add Milestone</button>
            </div>
            
            <div className="space-y-4">
              {musicEvents.map((event) => (
                <div key={event.id} className="relative pl-8 pb-4 border-l-2 border-primary-500">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary-500"></div>
                  <div className="bg-dark-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        event.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="flex items-center text-sm text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        {typeof event.date === 'string' ? event.date : event.date.toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-sm text-gray-400">
                        <MapPin size={14} className="mr-1" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Skill Progress Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Skill Progress</h3>
              </div>
              <button className="btn-outline text-sm">Update Progress</button>
            </div>
            
            <div className="space-y-4">
              {skillProgress.map((skill) => (
                <div key={skill.skill} className="bg-dark-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{skill.skill}</h4>
                    <span className="text-primary-400">Level {skill.level}</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${(skill.level / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Short-term Goal</p>
                      <p className="text-sm">{skill.goals.shortTerm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Long-term Goal</p>
                      <p className="text-sm">{skill.goals.longTerm}</p>
                    </div>
                  </div>
                  {skill.achievements.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Recent Achievements</p>
                      <div className="space-y-2">
                        {skill.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Star size={14} className="text-yellow-400 mr-2" />
                            {achievement}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Practice Session Logger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Headphones size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Practice Sessions</h3>
              </div>
              <button className="btn-outline text-sm">Log Session</button>
            </div>
            
            <div className="space-y-4">
              {practiceSessions.map((session) => (
                <div key={session.id} className="bg-dark-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Clock size={16} className="text-primary-400 mr-2" />
                      <span className="text-sm text-gray-400">
                        {typeof session.date === 'string' ? session.date : session.date.toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-primary-400">{session.duration} minutes</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-400">Focus Area</p>
                      <p className="text-sm">{session.focus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Mood</p>
                      <p className="text-sm">{session.mood}</p>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-gray-400 mt-2">{session.notes}</p>
                  )}
                  {session.achievements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Achievements</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {session.achievements.map((achievement, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Music Community Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="glass-card rounded-2xl p-6 mb-8 shadow-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users size={28} className="text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Community Feed</h3>
              </div>
              <button className="btn-outline text-sm">Share Update</button>
            </div>
            
            <div className="space-y-4">
              {communityFeed.map((post) => (
                <div key={post.id} className="bg-dark-700 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-dark-600 overflow-hidden flex-shrink-0">
                      {post.userImage ? (
                        <img src={post.userImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{post.userName}</h4>
                          <p className="text-sm text-gray-400">
                            {typeof post.timestamp === 'string' ? post.timestamp : post.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                          <Share2 size={16} />
                        </button>
                      </div>
                      <p className="mt-2">{post.content}</p>
                      {post.media && (
                        <div className="mt-3">
                          {post.media.type === 'image' && (
                            <img 
                              src={post.media.url} 
                              alt="" 
                              className="rounded-lg max-h-64 object-cover"
                            />
                          )}
                          {post.media.type === 'video' && (
                            <video 
                              src={post.media.url} 
                              controls 
                              className="rounded-lg max-h-64 w-full"
                            />
                          )}
                          {post.media.type === 'audio' && (
                            <audio 
                              src={post.media.url} 
                              controls 
                              className="w-full"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 mt-3">
                        <button className="flex items-center text-gray-400 hover:text-white">
                          <Heart size={16} className="mr-1" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center text-gray-400 hover:text-white">
                          <MessageCircle size={16} className="mr-1" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Inside the profile view */}
         
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-dark-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-primary-500/20"
            >
              <div className="sticky top-0 z-10 bg-dark-800 px-6 py-4 border-b border-dark-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="p-2 hover:bg-dark-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 70px)' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32">
                      <div className="w-full h-full rounded-full border-4 border-dark-700 overflow-hidden bg-dark-600">
                        {editForm.previewURL ? (
                          <img 
                            src={editForm.previewURL} 
                            alt="Profile Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={40} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-600 transition-colors group">
                        <Camera size={18} className="text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange} 
                        />
                        <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-dark-900 text-sm text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Change Photo
                        </span>
                      </label>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Click the camera icon to change your profile picture</p>
                  </div>

                  <div className="space-y-6">
                    <TalentTypeSelector
                      types={INSTRUMENT_TYPES}
                      selectedTypes={editForm.instrumentTypes}
                      onChange={(types) => setEditForm(prev => ({ ...prev, instrumentTypes: types }))}
                      title="What instruments do you play?"
                      icon={Music}
                    />
                    <TalentTypeSelector
                      types={SINGING_TYPES}
                      selectedTypes={editForm.singingTypes}
                      onChange={(types) => setEditForm(prev => ({ ...prev, singingTypes: types }))}
                      title="What are your singing styles?"
                      icon={Mic}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-400 mb-2 text-sm font-medium">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2 text-sm font-medium">Country</label>
                      <CountrySelect value={editForm.countryCode} onChange={(value) => setEditForm(prev => ({ ...prev, countryCode: value }))} />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2 text-sm font-medium">Phone Number</label>
                      <div className="phone-input-dark">
                        <PhoneInput
                          country={'lk'}
                          value={editForm.contactNumber}
                          onChange={(phone) => setEditForm(prev => ({ ...prev, contactNumber: phone }))}
                          inputClass="w-full !bg-[#121212] !border-[#2a2a2a] rounded-lg px-4 py-3 !text-white focus:!outline-none focus:!border-primary-500 transition-colors !text-lg"
                          containerClass="phone-input-dark"
                          buttonClass="!bg-[#121212] !border-[#2a2a2a] !border-r-0"
                          dropdownClass="!bg-[#121212] !border-[#2a2a2a]"
                          searchClass="!bg-[#121212] !text-white !border-[#2a2a2a]"
                          placeholder="+94 XXXXXXXXX"
                          preferredCountries={['lk']}
                          enableSearch={true}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2 text-sm font-medium">Personal Bio</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors h-32 resize-none custom-scrollbar"
                      required
                    ></textarea>
                    <p className="text-sm text-gray-400 mt-1">Write a brief description about yourself and your musical journey</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2 text-sm font-medium">Talent Description</label>
                    <textarea
                      name="talentDescription"
                      value={editForm.talentDescription}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors h-32 resize-none custom-scrollbar"
                      placeholder="Describe your musical talents, specialties, and what makes you unique..."
                    ></textarea>
                  </div>

                  <div className="sticky bottom-0 bg-dark-800 -mx-6 -mb-6 px-6 py-4 border-t border-dark-700 flex justify-end space-x-3">
                    <button 
                      type="button" 
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-dark-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader size={16} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Responsive Footer */}
      
    </div>
  );
};

export default UserProfilePage;

<style>
{`
.phone-input-dark .react-tel-input .form-control {
  background-color: #1a1a1a !important;
  border-color: #333333 !important;
  color: #ffffff !important;
  height: 48px !important;
  font-size: 1.125rem !important;
  width: 100% !important;
}

.phone-input-dark .react-tel-input .selected-flag {
  background-color: #1a1a1a !important;
  border-right: 1px solid #333333 !important;
}

.phone-input-dark .react-tel-input .country-list {
  background-color: #1a1a1a !important;
  border-color: #333333 !important;
  max-height: 300px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.phone-input-dark .react-tel-input .country-list .country {
  color: #e0e0e0 !important;
  display: flex !important;
  align-items: center !important;
  padding: 12px !important;
  transition: all 0.2s ease !important;
}

.phone-input-dark .react-tel-input .country-list .country .country-name {
  color: #e0e0e0 !important;
  font-size: 0.95rem !important;
  margin-left: 12px !important;
  font-weight: 400 !important;
}

.phone-input-dark .react-tel-input .country-list .country .dial-code {
  color: #888888 !important;
  font-size: 0.9rem !important;
  margin-left: auto !important;
}

.phone-input-dark .react-tel-input .country-list .country:hover {
  background-color: #2c2c2c !important;
}

.phone-input-dark .react-tel-input .country-list .country.highlight {
  background-color: #2c2c2c !important;
}

.phone-input-dark .react-tel-input .country-list .country.active {
  background-color: #333333 !important;
}

.phone-input-dark .react-tel-input .search-box {
  background-color: #1a1a1a !important;
  border-color: #333333 !important;
  color: #ffffff !important;
  font-size: 1rem !important;
  padding: 12px !important;
  margin: 6px !important;
  border-radius: 4px !important;
}

.phone-input-dark .react-tel-input .search-box::placeholder {
  color: #888888 !important;
}

.phone-input-dark .react-tel-input .flag-dropdown {
  border-color: #333333 !important;
  background-color: #1a1a1a !important;
  border-radius: 4px 0 0 4px !important;
}

.phone-input-dark .react-tel-input .selected-flag:hover,
.phone-input-dark .react-tel-input .selected-flag:focus {
  background-color: #2c2c2c !important;
}

.phone-input-dark .react-tel-input .country-list::-webkit-scrollbar {
  width: 8px !important;
}

.phone-input-dark .react-tel-input .country-list::-webkit-scrollbar-track {
  background: #1a1a1a !important;
}

.phone-input-dark .react-tel-input .country-list::-webkit-scrollbar-thumb {
  background: #4d4d4d !important;
  border-radius: 4px !important;
}

.phone-input-dark .react-tel-input .country-list::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
`}
</style>