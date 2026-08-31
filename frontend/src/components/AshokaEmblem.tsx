import React from 'react';

interface AshokaEmblemProps {
  className?: string;
  size?: number;
}

export const AshokaEmblem: React.FC<AshokaEmblemProps> = ({ className = "w-10 h-10", size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="State Emblem of India"
    >
      {/* Outer Emblem Crest Circle */}
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" className="opacity-90" />
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" className="opacity-70" />
      
      {/* Three Lions Silhouette Representation */}
      {/* Center Lion */}
      <path
        d="M50 16 C45 16 42 21 42 27 C42 32 46 36 46 42 L46 54 C44 55 42 57 42 60 L58 60 C58 57 56 55 54 54 L54 42 C54 36 58 32 58 27 C58 21 55 16 50 16 Z"
        fill="currentColor"
      />
      {/* Crown / Mane details */}
      <path d="M47 22 Q50 19 53 22 Q50 25 47 22 Z" fill="#F59E0B" />

      {/* Left Lion Head */}
      <path
        d="M38 24 C34 24 31 28 32 33 C33 37 37 40 38 45 L41 53 C39 54 37 56 36 58 L42 58 C42 53 40 48 40 43 C40 37 43 32 42 27 C41 24 39 24 38 24 Z"
        fill="currentColor"
        opacity="0.85"
      />

      {/* Right Lion Head */}
      <path
        d="M62 24 C66 24 69 28 68 33 C67 37 63 40 62 45 L59 53 C61 54 63 56 64 58 L58 58 C58 53 60 48 60 43 C60 37 57 32 58 27 C59 24 61 24 62 24 Z"
        fill="currentColor"
        opacity="0.85"
      />

      {/* Abacus Base Platform */}
      <rect x="26" y="60" width="48" height="6" rx="2" fill="currentColor" />

      {/* Ashoka Chakra (24-spoke wheel in center of abacus) */}
      <circle cx="50" cy="69" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="69" r="1.5" fill="currentColor" />
      {/* Spoke lines */}
      <line x1="50" y1="63" x2="50" y2="75" stroke="currentColor" strokeWidth="1" />
      <line x1="44" y1="69" x2="56" y2="69" stroke="currentColor" strokeWidth="1" />
      <line x1="45.8" y1="64.8" x2="54.2" y2="73.2" stroke="currentColor" strokeWidth="0.8" />
      <line x1="45.8" y1="73.2" x2="54.2" y2="64.8" stroke="currentColor" strokeWidth="0.8" />

      {/* Bull on Left */}
      <path d="M30 67 Q34 67 36 71 L28 71 Z" fill="currentColor" opacity="0.9" />

      {/* Horse on Right */}
      <path d="M70 67 Q66 67 64 71 L72 71 Z" fill="currentColor" opacity="0.9" />

      {/* Bell Lotus Base */}
      <path d="M22 75 C30 81 70 81 78 75 L74 78 C60 84 40 84 26 78 Z" fill="currentColor" />

      {/* Satyameva Jayate (Hindi Text Motif) */}
      <text
        x="50"
        y="92"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
};
