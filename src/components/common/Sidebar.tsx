import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MessageSquare,
  Video,
  Bell,
  Users,
  MessageCircle,
  Headphones,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  Info,
  AlertCircle,
  Music,
  Mic,
  Podcast,
  Radio,
  Volume2,
  UserPlus,
  Search,
  Star,
  Heart,
  Clock,
  Calendar,
  Bookmark,
  Share2,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Tooltip } from 'react-tooltip';

interface Notification {
  id: string;
  type: 'update' | 'message' | 'news' | 'admin' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface NavSection {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    path: string;
    badge?: number;
    isNew?: boolean;
    subItems?: { label: string; path: string }[];
  }[];
}

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const SIDEBAR_EXPANDED_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<{ [title: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'update',
      title: 'New Feature Available',
      message: 'Check out our new AI-powered mixing tools!',
      timestamp: new Date(),
      read: false,
      priority: 'high',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'John Doe sent you a message',
      timestamp: new Date(),
      read: false,
      priority: 'medium',
    },
    {
      id: '3',
      type: 'system',
      title: 'System Update',
      message: 'New version 2.0.0 is now available',
      timestamp: new Date(),
      read: true,
      priority: 'low',
    },
  ]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({});
  const [subItemsOpen, setSubItemsOpen] = useState<Record<string, boolean>>({});

  const navSections: NavSection[] = [
    {
      title: 'Communication',
      items: [
        { 
          icon: MessageSquare, 
          label: 'Live Chat', 
          path: '/chat/live',
          badge: 3,
          isNew: true,
        },
        { 
          icon: MessageCircle, 
          label: 'Messages', 
          path: '/chat/messages',
          badge: 5,
        },
        { 
          icon: Video, 
          label: 'Zoom Meetings', 
          path: '/chat/zoom',
          subItems: [
            { label: 'Schedule Meeting', path: '/chat/zoom/schedule' },
            { label: 'Join Meeting', path: '/chat/zoom/join' },
            { label: 'Recordings', path: '/chat/zoom/recordings' },
          ],
        },
        { 
          icon: Headphones, 
          label: 'Voice Chat', 
          path: '/chat/voice',
          isNew: true,
        },
      ],
    },
    {
      title: 'Community',
      items: [
        { 
          icon: Users, 
          label: 'Soundalchemy Community', 
          path: '/community',
          badge: 12,
        },
        { 
          icon: Mail, 
          label: 'Direct Messages', 
          path: '/messages',
        },
        { 
          icon: Phone, 
          label: 'Voice Calls', 
          path: '/calls',
        },
      ],
    },
    {
      title: 'Audio Tools',
      items: [
        { 
          icon: Music, 
          label: 'Music Studio', 
          path: '/studio',
          isNew: true,
        },
        { 
          icon: Mic, 
          label: 'Recording', 
          path: '/recording',
        },
        { 
          icon: Podcast, 
          label: 'Podcast', 
          path: '/podcast',
        },
        { 
          icon: Radio, 
          label: 'Live Stream', 
          path: '/stream',
        },
      ],
    },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleSection = (sectionTitle: string) => {
    setSectionOpen((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const toggleSubItems = (itemPath: string) => {
    setSubItemsOpen((prev) => ({
      ...prev,
      [itemPath]: !prev[itemPath],
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  // Helper for active route
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  // Notification Modal
  const NotificationModal = () =>
    createPortal(
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-dark-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-y-auto max-h-[80vh] border border-dark-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={22} className="text-primary-400" />
                  <span className="text-lg font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-gray-400 hover:text-white rounded-full p-1.5 transition-colors"
                  aria-label="Close notifications"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl cursor-pointer shadow-md border border-dark-700 transition-all duration-200 ${
                        notification.read ? 'bg-dark-800' : 'bg-primary-500/10 border-primary-500/40'
                      } hover:bg-dark-700`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${
                          notification.priority === 'high' ? 'text-red-400' :
                          notification.priority === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {notification.type === 'update' && <Info size={18} />}
                          {notification.type === 'message' && <MessageSquare size={18} />}
                          {notification.type === 'admin' && <AlertCircle size={18} />}
                          {notification.type === 'system' && <Settings size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-medium text-white truncate">{notification.title}</p>
                            <span className="text-xs text-gray-400 ml-2">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="mt-6 w-full py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white font-semibold transition-all"
                >
                  Clear All Notifications
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );

  if (!user) {
    return null; // Don't show sidebar if user is not logged in
  }

  return (
    <>
      <motion.div
        initial={{ width: isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        animate={{ width: isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-dark-900 text-white fixed left-0 flex flex-col shadow-xl z-40 transition-all duration-300 border-r-2 border-dark-800"
        style={{ width: isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH, top: '64px', height: 'calc(100vh - 64px)' }}
      >
        {/* Divider at the top for clear separation */}
        <div className="border-t-2 border-dark-700"></div>
        {/* Sidebar content with YouTube-like grouping, dividers, and section expand/collapse */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-4">
          {navSections.map((section) => {
            const sectionKey = section.title.toUpperCase();
            return (
              <div className="mb-3" key={sectionKey}>
                <button
                  className={`w-full flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} px-2 py-2 text-xs font-bold text-gray-300 uppercase tracking-wider hover:bg-dark-800 rounded transition-all duration-200 border-l-4 border-transparent`}
                  onClick={() => toggleSection(sectionKey)}
                  aria-label={`Toggle ${section.title} Section`}
                >
                  {isExpanded && <span>{section.title}</span>}
                  {isExpanded && (
                    <motion.span animate={{ rotate: sectionOpen[sectionKey] ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronLeft size={22} className="text-primary-400" />
                    </motion.span>
                  )}
                  {!isExpanded && <Menu size={18} />}
                </button>
                <AnimatePresence initial={false}>
                  {sectionOpen[sectionKey] && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                          <Link
                            to={item.path}
                                className={`group flex-1 flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-2 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-dark-700/80 ${isActive(item.path) ? 'bg-primary-500/10 text-primary-400 font-semibold border-l-4 border-primary-400' : 'text-gray-300 border-l-4 border-transparent'} text-base`}
                            data-tooltip-id={isExpanded ? undefined : `sidebar-tooltip-${item.path}`}
                            data-tooltip-content={isExpanded ? undefined : item.label}
                          >
                            <item.icon size={24} className="mx-auto" />
                                {isExpanded && (
                                  <div className="flex items-center justify-between w-full">
                                    <span className="ml-1 text-base truncate font-medium group-hover:text-white transition-colors duration-200">
                                      {item.label}
                                    </span>
                                    <div className="flex items-center">
                            {item.badge && (
                                        <span className="ml-2 bg-primary-500 text-white text-xs rounded-full px-2 py-0.5 font-bold animate-pulse-slow">
                                {item.badge}
                              </span>
                            )}
                            {item.isNew && (
                              <span className="ml-2 text-xs bg-green-500/20 text-green-400 rounded px-1.5 py-0.5 font-bold">NEW</span>
                            )}
                                    </div>
                                  </div>
                                )}
                              </Link>
                              {item.subItems && isExpanded && (
                                <button
                                  onClick={() => toggleSubItems(item.path)}
                                  className="p-2 hover:bg-dark-700/80 rounded-lg transition-all duration-200"
                                  aria-label={`Toggle ${item.label} sub-items`}
                                >
                                  <motion.span
                                    animate={{ rotate: subItemsOpen[item.path] ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronLeft size={18} className="text-primary-400" />
                                  </motion.span>
                                </button>
                              )}
                            </div>
                            {item.subItems && (
                              <AnimatePresence initial={false}>
                                {subItemsOpen[item.path] && (
                                  <motion.ul
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-8 space-y-1 overflow-hidden"
                                  >
                                    {item.subItems.map((subItem) => (
                                      <li key={subItem.path}>
                                        <Link
                                          to={subItem.path}
                                          className={`block px-2 py-1.5 text-sm rounded-lg transition-all duration-200 hover:bg-dark-700/80 ${
                                            isActive(subItem.path)
                                              ? 'text-primary-400 font-medium'
                                              : 'text-gray-400 hover:text-white'
                                          }`}
                                        >
                                          {subItem.label}
                          </Link>
                                      </li>
                                    ))}
                                  </motion.ul>
                                )}
                              </AnimatePresence>
                            )}
                          </div>
                          {!isExpanded && (
                            <Tooltip id={`sidebar-tooltip-${item.path}`} place="right" className="z-50" />
                          )}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
                <div className="border-t-2 border-dark-700 my-2"></div>
              </div>
            );
          })}
        </nav>
      </motion.div>
      <NotificationModal />
    </>
  );
};

export default Sidebar; 