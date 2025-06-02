import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Home, Users, BarChart2, Calendar,
  Database, Shield, Activity, Settings,
  Menu, X, LogOut, Search, Bell,
  ChevronLeft, ChevronRight, Sun,
  Moon, HelpCircle, Mail, Globe,
  Music2, Download, Upload, Filter,
  MessageSquare, Plus, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHotkeys } from 'react-hotkeys-hook';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSearch, setShowSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle click outside to close menus
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      setShowProfileMenu(false);
    }
    if (!target.closest('.search-container')) {
      setShowSearch(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Search handling
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
    // Debounce search
    const timeoutId = setTimeout(() => {
      setIsSearching(false);
      // Implement search logic here
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  // Session timeout handling
  useEffect(() => {
    const checkSession = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        toast.error('Session expired due to inactivity');
        handleLogout();
      }
    };

    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, []);

  // Enhanced keyboard shortcuts
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    setShowSearch(true);
  });

  useHotkeys('esc', () => {
    setShowSearch(false);
    setShowProfileMenu(false);
  });

  useHotkeys('ctrl+b, cmd+b', () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  });

  const navigationItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/events', icon: Calendar, label: 'Events' },
    { path: '/admin/database', icon: Database, label: 'Database' },
    { path: '/admin/security', icon: Shield, label: 'Security' },
    { path: '/admin/performance', icon: Activity, label: 'Performance' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin-signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin-signin" replace />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0f0f1a]' : 'bg-gray-50'} text-white`}>
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e] border-b border-gray-800 shadow-lg"
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg lg:hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSidebarOpen ? 'close' : 'open'}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Music2 className="h-8 w-8 text-indigo-500 transform group-hover:scale-110 transition-transform" />
              </motion.div>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-xl hidden sm:block bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text"
              >
                Sound Alchemy
              </motion.span>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 search-container">
            <div className="relative w-full">
              <motion.input
                initial={false}
                animate={{ width: showSearch ? '100%' : '100%' }}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search anything... (Ctrl + K)"
                className="w-full bg-[#2a2a3e] text-gray-200 pl-10 pr-12 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </div>
              <div className="absolute right-3 top-2.5 flex items-center gap-2">
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-gray-400 bg-gray-700 rounded">
                  Ctrl + K
                </kbd>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white"
                >
                  <Filter className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg hidden sm:flex items-center gap-2 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
              <span className="text-sm hidden lg:block">New</span>
            </motion.button>

            {/* Notifications */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg relative">
                <Bell className="h-5 w-5" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"
                />
              </button>
            </motion.div>

            {/* Messages */}
            <motion.div 
              className="relative hidden sm:block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg">
                <MessageSquare className="h-5 w-5" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full"
                />
              </button>
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg hidden sm:block"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDarkMode ? 'dark' : 'light'}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Profile Menu */}
            <div className="relative profile-menu">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg"
              >
                <motion.div 
                  className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <Users className="h-4 w-4 text-white" />
                  )}
                </motion.div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-[#1a1a2e] rounded-lg shadow-xl border border-gray-700"
                  >
                    <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-400 hover:bg-[#2a2a3e] hover:text-white">
                      Your Profile
                    </Link>
                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-400 hover:bg-[#2a2a3e] hover:text-white">
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden px-4 pb-4 overflow-hidden"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search anything..."
                  className="w-full bg-[#2a2a3e] text-gray-200 pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  {isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{
          width: isSidebarCollapsed ? 64 : 256,
          x: isSidebarOpen ? 0 : -256
        }}
        className={`
          fixed top-16 bottom-0 left-0 z-40 bg-[#1a1a2e] border-r border-gray-800
          overflow-hidden lg:translate-x-0
        `}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-4 h-6 w-6 bg-indigo-600 rounded-full items-center justify-center hover:bg-indigo-700 transition-colors"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isSidebarCollapsed ? 'collapsed' : 'expanded'}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <nav className="h-full overflow-y-auto py-4">
          <motion.ul 
            className="space-y-1 px-3"
            variants={{
              expanded: { transition: { staggerChildren: 0.05 } },
              collapsed: { transition: { staggerChildren: 0.05 } }
            }}
            initial="collapsed"
            animate="expanded"
          >
              {navigationItems.map((item) => (
              <motion.li
                key={item.path}
                variants={{
                  expanded: { opacity: 1, x: 0 },
                  collapsed: { opacity: 0, x: -20 }
                }}
              >
                  <Link
                    to={item.path}
                    className={`
                    flex items-center px-3 py-2 rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:bg-[#2a2a3e] hover:text-white'
                      }
                    `}
                  >
                  <item.icon className="h-5 w-5 min-w-[20px]" />
                  <AnimatePresence>
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* Logout Button */}
          <motion.div 
            className="px-3 mt-4"
            variants={{
              expanded: { opacity: 1, y: 0 },
              collapsed: { opacity: 0, y: 20 }
            }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className={`
                flex items-center px-3 py-2 w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors
              `}
            >
              <LogOut className="h-5 w-5 min-w-[20px]" />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 text-sm"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </nav>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        layout
        className={`
          pt-16 min-h-screen
          ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}
        `}
      >
        <motion.div 
          className="container mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLayout; 