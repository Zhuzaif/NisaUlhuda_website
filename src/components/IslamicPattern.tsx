import React from 'react';

interface IslamicPatternProps {
  className?: string;
  opacity?: number;
}

export const IslamicPattern: React.FC<IslamicPatternProps> = ({ 
  className = '', 
  opacity = 0.04 
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-star-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Geometric Islamic 8-Pointed Star Pattern Lines */}
            <path
              d="M40 0 L48 16 L64 8 L56 24 L72 32 L56 40 L72 48 L56 56 L64 72 L48 64 L40 80 L32 64 L16 72 L24 56 L8 48 L24 40 L8 32 L24 24 L16 8 L32 16 Z"
              fill="none"
              stroke="#e2b857"
              strokeWidth="1"
            />
            <circle cx="40" cy="40" r="12" fill="none" stroke="#e2b857" strokeWidth="0.75" />
            <circle cx="0" cy="0" r="8" fill="none" stroke="#e2b857" strokeWidth="0.75" />
            <circle cx="80" cy="0" r="8" fill="none" stroke="#e2b857" strokeWidth="0.75" />
            <circle cx="0" cy="80" r="8" fill="none" stroke="#e2b857" strokeWidth="0.75" />
            <circle cx="80" cy="80" r="8" fill="none" stroke="#e2b857" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
      </svg>
    </div>
  );
};
