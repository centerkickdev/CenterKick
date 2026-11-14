'use client';

import React from 'react';

interface SilhouetteInitialsFallbackProps {
  name?: string;
  role?: string;
  variant?: 'dark' | 'light';
  className?: string;
}

export function SilhouetteInitialsFallback({
  name = '',
  role,
  variant = 'dark',
  className = '',
}: SilhouetteInitialsFallbackProps) {
  // Extract up to 2 uppercase initials
  const initials = React.useMemo(() => {
    if (!name || !name.trim()) return 'CK';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const isDark = variant === 'dark';

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none ${
        isDark
          ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-400'
          : 'bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 text-gray-500'
      } ${className}`}
      aria-label={name ? `${name} placeholder` : 'Profile placeholder'}
    >
      {/* Background stylized field/radial accent */}
      <div
        className={`absolute inset-0 opacity-40 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-transparent to-transparent'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent'
        }`}
      />

      {/* Elegant Athlete Silhouette SVG */}
      <svg
        className={`w-3/5 h-3/5 transition-transform duration-500 group-hover:scale-105 ${
          isDark ? 'text-gray-800/80 fill-current' : 'text-gray-400/80 fill-current'
        }`}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="12" cy="7" r="4.25" />
        {/* Athletic Torso & Shoulders */}
        <path d="M12 12.5c-4.5 0-8 2.5-8.5 6.5-.2 1.5.8 2.5 2.2 2.5h12.6c1.4 0 2.4-1 2.2-2.5-.5-4-4-6.5-8.5-6.5z" />
      </svg>

      {/* Prominent Initials Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-110 ${
            isDark
              ? 'bg-black/70 border-[#b50a0a]/50 text-white shadow-black/80'
              : 'bg-white/80 border-[#b50a0a]/40 text-gray-900 shadow-gray-400/50'
          }`}
        >
          <span className="text-sm font-bold tracking-wider">{initials}</span>
        </div>
      </div>

      {/* Role Tag Hint if Provided */}
      {role && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/60 text-gray-300 uppercase tracking-widest backdrop-blur-xs">
            {role}
          </span>
        </div>
      )}
    </div>
  );
}
