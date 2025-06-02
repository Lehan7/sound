import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Camera, Save, Plus, Trash2, Music, MapPin, Calendar, Mail } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  country: string;
  instrument: string;
  bio?: string;
  genres?: string[];
  experience?: string;
  website?: string;
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    soundcloud?: string;
  };
}

const UserProfile: React.FC = () => {
  const { user, updateUserInfo } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    country: user?.country || '',
    instrument: user?.instrument || '',
    bio: user?.bio || '',
    genres: user?.genres || [],
    experience: user?.experience || '',
    website: user?.website || '',
    socialLinks: user?.socialLinks || {
      youtube: '',
      instagram: '',
      twitter: '',
      facebook: '',
      soundcloud: ''
    }
  });
  
  const [activeTab, setActiveTab] = useState<string>('general');
  const [newGenre, setNewGenre] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>(user?.profileImage || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProfileData],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGenre = () => {
    if (newGenre && !profileData.genres?.includes(newGenre)) {
      setProfileData(prev => ({
        ...prev,
        genres: [...(prev.genres || []), newGenre]
      }));
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setProfileData(prev => ({
      ...prev,
      genres: prev.genres?.filter(g => g !== genre) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, you'd upload the image to a server here
      // For now, we'll just simulate it
      let updatedProfileImage = profileImage;
      
      if (imageFile) {
        // In a real app, this would be an API call to upload the image
        // For now, we'll just use the data URL
        console.log('Image would be uploaded here');
        // updatedProfileImage would come from the server response
      }
      
      // Preserve existing user data while updating profile
      if (user) {
        await updateUserInfo({
          ...user,
          ...profileData,
          profileImage: updatedProfileImage
        });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-indigo-900/20 to-purple-900/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="glass rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="mb-6 md:mb-0 md:mr-8 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-indigo-800/50 flex items-center justify-center border-2 border-indigo-500">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={profileData.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-indigo-300" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full hover:bg-indigo-700 transition-colors"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
                <p className="text-indigo-300">{profileData.instrument}</p>
                <p className="text-gray-400">{profileData.country}</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center bg-indigo-900/40 px-3 py-1.5 rounded-lg">
                  <Music className="w-4 h-4 text-indigo-400 mr-2" />
                  <span className="text-sm text-gray-300">{profileData.instrument || 'No instrument'}</span>
                </div>
                <div className="flex items-center bg-indigo-900/40 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-4 h-4 text-indigo-400 mr-2" />
                  <span className="text-sm text-gray-300">{profileData.country || 'Location not set'}</span>
                </div>
                <div className="flex items-center bg-indigo-900/40 px-3 py-1.5 rounded-lg">
                  <Mail className="w-4 h-4 text-indigo-400 mr-2" />
                  <span className="text-sm text-gray-300">{profileData.email}</span>
                </div>
              </div>
              
              <p className="text-gray-300 italic">
                {profileData.bio || "This musician hasn't added a bio yet."}
              </p>
              
              <div className="mt-4">
                <h3 className="text-sm uppercase text-indigo-400 font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.genres && profileData.genres.length > 0 ? (
                    profileData.genres.map(genre => (
                      <span key={genre} className="px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded-full">
                        {genre}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No genres added</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Tabs */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex border-b border-indigo-800">
            <button 
              className={`px-5 py-3 text-sm font-medium ${activeTab === 'general' ? 'bg-indigo-800/50 text-white' : 'text-indigo-300 hover:text-white'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`px-5 py-3 text-sm font-medium ${activeTab === 'biography' ? 'bg-indigo-800/50 text-white' : 'text-indigo-300 hover:text-white'}`}
              onClick={() => setActiveTab('biography')}
            >
              Biography
            </button>
            <button 
              className={`px-5 py-3 text-sm font-medium ${activeTab === 'social' ? 'bg-indigo-800/50 text-white' : 'text-indigo-300 hover:text-white'}`}
              onClick={() => setActiveTab('social')}
            >
              Social Links
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* General Info Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                    Country
                  </label>
                  <select 
                    id="country" 
                    name="country"
                    value={profileData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select your country</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Brazil">Brazil</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="instrument" className="block text-sm font-medium text-gray-300 mb-1">
                    Primary Instrument
                  </label>
                  <input
                    type="text"
                    id="instrument"
                    name="instrument"
                    value={profileData.instrument}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Guitar, Piano, Vocals"
                  />
                </div>
                
                <div>
                  <label htmlFor="genres" className="block text-sm font-medium text-gray-300 mb-1">
                    Music Genres
                  </label>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      id="newGenre"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Rock, Jazz, Classical"
                    />
                    <button
                      type="button"
                      onClick={handleAddGenre}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.genres?.map((genre, index) => (
                      <div key={index} className="flex items-center bg-indigo-800/40 rounded-full pl-3 pr-2 py-1">
                        <span className="text-sm text-white mr-1">{genre}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGenre(genre)}
                          className="text-indigo-300 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Biography Tab */}
            {activeTab === 'biography' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                    Biography
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell us about your musical journey..."
                  />
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-1">
                    Musical Experience
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={profileData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select your experience level</option>
                    <option value="Beginner">Beginner (0-2 years)</option>
                    <option value="Intermediate">Intermediate (3-5 years)</option>
                    <option value="Advanced">Advanced (5-10 years)</option>
                    <option value="Professional">Professional (10+ years)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={profileData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            )}
            
            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="socialLinks.youtube" className="block text-sm font-medium text-gray-300 mb-1">
                    YouTube Channel
                  </label>
                  <input
                    type="url"
                    id="youtube"
                    name="socialLinks.youtube"
                    value={profileData.socialLinks?.youtube}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://youtube.com/c/yourchannel"
                  />
                </div>
                
                <div>
                  <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-300 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="socialLinks.instagram"
                    value={profileData.socialLinks?.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="@yourusername"
                  />
                </div>
                
                <div>
                  <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-300 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    id="twitter"
                    name="socialLinks.twitter"
                    value={profileData.socialLinks?.twitter}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="@yourusername"
                  />
                </div>
                
                <div>
                  <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-300 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="socialLinks.facebook"
                    value={profileData.socialLinks?.facebook}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div>
                  <label htmlFor="socialLinks.soundcloud" className="block text-sm font-medium text-gray-300 mb-1">
                    SoundCloud
                  </label>
                  <input
                    type="url"
                    id="soundcloud"
                    name="socialLinks.soundcloud"
                    value={profileData.socialLinks?.soundcloud}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-indigo-900/30 border border-indigo-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://soundcloud.com/yourusername"
                  />
                </div>
              </div>
            )}
            
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;