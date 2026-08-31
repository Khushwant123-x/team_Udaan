import React from 'react';

interface PrototypeSealProps {
  className?: string;
  size?: number;
}

export const PrototypeSeal: React.FC<PrototypeSealProps> = ({ className = "w-64 h-64", size = 260 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-2xl transition-transform hover:scale-105 duration-300"
      >
        <defs>
          {/* Purple Gradient */}
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="50%" stopColor="#5B21B6" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>

          {/* Red Ribbon Gradient */}
          <linearGradient id="redRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>

          {/* Ribbon Shadow */}
          <filter id="ribbonShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Serrated / Scalloped Rosette Edge (24 Teeth) */}
        <path
          d="
            M 200,10 
            Q 208,18 217,13 Q 226,8 234,16 Q 242,24 251,21 Q 260,18 267,28 C 275,38 284,40 291,51 Q 298,62 307,67 Q 316,72 321,84 C 326,96 336,101 340,114 Q 344,127 349,134 Q 354,141 356,155 C 358,169 367,177 367,191 Q 367,205 364,213 Q 361,221 356,234 C 351,247 344,258 340,271 Q 336,284 326,290 Q 316,296 307,306 C 298,316 291,327 279,333 Q 267,339 258,347 Q 249,355 237,358 C 225,361 216,369 202,369 Q 188,369 179,361 C 167,355 158,347 146,343 Q 134,339 126,331 Q 118,323 107,314 C 96,305 91,294 82,285 Q 73,276 66,263 C 59,250 51,241 47,227 Q 43,213 41,200 C 39,187 43,173 47,160 Q 51,147 59,138 C 67,129 72,116 81,105 Q 90,94 99,85 C 108,76 116,65 127,57 Q 138,49 149,43 C 160,37 169,25 183,21 Z
          "
          fill="url(#purpleGrad)"
          stroke="#4C1D95"
          strokeWidth="3"
        />

        {/* Inner White Ring Border 1 */}
        <circle cx="200" cy="200" r="162" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity="0.9" />

        {/* Inner White Ring Border 2 (Dashed Accent) */}
        <circle cx="200" cy="200" r="150" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="8 4" fill="none" opacity="0.8" />

        {/* Solid Inner Purple Disc */}
        <circle cx="200" cy="200" r="138" fill="url(#purpleGrad)" />
        <circle cx="200" cy="200" r="135" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />

        {/* 5-Point Stars Array Top Arc */}
        {/* Star 1 */}
        <polygon points="200,75 204,87 217,87 207,95 210,107 200,99 190,107 193,95 183,87 196,87" fill="#FFFFFF" />
        {/* Star 2 */}
        <polygon points="152,90 156,102 169,102 159,110 162,122 152,114 142,122 145,110 135,102 148,102" fill="#FFFFFF" transform="rotate(-15 152 90)" />
        {/* Star 3 */}
        <polygon points="248,90 252,102 265,102 255,110 258,122 248,114 238,122 241,110 231,102 244,102" fill="#FFFFFF" transform="rotate(15 248 90)" />
        {/* Star 4 */}
        <polygon points="110,120 114,132 127,132 117,140 120,152 110,144 100,152 103,140 93,132 106,132" fill="#FFFFFF" transform="rotate(-30 110 120)" />
        {/* Star 5 */}
        <polygon points="290,120 294,132 307,132 297,140 300,152 290,144 280,152 283,140 273,132 286,132" fill="#FFFFFF" transform="rotate(30 290 120)" />

        {/* 5-Point Stars Array Bottom Arc */}
        {/* Star B1 */}
        <polygon points="200,305 204,317 217,317 207,325 210,337 200,329 190,337 193,325 183,317 196,317" fill="#FFFFFF" />
        {/* Star B2 */}
        <polygon points="152,290 156,302 169,302 159,310 162,322 152,314 142,322 145,310 135,302 148,302" fill="#FFFFFF" transform="rotate(15 152 290)" />
        {/* Star B3 */}
        <polygon points="248,290 252,302 265,302 255,310 258,322 248,314 238,322 241,310 231,302 244,302" fill="#FFFFFF" transform="rotate(-15 248 290)" />

        {/* RED RIBBON WRAP (Angled Across Seal) */}
        <g filter="url(#ribbonShadow)">
          {/* Left Ribbon End Banner Tail */}
          <path d="M 15 235 L 50 175 L 75 220 L 45 260 Z" fill="#991B1B" />

          {/* Right Ribbon End Banner Tail */}
          <path d="M 385 165 L 350 225 L 325 180 L 355 140 Z" fill="#991B1B" />

          {/* Main Angled Red Banner Bar */}
          <path
            d="M 15 240 L 385 150 L 385 200 L 15 290 Z"
            fill="url(#redRibbonGrad)"
            stroke="#991B1B"
            strokeWidth="2"
          />

          {/* Top & Bottom White Highlight Lines on Banner */}
          <line x1="15" y1="240" x2="385" y2="150" stroke="#FCA5A5" strokeWidth="2.5" />
          <line x1="15" y1="290" x2="385" y2="200" stroke="#B91C1C" strokeWidth="2.5" />

          {/* PROTOTYPE Bold Uppercase Text */}
          <text
            x="200"
            y="232"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="44"
            fontWeight="900"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="4"
            transform="rotate(-13.2 200 232)"
            style={{
              fontStyle: 'italic',
              textShadow: '2px 3px 6px rgba(0,0,0,0.6)',
            }}
          >
            PROTOTYPE
          </text>
        </g>
      </svg>
    </div>
  );
};
