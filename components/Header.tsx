
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          AI Wall Decor Visualizer
        </h1>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          System Ready
        </span>
      </div>
    </header>
  );
};

export default Header;
