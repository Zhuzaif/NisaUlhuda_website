import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#c59d5f]/20" />
        {/* Spinning Arch Accent */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c59d5f] animate-spin" />
        {/* Center Golden Dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-[#c59d5f] animate-pulse" />
      </div>
      <span className="text-[11px] font-bold text-[#c59d5f] uppercase tracking-widest animate-pulse">
        Loading...
      </span>
    </div>
  );
};

export default PageLoader;
