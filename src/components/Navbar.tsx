import React, { useState, useEffect, useRef } from 'react';
import { Music, Menu, X, User, LogOut, Home, Info, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when clicking a link
  const handleMobileNavClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a0a16]/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - left aligned on all screens for better UX */}
          <div className="flex items-center">
            <a href="#" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-sm group-hover:bg-indigo-500/50 transition-all duration-300"></div>
                <Music className={`h-7 w-7 relative z-10 ${scrolled ? 'text-indigo-400' : 'text-white'} transition-colors duration-300 group-hover:text-indigo-400`} />
              </div>
              <span className={`ml-2 text-xl font-bold ${
                scrolled ? 'text-gradient' : 'text-white'
              } transition-colors duration-300 group-hover:text-gradient`}>
                SoundAlchemy
              </span>
            </a>
          </div>
          
          {/* Center navigation - desktop only */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300">Features</a>
            <a href="#project" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300">Our Project</a>
            <a href="#collaborators" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300">Collaborators</a>
            <a href="#team" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300">Team</a>
            <Link to="/friends-for-peace-logo" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300">Friends for Peace</Link>
          </div>
          
          {/* Right side - user menu on desktop, hamburger on mobile */}
          <div className="flex items-center space-x-2">
            {/* Desktop user menu */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    ref={userButtonRef}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors duration-300 focus:outline-none"
                    aria-expanded={showUserMenu}
                  >
                    <div className="bg-indigo-900/50 rounded-full w-8 h-8 flex items-center justify-center">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-indigo-300 font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-md shadow-lg py-1 z-50 animate-fadeIn">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-900/50 hover:text-white transition-colors"
                      >
                        <User className="h-4 w-4 inline mr-2" />
                        Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-900/50 hover:text-white transition-colors"
                        >
                          <Users className="h-4 w-4 inline mr-2" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-900/50 hover:text-white transition-colors"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all duration-300 transform-gpu hover:scale-105 neon-border"
                >
                  Join Now
                </button>
              )}
            </div>
            
            {/* Mobile user button */}
            <div className="md:hidden">
              {user ? (
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center mr-2 text-gray-300 hover:text-indigo-400 transition-colors duration-300 focus:outline-none"
                  aria-expanded={showUserMenu}
                >
                  <div className="bg-indigo-900/50 rounded-full w-8 h-8 flex items-center justify-center">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-300 font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="mr-2 text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                  aria-label="Sign in"
                >
                  <User className="h-6 w-6" />
                </button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white transition-all duration-300 focus:outline-none"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - fullscreen overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0a0a16]/98 backdrop-blur-lg transform-gpu will-change-transform animate-fadeIn">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="space-y-5 text-center">
              <a 
                href="#features" 
                className="flex items-center px-3 py-2 text-xl text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                onClick={handleMobileNavClick}
              >
                <Info className="h-5 w-5 mr-2" />
                Features
              </a>
              <a 
                href="#project" 
                className="flex items-center px-3 py-2 text-xl text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                onClick={handleMobileNavClick}
              >
                <Music className="h-5 w-5 mr-2" />
                Our Project
              </a>
              <a 
                href="#collaborators" 
                className="flex items-center px-3 py-2 text-xl text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                onClick={handleMobileNavClick}
              >
                <Users className="h-5 w-5 mr-2" />
                Collaborators
              </a>
              <a 
                href="#team" 
                className="flex items-center px-3 py-2 text-xl text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                onClick={handleMobileNavClick}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Team
              </a>
              
              <Link 
                to="/friends-for-peace-logo" 
                className="flex items-center px-3 py-2 text-xl text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                onClick={handleMobileNavClick}
              >
                <Users className="h-5 w-5 mr-2" />
                Friends for Peace
              </Link>
              
              {!user && (
                <button 
                  onClick={() => {
                    onLoginClick();
                    handleMobileNavClick();
                  }}
                  className="mt-4 w-full flex justify-center items-center px-3 py-3 text-xl font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                >
                  <User className="h-5 w-5 mr-2" />
                  Join Now
                </button>
              )}
              
              {showUserMenu && user && (
                <div className="mt-6 w-full space-y-3">
                  <Link 
                    to="/profile" 
                    className="flex items-center justify-center px-3 py-2 text-lg text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                    onClick={handleMobileNavClick}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center justify-center px-3 py-2 text-lg text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                      onClick={handleMobileNavClick}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      handleMobileNavClick();
                    }}
                    className="flex items-center justify-center w-full px-3 py-2 mt-2 text-lg text-red-400 hover:text-red-300 transition-colors duration-300"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
              
              <button
                onClick={handleMobileNavClick}
                className="absolute top-5 right-5 text-gray-300 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;