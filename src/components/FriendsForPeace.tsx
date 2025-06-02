import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Music, Globe, Users, Heart, Mic, Lightbulb, Sparkles, Wand2, Star, Award, Zap, Radio, Disc } from 'lucide-react';

// Performance optimization component
  const OptimizedImage = ({ src, alt, className, ...props }: { src: string, alt: string, className: string, [key: string]: any }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} mobile-optimized-image`}
      loading="eager" 
      decoding="async" 
      data-fetchpriority="high" 
      onDragStart={(e: React.DragEvent<HTMLImageElement>) => e.preventDefault()}
      draggable="false"
      {...props} 
    />
  );
};

const FriendsForPeace = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Optimize rendering with intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6;
      
      // Optimize video playback
      if (isIntersecting) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
    
    return () => {
      // Cleanup function
    };
  }, [isVideoLoaded, isIntersecting]);

  return (
    <section ref={sectionRef} id="friends-for-peace" className="py-20 bg-gradient-to-b from-[#0a0a16] to-[#0c0c1d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Title Section */}
        <div className="relative mb-24">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: "1.5s"}}></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: "0.8s"}}></div>
          <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: "2.2s"}}></div>
          
          {/* Animated particle effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/5 h-2 w-2 bg-indigo-500 rounded-full animate-ping-slow" style={{animationDelay: "0s"}}></div>
            <div className="absolute top-3/4 left-1/3 h-2 w-2 bg-purple-500 rounded-full animate-ping-slow" style={{animationDelay: "0.7s"}}></div>
            <div className="absolute top-1/2 right-1/4 h-2 w-2 bg-pink-500 rounded-full animate-ping-slow" style={{animationDelay: "1.4s"}}></div>
            <div className="absolute top-1/3 right-1/3 h-2 w-2 bg-blue-500 rounded-full animate-ping-slow" style={{animationDelay: "2.1s"}}></div>
            <div className="absolute bottom-1/4 right-1/2 h-2 w-2 bg-teal-500 rounded-full animate-ping-slow" style={{animationDelay: "2.8s"}}></div>
          </div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            {/* Top badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 px-5 py-2 rounded-full transform hover:scale-105 transition-transform duration-300 animate-float shadow-lg border border-indigo-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Disc className="h-6 w-6 text-indigo-300 animate-spin-slow" />
                  <span className="text-white font-medium tracking-wide text-sm md:text-base">A GLOBAL MUSICAL TRIBUTE</span>
                  <Music className="h-5 w-5 text-indigo-300 animate-pulse-slow" />
                </div>
              </div>
            </div>
            
            {/* Main title content with enhanced logo */}
            <div className="glass p-8 rounded-2xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10"></div>
              
              {/* Logo and title container */}
              <div className="flex flex-col md:flex-row items-center justify-between relative z-10 mb-8">
                <div className="mb-8 md:mb-0 w-full md:w-1/2 flex flex-col items-center md:items-start">
                  <div className="text-center md:text-left">
                    <div className="relative mb-3">
                      <div className="glass-premium px-4 py-2 rounded-lg relative overflow-hidden backdrop-blur-md border border-indigo-500/30 group animate-float">
                        {/* Enhanced Network globe visualization */}
                        <div className="absolute inset-0 opacity-40">
                          <div className="network-paths rounded-lg"></div>
                        </div>
                        
                        {/* Global network lines */}
                        <div className="absolute inset-0">
                          <div className="absolute top-1/2 left-1/4 h-[1px] w-16 bg-gradient-to-r from-indigo-500/20 to-transparent rotate-12 transform-gpu"></div>
                          <div className="absolute bottom-1/3 right-1/4 h-[1px] w-20 bg-gradient-to-l from-purple-500/20 to-transparent -rotate-15 transform-gpu"></div>
                          <div className="absolute top-2/3 right-1/3 h-[1px] w-12 bg-gradient-to-l from-blue-500/20 to-transparent rotate-45 transform-gpu"></div>
                        </div>
                        
                        {/* Connection points with enhanced glow */}
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-1/2 left-1/4 h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                          <div className="absolute top-3/4 right-1/3 h-1.5 w-1.5 bg-purple-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(147,51,234,0.6)]" style={{animationDelay: "0.7s"}}></div>
                          <div className="absolute bottom-1/4 left-2/3 h-1.5 w-1.5 bg-blue-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{animationDelay: "1.3s"}}></div>
                          <div className="absolute top-1/4 right-1/4 h-1.5 w-1.5 bg-pink-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(236,72,153,0.6)]" style={{animationDelay: "0.9s"}}></div>
                        </div>
                        
                        {/* Globe icon + text */}
                        <div className="flex items-center space-x-2 relative z-10">
                          <div className="rounded-full bg-gradient-to-br from-indigo-900/70 to-blue-900/50 p-1.5 group-hover:from-indigo-800/80 group-hover:to-blue-800/60 transition-colors shadow-inner">
                            <div className="relative">
                              <Globe className="h-4 w-4 text-indigo-300 animate-spin-slow" style={{animationDuration: "15s"}} />
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-400/30 to-transparent"></div>
                            </div>
                          </div>
                          <span className="text-xs md:text-sm uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 font-semibold">
                            Presented By SoundAlchemy
                          </span>
                          <div className="rounded-full bg-gradient-to-br from-purple-900/70 to-indigo-900/50 p-1.5 group-hover:from-purple-800/80 group-hover:to-indigo-800/60 transition-colors shadow-inner">
                            <div className="relative">
                              <Music className="h-4 w-4 text-purple-300" />
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-400/30 to-transparent"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
                  
                      <div className="mt-2">
                        <span className="text-gradient relative z-10 inline-block text-4xl md:text-5xl lg:text-6xl">Friends for Peace</span>
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-pulse-slow"></div>
                      </div>
                    </h1>
                    
                    <div className="inline-block px-4 py-1.5 bg-indigo-900/40 rounded-full text-indigo-200 text-sm md:text-base mt-3 font-medium border border-indigo-500/30 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                      Official Cover Project
                    </div>
                  </div>
                </div>
                
                {/* Super Enhanced Logo display with 3D animation */}
                <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                  <div className="relative w-80 h-80 flex items-center justify-center group perspective">
                    {/* Multiple animated outer rings with glow effects */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-spin-slow blur-xl transform group-hover:scale-110 transition-all duration-700"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-500/30 animate-pulse-slow"></div>
                    <div className="absolute inset-4 rounded-full border-[1px] border-purple-500/40 animate-spin-slow" style={{animationDirection: 'reverse', animationDuration: '12s'}}></div>
                    <div className="absolute inset-6 rounded-full border-[1px] border-pink-500/30 animate-spin-slow" style={{animationDuration: '15s'}}></div>
                    
                    {/* Multi-layered glowing rings */}
                    <div className="absolute inset-8 rounded-full bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 animate-pulse-slow filter blur-md" style={{animationDelay: "1.2s"}}></div>
                    <div className="absolute inset-10 rounded-full bg-gradient-to-l from-blue-600/20 via-indigo-600/20 to-violet-600/20 animate-pulse-slow filter blur-sm" style={{animationDelay: "2.5s"}}></div>
                    
                    {/* Constellation effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} 
                          className="absolute h-[1px] w-[1px] bg-white" 
                          style={{
                            top: `${Math.random() * 100}%`, 
                            left: `${Math.random() * 100}%`,
                            boxShadow: '0 0 3px 1px rgba(255, 255, 255, 0.6)',
                            animationDelay: `${i * 0.3}s`
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Main logo container with enhanced 3D effect */}
                    <div className="relative w-64 h-64 rounded-full overflow-hidden p-3 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-lg shadow-[0_0_25px_rgba(79,70,229,0.6)] transform group-hover:scale-105 transition-all duration-500 hover:shadow-[0_0_40px_rgba(79,70,229,0.8)] group-hover:rotate-y-6" style={{transformStyle: 'preserve-3d'}}>
                      {/* Reflective background effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-radial from-indigo-500/10 via-purple-500/5 to-transparent opacity-70"></div>
                      <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-300/10 via-indigo-400/5 to-transparent opacity-80 animate-pulse-slow" style={{animationDuration: '4s'}}></div>
                      
                      {/* Rotating highlight effect */}
                      <div className="absolute h-full w-8 bg-white/5 blur-xl transform rotate-45 animate-shimmer-slow"></div>
                      
                      {/* Logo image with enhanced 3D hover effect and shine */}
                      <div className="w-full h-full rounded-full overflow-hidden relative group-hover:transform group-hover:rotate-y-12 transition-all duration-1000" style={{transformStyle: 'preserve-3d', perspective: '1000px'}}>
                        {/* Shine overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-y-full animate-shine pointer-events-none"></div>
                        
                        {/* Logo with enhanced shadow */}
                        <div className="relative h-full w-full flex items-center justify-center">
                          <div className="absolute inset-6 rounded-full bg-black/30 filter blur-md transform translate-y-2 scale-95"></div>
                          <OptimizedImage 
                            src="/assert/we are the world cover images/freinds for peace logo by soundAlchemy.png" 
                            alt="Friends for Peace Logo" 
                            className="relative w-full h-full object-contain p-2 transform hover:scale-105 transition-transform duration-300"
                            width={240}
                            height={240}
                          />
                        </div>
                      </div>
                      
                      {/* Interactive decorative elements */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-full shadow-lg animate-pulse-slow group-hover:scale-110 transition-transform will-change-transform">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      
                      {/* Animated particles with glow effect - conditionally rendered for performance */}
                      {isIntersecting && (
                        <>
                          <div className="absolute top-1/4 left-0 h-2 w-2 bg-indigo-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(129,140,248,0.8)] will-change-transform"></div>
                          <div className="absolute bottom-1/4 right-0 h-2 w-2 bg-purple-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(168,85,247,0.8)] will-change-transform" style={{animationDelay: "0.7s"}}></div>
                          <div className="absolute top-0 right-1/4 h-2 w-2 bg-pink-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(236,72,153,0.8)] will-change-transform" style={{animationDelay: "1.3s"}}></div>
                          <div className="absolute bottom-0 left-1/4 h-2 w-2 bg-blue-400 rounded-full animate-ping-slow shadow-[0_0_8px_rgba(96,165,250,0.8)] will-change-transform" style={{animationDelay: "1.9s"}}></div>
                        </>
                      )}
                    </div>
                    
                    {/* Enhanced floating elements around logo */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 rounded-full shadow-lg animate-float opacity-90 hover:opacity-100 transition-opacity" style={{animationDelay: "1.7s"}}>
                      <Music className="h-6 w-6 text-white animate-pulse-slow" />
                    </div>
                    <div className="absolute -bottom-3 -left-4 bg-gradient-to-r from-purple-500 to-pink-500 p-2.5 rounded-full shadow-lg animate-float opacity-90 hover:opacity-100 transition-opacity" style={{animationDelay: "0.8s"}}>
                      <Globe className="h-6 w-6 text-white animate-pulse-slow" />
                    </div>
                    <div className="absolute -left-4 top-1/4 bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full shadow-lg animate-float opacity-90 hover:opacity-100 transition-opacity" style={{animationDelay: "2.2s"}}>
                      <Mic className="h-5 w-5 text-white animate-pulse-slow" />
                    </div>
                    <div className="absolute -right-3 bottom-1/4 bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-full shadow-lg animate-float opacity-90 hover:opacity-100 transition-opacity" style={{animationDelay: "1.3s"}}>
                      <Heart className="h-5 w-5 text-white animate-pulse-slow" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Organizers and stats section */}
              <div className="relative z-10">
                <div className="border-t border-indigo-500/20 pt-8 mb-6">
                  <div className="text-center max-w-3xl mx-auto">
                    <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed mb-6">
                      A global collaboration organized by
                      <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 mx-1.5">Lehan Kawshila</span>
                      <span className="text-indigo-200">(Founder & Strategist)</span>,
                      <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300 mx-1.5">Antonio Papa</span>
                      <span className="text-indigo-200">(Co-founder & Music Director)</span> and
                      <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300 mx-1.5">Elena Sofia</span>
                      <span className="text-indigo-200">(Co-Founder & Creative Director - Project Naming Visionary)</span>
                    </p>
                  </div>
                </div>
                
                {/* Stats with enhanced styling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="glass group hover:bg-indigo-900/30 transition-all duration-300 rounded-xl p-4 border border-indigo-500/20 transform hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      <div className="rounded-full bg-indigo-900/50 p-3 mb-3 group-hover:bg-indigo-800/60 transition-colors">
                        <Globe className="h-6 w-6 text-indigo-300" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-1">13+ Countries</h4>
                      <p className="text-indigo-200 text-sm">Uniting musicians across borders</p>
                    </div>
                  </div>
                  
                  <div className="glass group hover:bg-purple-900/30 transition-all duration-300 rounded-xl p-4 border border-purple-500/20 transform hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      <div className="rounded-full bg-purple-900/50 p-3 mb-3 group-hover:bg-purple-800/60 transition-colors">
                        <Users className="h-6 w-6 text-purple-300" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-1">24+ Musicians</h4>
                      <p className="text-purple-200 text-sm">Collaborating across the globe</p>
                    </div>
                  </div>
                  
                  <div className="glass group hover:bg-pink-900/30 transition-all duration-300 rounded-xl p-4 border border-pink-500/20 transform hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      <div className="rounded-full bg-pink-900/50 p-3 mb-3 group-hover:bg-pink-800/60 transition-colors">
                        <Heart className="h-6 w-6 text-pink-300" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-1">1 Global Message</h4>
                      <p className="text-pink-200 text-sm">Of unity, peace, and hope</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 glass p-4 rounded-full shadow-lg animate-float" style={{animationDelay: '1s'}}>
              <Music className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="absolute -top-6 -left-6 glass p-4 rounded-full shadow-lg animate-float" style={{animationDelay: '2.5s'}}>
              <Heart className="h-8 w-8 text-pink-400" />
            </div>
          </div>
        </div>
        
        {/* Earth Video with Global Network Visualization */}
        <div className="relative mb-20">
          <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl neon-border">
            <video 
              ref={videoRef}
              autoPlay={isIntersecting}
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
              onLoadedData={() => setIsVideoLoaded(true)}
              preload="metadata"
              poster="/assert/we are the world cover images/video/earth-poster.jpg"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
            >
              <source src="/assert/we are the world cover images/video/Earth.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Animated connection paths overlay */}
            <div className="absolute inset-0 z-10">
              <div className="network-paths"></div>
            </div>
            
            {/* Global musician markers - only rendered when visible and on larger screens */}
            {isVideoLoaded && isIntersecting && window.innerWidth > 768 && (
              <>
                <div className="absolute top-1/4 left-1/3 z-20 animate-ping-slow" style={{animationDelay: '0.5s'}}>
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="absolute top-1/3 right-1/4 z-20 animate-ping-slow" style={{animationDelay: '1.2s'}}>
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="absolute bottom-1/3 left-1/4 z-20 animate-ping-slow" style={{animationDelay: '0.8s'}}>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="absolute bottom-1/4 right-1/3 z-20 animate-ping-slow" style={{animationDelay: '1.5s'}}>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 animate-ping-slow" style={{animationDelay: '0.3s'}}>
                  <div className="h-4 w-4 bg-purple-500 rounded-full"></div>
                </div>
              </>
            )}
          </div>
          
          <div className="absolute -bottom-6 -right-6 glass p-4 rounded-lg shadow-lg animate-float hidden md:block" style={{animationDelay: '1s'}}>
            <Music className="h-12 w-12 text-indigo-400" />
          </div>
          <div className="absolute -top-6 -left-6 glass p-4 rounded-lg shadow-lg animate-float hidden md:block" style={{animationDelay: '3s'}}>
            <Heart className="h-10 w-10 text-pink-400" />
          </div>
          
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-30">
            <div className="glass px-6 py-3 rounded-full inline-flex items-center space-x-2 shadow-lg bg-indigo-900/40">
              <Globe className="h-5 w-5 text-indigo-300" />
              <span className="text-white font-medium">A Worldwide Collaboration</span>
            </div>
          </div>
        </div>
        
        {/* Project Details */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Our Global Cover Project: <span className="text-gradient">"Friends for Peace"</span>
              </h3>
              
              <p className="text-lg text-gray-300 mb-6">
                Inspired by the iconic "We Are The World," SoundAlchemy has brought together talented musicians 
                from across the globe to create "Friends for Peace" - a powerful musical statement about unity, 
                harmony, and our shared humanity.
              </p>
              
              <div className="space-y-6">
                <div className="glass p-6 rounded-lg shadow-md hover:bg-indigo-900/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-indigo-300 mb-2">Global Representation</h4>
                      <p className="text-gray-300">
                        Over 50 musicians from 30+ countries came together virtually to lend their voices and 
                        instruments to this powerful collaboration, transcending borders and cultural differences.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass p-6 rounded-lg shadow-md hover:bg-indigo-900/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-pink-300" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-indigo-300 mb-2">Message of Hope</h4>
                      <p className="text-gray-300">
                        In a world often divided, "Friends for Peace" carries a message of hope, solidarity, 
                        and the belief that music can heal even the deepest divides between nations and people.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass p-6 rounded-lg shadow-md hover:bg-indigo-900/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-300" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-indigo-300 mb-2">Music for a Better World</h4>
                      <p className="text-gray-300">
                        Beyond music, we believe in using our talents to make the world a better place. 
                        Our planet gives us so much, but we often fail to appreciate it. It is time for us 
                        to give back and heal the world through music.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="relative">
                <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-2xl neon-border">
                  <OptimizedImage
                    src="/assert/we are the world cover images/all musicians photo.webp"
                    alt="Global musicians collaborating on Friends for Peace"
                    className="w-full h-full object-cover"
                    width={600} 
                    height={450}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a16] via-[#0a0a16]/20 to-transparent"></div>
                </div>
                
               
                <div className="absolute -top-3 -right-3 glass p-3 rounded-full shadow-lg animate-float" style={{animationDelay: '2s'}}>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              
              <div className="mt-8 glass p-4 rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
                <div className="text-center">
                  <h5 className="text-lg font-medium text-indigo-300 mb-1">Featured Musicians</h5>
                  <div className="flex flex-wrap justify-center">
                    <div className="flex -space-x-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border-2 border-indigo-900 animate-pulse-slow" style={{animationDelay: `${i * 0.2}s`}}></div>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-300">and many more...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Organizers Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-block p-3 bg-indigo-900/30 rounded-full mb-4 animate-glow">
              <Award className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
              The Visionary <span className="text-gradient">Team</span> Behind the Project
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-300">
              This global collaboration was organized and brought to life by SoundAlchemy's leadership team
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lehan Kawshila */}
            <div className="glass rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-6 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 mb-4 neon-border">
                      <OptimizedImage
                        src="/assert/team/lehan.jpg"
                        alt="Lehan Kawshila - Founder & Strategist"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-50 group-hover:opacity-30 transition-opacity"></div>
                      <div className="absolute -top-1 -right-1 bg-purple-600 p-1 rounded-full">
                        <Star className="h-4 w-4 text-white animate-pulse-slow" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping-slow opacity-20"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-1">Lehan Kawshila</h3>
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-500 px-3 py-1 rounded-full text-xs font-medium text-white flex items-center">
                      <Sparkles className="h-3 w-3 mr-1 animate-pulse-slow" /> Founder & Strategist
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    The driving force behind SoundAlchemy and the visionary who initiated the Friends for Peace project, 
                    bringing together musicians from across the globe.
                  </p>
                  
                  <div className="w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-shimmer bg-size-200"></div>
                </div>
              </div>
            </div>
            
            {/* Antonio Papa */}
            <div className="glass rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-6 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 mb-4 neon-border">
                      <OptimizedImage
                        src="/assert/team/antonio2.jpg"
                        alt="Antonio Papa - Lead Audio Engineer & Music Director"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent opacity-50 group-hover:opacity-30 transition-opacity"></div>
                      <div className="absolute -top-1 -right-1 bg-blue-600 p-1 rounded-full">
                        <Music className="h-4 w-4 text-white animate-pulse-slow" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping-slow opacity-20" style={{animationDelay: '0.5s'}}></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-1">Antonio Papa</h3>
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-500 px-3 py-1 rounded-full text-xs font-medium text-white flex items-center">
                      <Zap className="h-3 w-3 mr-1 animate-pulse-slow" /> Lead Audio Engineer & Music Director
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    The creative genius orchestrating the musical elements of the project, 
                    Antonio brings technical expertise and artistic direction to every note.
                  </p>
                  
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-shimmer bg-size-200"></div>
                </div>
              </div>
            </div>
            
            {/* Elena (Sofia) */}
            <div className="glass rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-pink-600/20 via-purple-600/10 to-pink-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-6 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 mb-4 neon-border">
                      <OptimizedImage
                        src="/assert/team/sofia.jpg"
                        alt="Elena (Sofia) - Creative Director"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 to-transparent opacity-50 group-hover:opacity-30 transition-opacity"></div>
                      <div className="absolute -top-1 -right-1 bg-pink-600 p-1 rounded-full">
                        <Heart className="h-4 w-4 text-white animate-pulse-slow" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping-slow opacity-20" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-1">Elena (Sofia)</h3>
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-gradient-to-r from-pink-400 to-purple-500 px-3 py-1 rounded-full text-xs font-medium text-white flex items-center">
                      <Sparkles className="h-3 w-3 mr-1 animate-pulse-slow" /> Creative Director
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    The artistic visionary who created the "Friends for Peace" name and brings the project to life through creative direction and conceptual artistry. Her innovative approach combines visual storytelling with emotional resonance, elevating the entire collaboration.
                  </p>
                  
                  <div className="w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full animate-shimmer bg-size-200"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 glass p-6 rounded-xl bg-indigo-900/20 hover:bg-indigo-900/30 transition-all duration-300 transform hover:scale-[1.01]">
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
              <div className="flex-shrink-0 relative">
                <div className="flex">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 z-30">
                    <OptimizedImage 
                      src="/assert/team/lehan.jpg"
                      alt="Lehan" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 -ml-4 z-20">
                    <OptimizedImage 
                      src="/assert/team/antonio2.jpg"
                      alt="Antonio" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 -ml-4 z-10">
                    <OptimizedImage 
                      src="/assert/team/sofia.jpg"
                      alt="Sofia" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 animate-spin-slow blur-md" style={{animationDuration: '15s'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center">
          <button className="glass-button px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-all transform hover:scale-105 animate-pulse-slow">
            Comming Soon...
          </button>
          
          <div className="mt-8 text-gray-400 flex justify-center items-center">
            <span className="mr-2">Share this project:</span>
            <div className="flex space-x-3">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((platform) => (
                <button key={platform} className="h-8 w-8 rounded-full bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-700 transition-colors">
                  <span className="sr-only">{platform}</span>
                  <div className={`h-4 w-4 bg-indigo-300 mask-icon-${platform}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FriendsForPeace; 