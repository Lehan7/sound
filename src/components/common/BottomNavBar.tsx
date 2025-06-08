import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Users, Music, MoreHorizontal } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Community', icon: Users, path: '/community' },
  { label: 'Studio', icon: Music, path: '/studio' },
  { label: 'More', icon: MoreHorizontal, path: '/more' },
];

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-dark-900 border-t border-dark-700 flex md:hidden justify-around py-1 shadow-xl">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors ${isActive ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
          >
            <item.icon size={24} className="mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavBar; 