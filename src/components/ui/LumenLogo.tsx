import React from 'react';

interface LumenLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'symbol' | 'compact';
  theme?: 'dark' | 'light';
  showTagline?: boolean;
}

export function LumenLogoSymbol({ size = 38, className = '' }: { size?: number | string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LUMEN.AI Symbol"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="lumen-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="orbital-glow" x="-30%" y="-30%" width="160%" height="160%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Stem 3D Gradient: Cyan to Electric Blue */}
        <linearGradient id="stemGrad" x1="28" y1="18" x2="52" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="40%" stopColor="#00D2FF" />
          <stop offset="85%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Stem Front Face / Highlight */}
        <linearGradient id="stemFacetGrad" x1="32" y1="18" x2="32" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.1" />
        </linearGradient>

        {/* Base 3D Gradient: Electric Blue to Neon Violet / Magenta */}
        <linearGradient id="baseGrad" x1="25" y1="75" x2="96" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="30%" stopColor="#8B5CF6" />
          <stop offset="70%" stopColor="#C026D3" />
          <stop offset="100%" stopColor="#E879F9" />
        </linearGradient>

        {/* Growth Bar 1 */}
        <linearGradient id="bar1Grad" x1="56" y1="62" x2="56" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Growth Bar 2 */}
        <linearGradient id="bar2Grad" x1="68" y1="46" x2="68" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Growth Bar 3 */}
        <linearGradient id="bar3Grad" x1="80" y1="30" x2="80" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="50%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>

        {/* Orbital Swoosh Gradient */}
        <linearGradient id="orbitalGrad" x1="12" y1="80" x2="104" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0" />
          <stop offset="25%" stopColor="#00F0FF" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#38BDF8" stopOpacity="1" />
          <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
        </linearGradient>

        {/* Lens Flare Radial */}
        <radialGradient id="flareGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#0284C7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Backlight Glow */}
      <circle cx="58" cy="60" r="38" fill="#00D2FF" opacity="0.12" filter="url(#lumen-glow)" />
      <circle cx="68" cy="82" r="28" fill="#C026D3" opacity="0.18" filter="url(#lumen-glow)" />

      {/* Orbital Swoosh Back Path */}
      <path
        d="M 16 82 C 10 70, 20 48, 55 42 C 80 38, 102 44, 104 54"
        stroke="url(#orbitalGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* 3 Ascending Growth Bars cradled in the 'L' */}
      {/* Bar 1 */}
      <g>
        <rect x="52" y="60" width="8" height="19" rx="2" fill="url(#bar1Grad)" />
        <rect x="52" y="60" width="8" height="3" rx="1.5" fill="#CFFAFE" opacity="0.75" />
      </g>

      {/* Bar 2 */}
      <g>
        <rect x="64" y="44" width="8" height="35" rx="2" fill="url(#bar2Grad)" />
        <rect x="64" y="44" width="8" height="3" rx="1.5" fill="#E0F2FE" opacity="0.85" />
      </g>

      {/* Bar 3 (Tallest with neon spark) */}
      <g>
        <rect x="76" y="28" width="8" height="51" rx="2" fill="url(#bar3Grad)" />
        <rect x="76" y="28" width="8" height="3" rx="1.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* The 3D Beveled 'L' */}
      {/* Vertical Stem Body */}
      <path
        d="M 30 18 L 47 18 L 42 78 L 30 78 Z"
        fill="url(#stemGrad)"
        filter="drop-shadow(0 2px 8px rgba(0,210,255,0.3))"
      />
      {/* Vertical Stem Bevel Facet */}
      <path
        d="M 30 18 L 38 21 L 34 76 L 30 78 Z"
        fill="url(#stemFacetGrad)"
      />
      {/* Vertical Stem Outer Chamfer */}
      <path
        d="M 47 18 L 44 23 L 39 77 L 42 78 Z"
        fill="#0369A1"
        opacity="0.6"
      />

      {/* Horizontal Base of 'L' with Violet-Magenta Gradient */}
      <path
        d="M 28 73 L 44 73 L 94 73 C 96.5 73, 98 75.5, 96.8 77.8 L 90.5 89 C 89.6 90.6, 87.8 91.5, 86 91.5 L 34 91.5 C 30.5 91.5, 27.5 88.5, 27.5 85 L 28 73 Z"
        fill="url(#baseGrad)"
        filter="drop-shadow(0 4px 12px rgba(192,38,211,0.45))"
      />
      {/* Horizontal Base Top Bevel Reflection */}
      <path
        d="M 28 73 L 94 73 L 91 76 L 31 76 Z"
        fill="#FFFFFF"
        opacity="0.35"
      />

      {/* Orbital Swoosh Front Swoop (Curves over the 'L' and bars) */}
      <path
        d="M 12 79 C 14 87, 30 92, 54 86 C 78 80, 96 66, 105 45 C 107 41, 107 38, 106 36"
        stroke="url(#orbitalGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        filter="url(#orbitalGlow)"
      />
      <path
        d="M 14 78 C 22 84, 38 87, 56 83 C 78 78, 94 65, 103 47"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Sparkle / Lens Flare on Stem Corner */}
      <circle cx="34" cy="20" r="12" fill="url(#flareGrad)" />
      {/* Starburst Cross */}
      <path
        d="M 34 13 L 34 27 M 27 20 L 41 20"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}

export function LumenLogo({
  className = '',
  size = 38,
  variant = 'full',
  theme = 'dark',
  showTagline = true,
}: LumenLogoProps) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';

  if (variant === 'symbol') {
    return <LumenLogoSymbol size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LumenLogoSymbol size={size} className="shrink-0" />

      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight leading-none">
          <span
            className="font-extrabold tracking-wider text-xl sm:text-2xl"
            style={{
              color: textPrimary,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            LUMEN
          </span>
          {/* Neon Pink/Magenta Dot */}
          <span
            className="w-2 h-2 rounded-full mx-1 shadow-[0_0_8px_#EC4899] bg-[#F43F5E] inline-block"
            aria-hidden="true"
          />
          <span
            className="font-extrabold tracking-wider text-xl sm:text-2xl"
            style={{
              background: 'linear-gradient(135deg, #00D2FF 0%, #38BDF8 60%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            AI
          </span>
        </div>

        {variant === 'full' && showTagline && (
          <span
            className="text-[8px] sm:text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.5"
            style={{ color: textSecondary }}
          >
            Smarter Business. Brighter Growth.
          </span>
        )}
      </div>
    </div>
  );
}
