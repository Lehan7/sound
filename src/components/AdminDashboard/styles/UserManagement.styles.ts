import tw from 'tailwind-styled-components';

export const DashboardContainer = tw.div`
  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
`;

export const Header = tw.div`
  bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6
`;

export const SearchBar = tw.div`
  relative flex-1 max-w-lg
`;

export const SearchInput = tw.input`
  w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  dark:bg-gray-700 dark:text-white transition-all duration-200
`;

export const ActionButton = tw.button`
  px-4 py-2 rounded-lg font-medium transition-all duration-200
  flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
  ${(p: { variant?: 'primary' | 'secondary' | 'danger' }) => {
    switch (p.variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    }
  }}
`;

export const Table = tw.table`
  min-w-full divide-y divide-gray-200 dark:divide-gray-700
`;

export const TableHeader = tw.th`
  px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
  uppercase tracking-wider bg-gray-50 dark:bg-gray-800
`;

export const TableCell = tw.td`
  px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200
  bg-white dark:bg-gray-900
`;

export const TableRow = tw.tr`
  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150
`;

export const Badge = tw.span`
  px-2 py-1 text-xs font-medium rounded-full
  ${(p: { status: 'success' | 'warning' | 'danger' | 'info' }) => {
    switch (p.status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  }}
`;

export const Card = tw.div`
  bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6
`;

export const StatsGrid = tw.div`
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6
`;

export const StatCard = tw.div`
  bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6
  border border-gray-100 dark:border-gray-700
  hover:shadow-md transition-all duration-200
`;

export const UserAvatar = tw.div`
  h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 
  flex items-center justify-center
`;

export const UserInfo = tw.div`
  flex items-center gap-3
`;

export const UserName = tw.div`
  font-medium text-gray-900 dark:text-white
`;

export const UserEmail = tw.div`
  text-gray-500 dark:text-gray-400 text-sm
`;

export const LastActive = tw.div`
  flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400
`;

export const ActionButtons = tw.div`
  flex items-center gap-2
`;

export const LoadingContainer = tw.div`
  flex items-center justify-center min-h-screen
`; 