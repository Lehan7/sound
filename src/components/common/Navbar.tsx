import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Music, User, LogOut, Menu as MenuIcon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  onSidebarToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 backdrop-blur-md fixed w-full top-0 z-50 shadow-lg border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Sidebar Toggle Button - Only show for logged in users */}
            {user && (
              <button
                onClick={onSidebarToggle}
                className="hidden md:block p-2 mr-2 rounded-full hover:bg-primary-500/20 transition-all duration-300 group"
                aria-label="Toggle Sidebar"
              >
                <MenuIcon size={24} className="text-gray-300 group-hover:text-primary-400 transition-colors duration-300" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2 group">
              <Music size={28} className="text-secondary-500 group-hover:text-secondary-400 transition-colors duration-300" />
              <span className="text-xl font-display font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent group-hover:from-primary-300 group-hover:via-secondary-300 group-hover:to-primary-300 transition-all duration-300">
                SoundAlchemy
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`nav-link relative group ${location.pathname === '/' ? 'active-nav-link' : ''}`}
            >
              <span className="relative">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            
            <a
              href="https://sound-ashy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-1.5 px-4 flex items-center space-x-2 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 shadow-lg shadow-primary-500/20"
            >
              <span>Official Website</span>
              <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
            </a>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`nav-link relative group ${location.pathname.includes('/profile') ? 'active-nav-link' : ''}`}
                >
                  <span className="relative">
                    Profile
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline py-1.5 px-4 flex items-center space-x-1 hover:bg-dark-700/80 hover:border-primary-400 hover:text-primary-400 transition-all duration-300"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-link relative group ${location.pathname === '/login' ? 'active-nav-link' : ''}`}
                >
                  <span className="relative">
                    Login
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-1.5 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 shadow-lg shadow-primary-500/20 hover:scale-105 transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-primary-400 focus:outline-none transition-colors duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-dark-800/95 backdrop-blur-md shadow-xl border-t border-dark-700/50"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md ${
                location.pathname === '/' ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white' : 'text-gray-300 hover:bg-dark-700/80 hover:text-white'
              } transition-all duration-300`}
              onClick={closeMenu}
            >
              Home
            </Link>
            
            <a
              href="https://sound-ashy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-md bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-400 hover:to-secondary-400 transition-all duration-300"
              onClick={closeMenu}
            >
              Official Website
            </a>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md ${
                    location.pathname.includes('/profile') ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white' : 'text-gray-300 hover:bg-dark-700/80 hover:text-white'
                  } transition-all duration-300`}
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:bg-dark-700/80 hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md ${
                    location.pathname === '/login' ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white' : 'text-gray-300 hover:bg-dark-700/80 hover:text-white'
                  } transition-all duration-300`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 rounded-md ${
                    location.pathname === '/register' ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white' : 'text-gray-300 hover:bg-dark-700/80 hover:text-white'
                  } transition-all duration-300`}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;