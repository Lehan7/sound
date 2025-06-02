import React, { useState, useRef, useEffect } from 'react';
import { Music, Globe, Heart, Info, Play, Users, Star, Sparkles } from 'lucide-react';

// Optimized image component with proper loading attributes
const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  ...props 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  [key: string]: any 
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className || ''}`}
      loading="lazy" 
      decoding="async" 
      {...props} 
    />
  );
};

/**
 * FriendsForPeaceLogo Component
 * 
 * A professional component to showcase the Friends for Peace
 * project by SoundAlchemy.
 */
const FriendsForPeaceLogo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  // Add CSS for scrollbar customization
  useEffect(() => {
    // Add CSS to remove double scrollbars
    const style = document.createElement('style');
    style.textContent = `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Optimize rendering with intersection observer
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVideoVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  
  // Control video playback based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = 0.6;
    
    if (isVideoVisible) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVideoVisible]);

  return (
    <div ref={sectionRef} className="w-full py-8 bg-gradient-to-b from-[#0a0a16] to-[#0c0c1d] overflow-hidden">
      {/* Essential background elements - reduced for performance */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="text-center mb-10">
        <div><br /><br /><br /><br />
        </div>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-indigo-900/40 rounded-full text-indigo-200 text-sm mb-4 border border-indigo-500/30 backdrop-blur-sm">
            <Globe className="h-4 w-4" />
            <span>SoundAlchemy Presents</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Friends for Peace
            </span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
            A global musical collaboration bringing together artists from over 30 countries
          </p>
        </div>
        
        {/* Section Navigation - Improved for better mobile experience */}
        <div className="mb-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center space-x-3 min-w-max py-2">
            <a href="#video-section" className="px-4 py-2 rounded-full bg-indigo-900/40 hover:bg-indigo-800/60 text-white text-sm font-medium border border-indigo-500/30 transition-colors flex items-center">
              <Play className="h-3.5 w-3.5 mr-2" />
              Video
            </a>
            <a href="#about-section" className="px-4 py-2 rounded-full bg-indigo-900/40 hover:bg-indigo-800/60 text-white text-sm font-medium border border-indigo-500/30 transition-colors flex items-center">
              <Info className="h-3.5 w-3.5 mr-2" />
              About
            </a>
            <a href="#musicians-section" className="px-4 py-2 rounded-full bg-indigo-900/40 hover:bg-indigo-800/60 text-white text-sm font-medium border border-indigo-500/30 transition-colors flex items-center">
              <Users className="h-3.5 w-3.5 mr-2" />
              Musicians
            </a>
            <a href="#team-section" className="px-4 py-2 rounded-full bg-indigo-900/40 hover:bg-indigo-800/60 text-white text-sm font-medium border border-indigo-500/30 transition-colors flex items-center">
              <Heart className="h-3.5 w-3.5 mr-2" />
              Team
            </a>
          </div>
        </div>
        
        {/* Video section - Optimized for performance */}
        <div id="video-section" className="relative mb-16">
          {/* Enhanced video title for mobile */}
          <div className="md:hidden text-center mb-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
              Earth: Our Shared Home
            </h2>
            <p className="text-gray-300 text-sm">A visual journey across our planet</p>
          </div>
        
          <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-lg border border-indigo-500/30">
            <video 
              ref={videoRef}
              autoPlay={isVideoVisible}
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
              preload="metadata"
              poster="/assert/we are the world cover images/video/earth-poster.jpg"
            >
              <source src="/assert/we are the world cover images/video/Earth.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Play button overlay */}
            <button 
              onClick={() => setIsVideoModalOpen(true)}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="Play full video"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600/80 rounded-full flex items-center justify-center transform transition-all group-hover:scale-110 group-hover:bg-indigo-500/90">
                <Play className="h-6 w-6 md:h-8 md:w-8 text-white ml-1" />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
            </button>
          </div>
          
          {/* Video caption */}
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
            <div className="px-5 py-2 rounded-full inline-flex items-center space-x-2 shadow-md bg-indigo-900/40 border border-indigo-500/30">
              <Globe className="h-4 w-4 text-indigo-300" />
              <span className="text-white font-medium text-sm">A Worldwide Collaboration</span>
            </div>
          </div>
        </div>
        
        {/* Mobile-specific logo section */}
        <div className="md:hidden mb-16" id="mobile-logo-section">
          <div className="relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-xl border border-indigo-500/30">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-lg shadow-[0_0_15px_rgba(79,70,229,0.5)] p-4 mb-6 border border-indigo-500/30">
                <OptimizedImage 
                  src="/assert/we are the world cover images/freinds for peace logo by soundAlchemy.png" 
                  alt="Friends for Peace Logo by SoundAlchemy"
                  className="w-full h-full object-contain rounded-full"
                  width={128}
                  height={128}
                />
              </div>
              
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-2">Friends for Peace</h3>
              <p className="text-center text-gray-300 text-sm">
                A global initiative bringing together musicians from over 13 countries with a message of unity and hope.
              </p>
            </div>
          </div>
        </div>

        {/* Main Logo and Info Section - Optimized */}
        <div id="about-section" className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
          {/* Logo Display - Simplified for better performance */}
          <div className="hidden md:block w-full lg:w-1/2">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Background glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl"></div>
              
              {/* Main Logo Container */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-lg shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center p-6">
                {/* Logo Image */}
                <OptimizedImage 
                  src="/assert/we are the world cover images/freinds for peace logo by soundAlchemy.png" 
                  alt="Friends for Peace Logo by SoundAlchemy"
                  className="w-full h-full object-contain rounded-full transition-transform duration-300"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>
          
          {/* Information Section */}
          <div className="w-full lg:w-1/2 text-white">
            {/* Enhanced mobile about section header */}
            <div className="md:hidden text-center mb-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                About The Project
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mt-2"></div>
            </div>
            
            {/* Name Creator Highlight */}
            <div className="mb-6">
              <div className="p-4 border border-pink-500/30 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-purple-500 text-xs text-white px-4 py-1 rounded-bl-lg font-medium">
                  Name Origin
                </div>
                <div className="pt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="text-pink-300 font-semibold">Elena (Sofia)</span>, SoundAlchemy's Creative Director, created the name <span className="text-white font-semibold">"Friends for Peace"</span> to embody the spirit of global musical unity.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              The Friends for Peace logo represents SoundAlchemy's flagship global collaborative project, 
              bringing together over 26 musicians from more than 13 countries to create a musical message of unity and hope.
            </p>
            
            <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-5 mb-6">
              <h3 className="text-xl font-semibold text-indigo-300 mb-3 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-pink-400" />
                Relationship with SoundAlchemy
              </h3>
              <p className="text-gray-300">
                Created by SoundAlchemy founder Lehan Kawshila, Friends for Peace represents the organization's 
                commitment to using music as a universal language that transcends borders and brings people together. 
                The project's inspirational name was conceptualized by <span className="font-semibold text-pink-300">Elena (Sofia)</span>, SoundAlchemy's Creative Director.
              </p>
            </div>
            
            {/* Mobile-optimized feature cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg p-4 border border-indigo-500/20">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-900 p-2 rounded-full mb-3">
                    <Globe className="h-5 w-5 text-indigo-300" />
                  </div>
                  <h4 className="font-semibold mb-1">Global Collaboration</h4>
                  <p className="text-sm text-indigo-200">Uniting artists across borders</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500/20">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-purple-900 p-2 rounded-full mb-3">
                    <Heart className="h-5 w-5 text-purple-300" />
                  </div>
                  <h4 className="font-semibold mb-1">Message of Peace</h4>
                  <p className="text-sm text-purple-200">Musical activism for unity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Musicians Photo Showcase - Optimized */}
        <div id="musicians-section" className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
              Our Global Musical Collective
            </span>
          </h2>
          
          {/* Mobile subheading */}
          <p className="text-center text-gray-300 mb-8 text-sm md:text-base max-w-md mx-auto">
            Musicians from over 13 countries uniting their voices and instruments in harmony
          </p>
          
          <div className="relative">
            {/* Musicians photo container */}
            <div className="p-2 sm:p-4 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
              {/* Mobile visual enhancement */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/10 to-purple-600/10 pointer-events-none md:hidden"></div>
            
              <div className="aspect-w-16 aspect-h-9 md:aspect-w-21 md:aspect-h-9 rounded-xl overflow-hidden">
                <OptimizedImage
                  src="/assert/we are the world cover images/all musicians photo.webp"
                  alt="Friends for Peace - Global Musicians Collaboration"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  width={1200}
                  height={675}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                
                {/* Musician count badge - Enhanced for mobile */}
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 border-2 border-indigo-900 flex items-center justify-center">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600 border-2 border-indigo-900 flex items-center justify-center"></div>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-pink-600 border-2 border-indigo-900 flex items-center justify-center"></div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                      <span className="text-white text-sm md:text-base font-medium">24+ Musicians</span>
                    </div>
                  </div>
                </div>
                
                {/* Country count badge */}
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 md:h-5 md:w-5 text-indigo-300" />
                    <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                      <span className="text-white text-sm md:text-base font-medium">13+ Countries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile call-to-action for musicians - Makes mobile experience more engaging */}
            <div className="mt-5 md:hidden">
              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-4 border border-indigo-500/20">
                <p className="text-center text-gray-300 text-sm mb-3">
                  Interested in joining our next global collaboration?
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Learn How to Participate
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Project Info Section - Team Section - Enhanced for mobile */}
        <div id="team-section" className="mt-14 border-t border-indigo-500/30 pt-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                The Team Behind the Vision
              </span>
            </h3>
            
            {/* Enhanced mobile description */}
            <div className="flex items-center justify-center mb-2">
              <div className="h-0.5 w-8 bg-indigo-500/50 rounded-full"></div>
              <div className="px-3">
                <Star className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="h-0.5 w-8 bg-indigo-500/50 rounded-full"></div>
            </div>
            
            <p className="text-gray-300 max-w-3xl mx-auto text-sm md:text-base">
              Meet the visionaries who brought together musicians from across the globe
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {/* Founder - Enhanced mobile design */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 rounded-xl p-5 border border-indigo-500/20 transition-transform hover:scale-[1.02]">
              <div className="absolute top-2 right-2 bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 rounded-full text-xs">
                <span className="font-semibold text-white">Founder</span>
              </div>
              
              <div className="flex flex-col items-center text-center">
                {/* Mobile optimized profile image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-indigo-500/70 mb-4 relative shadow-lg">
                  <OptimizedImage
                    src="/assert/team/lehan.jpg"
                    alt="Lehan Kawshila - Founder"
                    className="w-full h-full object-cover"
                    width={112}
                    height={112}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent opacity-60"></div>
                </div>
                
                {/* Name and title */}
                <h4 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 mb-2">Lehan Kawshila</h4>
                <div className="bg-gradient-to-r from-indigo-700/60 to-purple-700/60 px-3 py-1 rounded-full text-xs text-indigo-100 mb-3 shadow-md border border-indigo-500/40">
                  <span className="font-medium">Founder & Visionary Strategist</span>
                </div>
                
                {/* Mobile optimized description */}
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10 mb-3">
                  The inspirational architect behind Friends for Peace and SoundAlchemy, 
                  bringing together artists from over 30 countries with his visionary leadership.
                </p>
                
                {/* Skills - Mobile friendly layout */}
                <div className="grid grid-cols-3 gap-2 w-full">
                  <div className="px-2 py-1 rounded-lg bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 text-xs flex flex-col items-center">
                    <Globe className="h-3 w-3 mb-1 text-indigo-400" />
                    <span className="text-[10px] sm:text-xs">Global Unifier</span>
                  </div>
                  
                  <div className="px-2 py-1 rounded-lg bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs flex flex-col items-center">
                    <Sparkles className="h-3 w-3 mb-1 text-purple-400" />
                    <span className="text-[10px] sm:text-xs">Visionary</span>
                  </div>
                  
                  <div className="px-2 py-1 rounded-lg bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 text-xs flex flex-col items-center">
                    <Star className="h-3 w-3 mb-1 text-indigo-400" />
                    <span className="text-[10px] sm:text-xs">Strategist</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Co-founder/Music Director - Mobile optimized */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 rounded-xl p-5 border border-blue-500/20 transition-transform hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-blue-500/50 mb-4 relative">
                  <OptimizedImage
                    src="/assert/team/antonio.jpg"
                    alt="Antonio Papa - Music Director"
                    className="w-full h-full object-cover"
                    width={112}
                    height={112}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent opacity-60"></div>
                  <div className="absolute -bottom-0.5 left-0 right-0 h-5 sm:h-6 bg-blue-600/70 backdrop-blur-sm flex items-center justify-center">
                    <Music className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white mr-1" />
                    <span className="text-[10px] sm:text-xs text-white font-medium">Music</span>
                  </div>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400 mb-2">Antonio Papa</h4>
                <div className="bg-gradient-to-r from-blue-700/60 to-indigo-700/60 px-3 py-1 rounded-full text-xs text-blue-100 mb-3 shadow-md border border-blue-500/40">
                  <span className="font-medium">Co-founder & Music Director</span>
                </div>
                
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed bg-blue-900/10 p-3 rounded-lg border border-blue-500/10 mb-3">
                  The virtuoso maestro behind the musical magic, 
                  transforming raw talent into symphonic brilliance with precision and expertise.
                </p>
                
                {/* Skills - Mobile optimized */}
                <div className="grid grid-cols-3 gap-2 w-full">
                  <div className="px-2 py-1 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-500/30 text-xs flex flex-col items-center">
                    <Music className="h-3 w-3 mb-1 text-blue-400" />
                    <span className="text-[10px] sm:text-xs">Audio Engineer</span>
                  </div>
                  
                  <div className="px-2 py-1 rounded-lg bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 text-xs flex flex-col items-center">
                    <span className="text-sm mb-0.5">♫</span>
                    <span className="text-[10px] sm:text-xs">Arrangement</span>
                  </div>
                  
                  <div className="px-2 py-1 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-500/30 text-xs flex flex-col items-center">
                    <span className="text-sm mb-0.5">🎚️</span>
                    <span className="text-[10px] sm:text-xs">Mix & Master</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Creative Director - Mobile optimized */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-5 border border-purple-500/20 transition-transform hover:scale-[1.02]">
              <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1 rounded-full text-xs">
                <span className="font-semibold text-white">Naming Visionary</span>
              </div>
              
              <div className="flex flex-col items-center text-center">
                {/* Mobile optimized profile image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-pink-500/70 mb-4 relative shadow-lg">
                  <OptimizedImage
                    src="/assert/team/sofia.jpg"
                    alt="Elena (Sofia) - Creative Director"
                    className="w-full h-full object-cover"
                    width={112}
                    height={112}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 to-transparent opacity-60"></div>
                  <div className="absolute -bottom-0.5 left-0 right-0 h-5 sm:h-6 bg-pink-600/80 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white mr-1" />
                    <span className="text-[10px] sm:text-xs text-white font-medium">Creative</span>
                  </div>
                </div>
                
                {/* Name and title */}
                <h4 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 mb-2">Elena (Sofia)</h4>
                
                <div className="bg-gradient-to-r from-pink-700/60 to-purple-700/60 px-3 py-1 rounded-full text-xs text-pink-100 mb-3 shadow-md border border-pink-500/40">
                  <span className="font-medium">Co-Founder & Creative Director</span>
                </div>
                
                {/* Description - Mobile optimized */}
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed bg-pink-900/10 p-3 rounded-lg border border-pink-500/10 mb-3">
                  The creative soul who conceptualized the project's powerful name, embodying its essence of global unity through her extraordinary artistic vision.
                </p>
                
                {/* Skills - Mobile optimized */}
                <div className="grid grid-cols-3 gap-2 w-full">
                  <div className="px-2 py-1 rounded-lg bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs flex flex-col items-center">
                    <Sparkles className="h-3 w-3 mb-1 text-purple-400" />
                    <span className="text-[10px] sm:text-xs">Concept Creation</span>
                  </div>
                  
                  <div className="px-2 py-1 rounded-lg bg-pink-900/40 text-pink-300 border border-pink-500/30 text-xs flex flex-col items-center">
                    <Heart className="h-3 w-3 mb-1 text-pink-400" />
                    <span className="text-[10px] sm:text-xs">Naming</span>
                  </div>
                  
                  <div className="px-2 py-1 rounded-lg bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs flex flex-col items-center">
                    <span className="text-sm mb-0.5">🎨</span>
                    <span className="text-[10px] sm:text-xs">Visual Design</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Collaborative Info - Simplified */}
          <div className="glass p-5 rounded-xl bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-indigo-900/30 backdrop-blur-sm border border-indigo-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-6">
                <h4 className="text-xl font-semibold text-indigo-300 mb-2">A Collaborative Effort</h4>
                <p className="text-gray-300">
                  Through their combined vision, expertise, and dedication, 
                  <span className="text-indigo-300 font-medium"> Lehan</span>,
                  <span className="text-blue-300 font-medium"> Antonio</span>, and
                  <span className="text-pink-300 font-medium"> Elena</span> have created a platform that brings together musicians from 
                  diverse backgrounds to create something truly special and impactful.
                </p>
              </div>
              
              {/* Team photo collage */}
              <div className="flex-shrink-0">
                <div className="flex">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 z-30">
                    <OptimizedImage 
                      src="/assert/team/lehan.jpg"
                      alt="Lehan" 
                      className="w-full h-full object-cover"
                      width={64} 
                      height={64}
                    />
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 -ml-4 z-20">
                    <OptimizedImage 
                      src="/assert/team/antonio.jpg"
                      alt="Antonio" 
                      className="w-full h-full object-cover"
                      width={64} 
                      height={64}
                    />
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 -ml-4 z-10">
                    <OptimizedImage 
                      src="/assert/team/sofia.jpg"
                      alt="Sofia" 
                      className="w-full h-full object-cover"
                      width={64} 
                      height={64}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to action buttons - Simplified */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pb-20 md:pb-10">
          <button 
            onClick={() => setIsVideoModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            <Play className="h-5 w-5 mr-2" />
            Watch Full Video
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-indigo-500 text-indigo-300 hover:bg-indigo-900/30 px-6 py-3 rounded-full font-medium transition-colors"
          >
            <Info className="h-5 w-5 mr-2" />
            Learn More
          </button>
        </div>
      </div>
      
      {/* Modal for additional information - Optimized */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-gradient-to-br from-[#0c0c1d] to-[#0a0a16] rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto no-scrollbar">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-4">About Friends for Peace</h3>
            
            <div className="text-gray-300 space-y-4">
              <p>
                Friends for Peace is a global musical collaboration project organized by SoundAlchemy, inspired by the iconic "We Are The World" charity single.
              </p>
              
              <p>
                This initiative brings together musicians from over 30 countries to create a powerful message of unity, peace, and hope through music. The project represents SoundAlchemy's commitment to breaking down barriers through musical collaboration.
              </p>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex-shrink-0 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-pink-300" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-pink-300 mb-1">Name Origin</h5>
                    <p className="text-gray-300">
                      The name <span className="font-semibold text-white">"Friends for Peace"</span> was created by <span className="font-semibold text-pink-300">Elena (Sofia)</span>, SoundAlchemy's Creative Director. Her vision was to capture the essence of global unity and collaboration that forms the core of this musical initiative.
                    </p>
                  </div>
                </div>
              </div>
              
              <h4 className="text-xl font-semibold text-indigo-300 mt-6 mb-3">Our Mission</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Promote cross-cultural understanding and collaboration</li>
                <li>Create musical content that inspires positive change</li>
                <li>Support humanitarian causes through artistic expression</li>
                <li>Showcase the power of music as a universal language</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Modal - Optimized */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-10 right-0 text-gray-400 hover:text-white p-2"
              aria-label="Close video"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl">
              <video 
                className="w-full h-full object-cover"
                controls
                autoPlay
                poster="/assert/we are the world cover images/video/earth-poster.jpg"
              >
                <source src="/assert/we are the world cover images/video/Earth.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <h3 className="text-xl font-semibold text-center text-white mt-4">Friends for Peace - A Global Musical Tribute</h3>
          </div>
        </div>
      )}
      
      {/* Enhanced Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="px-2 py-2 backdrop-blur-lg bg-indigo-900/90 border-t border-indigo-500/50 shadow-lg">
          <div className="flex justify-around items-center">
            <a href="#video-section" className="flex flex-col items-center text-indigo-200 active:text-white">
              <div className="w-9 h-9 rounded-full bg-indigo-800/60 flex items-center justify-center mb-1">
                <Play className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs">Earth Video</span>
            </a>
            
            <a href="#mobile-logo-section" className="flex flex-col items-center text-indigo-200 active:text-white">
              <div className="w-9 h-9 rounded-full bg-purple-800/60 flex items-center justify-center mb-1">
                <Music className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs">Our Logo</span>
            </a>
            
            <a href="#musicians-section" className="flex flex-col items-center text-indigo-200 active:text-white">
              <div className="w-9 h-9 rounded-full bg-blue-800/60 flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs">Musicians</span>
            </a>
            
            <a href="#team-section" className="flex flex-col items-center text-indigo-200 active:text-white">
              <div className="w-9 h-9 rounded-full bg-pink-800/60 flex items-center justify-center mb-1">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs">Team</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Extra padding div to prevent content from being hidden behind fixed mobile navigation */}
      <div className="h-20 md:h-8 w-full"></div>
    </div>
  );
};

export default FriendsForPeaceLogo; 