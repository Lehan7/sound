import React from 'react';

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a16]">
    <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
  </div>
);

export default LoadingFallback; 