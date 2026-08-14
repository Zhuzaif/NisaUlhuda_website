import React from 'react';

interface PhoneMockupProps {
  imageSrc: string;
  altText?: string;
  className?: string;
  badge?: string;
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  imageSrc,
  altText = 'Nisa App Screenshot',
  className = '',
  badge,
  badgePosition = 'top-right'
}) => {
  const getBadgeClass = () => {
    switch (badgePosition) {
      case 'top-left':
        return '-top-6 -left-6';
      case 'top-right':
        return '-top-6 -right-6';
      case 'bottom-left':
        return '-bottom-6 -left-6';
      case 'bottom-right':
        return '-bottom-6 -right-6';
      default:
        return '-top-6 -right-6';
    }
  };

  return (
    <div className={`relative inline-block group select-none ${className}`}>
      {/* Glow aura behind phone */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#e2b857]/20 via-[#0b291e]/40 to-transparent rounded-[3.5rem] blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-80" />

      {/* Outer Phone Shell */}
      <div className="relative aspect-[9/19.5] w-full max-w-[320px] mx-auto rounded-[3.2rem] p-3 bg-gradient-to-b from-[#2a3632] via-[#0f1d18] to-[#050e0b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border border-[#e2b857]/20">
        
        {/* Phone Side Buttons */}
        <div className="absolute -left-[3px] top-24 w-[3px] h-10 bg-gray-700 rounded-l-md" />
        <div className="absolute -left-[3px] top-38 w-[3px] h-12 bg-gray-700 rounded-l-md" />
        <div className="absolute -left-[3px] top-54 w-[3px] h-12 bg-gray-700 rounded-l-md" />
        <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-gray-700 rounded-r-md" />

        {/* Screen Area */}
        <div className="w-full h-full rounded-[2.6rem] overflow-hidden bg-[#061a14] relative border border-black/80 shadow-inner">
          
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-3 inset-x-0 h-4 w-24 bg-black rounded-full mx-auto z-30 flex items-center justify-end px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>

          {/* Actual Screenshot */}
          <div className="w-full h-[calc(100%+2rem)] -mt-[2rem]">
            <img
              src={imageSrc}
              alt={altText}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x1300/061a14/e2b857?text=Nisa+Islamic+App';
              }}
            />
          </div>

          {/* Realistic Screen Glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-20" />
        </div>
      </div>

      {/* Optional Floating Badge */}
      {badge && (
        <div className={`absolute ${getBadgeClass()} z-30 hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0b291e]/90 backdrop-blur-xl border border-[#e2b857]/40 shadow-2xl text-[#f5d77f] text-xs font-semibold tracking-wide`}>
          <span className="w-2 h-2 rounded-full bg-[#e2b857] animate-pulse" />
          {badge}
        </div>
      )}
    </div>
  );
};
