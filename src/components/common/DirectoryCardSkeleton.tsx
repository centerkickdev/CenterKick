'use client';

import React from 'react';

interface DirectoryCardSkeletonProps {
  variant?: 'dark' | 'light';
  count?: number;
  className?: string;
}

export function DirectoryCardSkeleton({
  variant = 'dark',
  count = 1,
  className = '',
}: DirectoryCardSkeletonProps) {
  const isDark = variant === 'dark';
  const items = Array.from({ length: count });

  const renderCard = (key: number) => (
    <div
      key={key}
      className={`relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md animate-pulse ${
        isDark ? 'bg-gray-950 border border-gray-900' : 'bg-gray-100 border border-gray-200'
      } ${className}`}
      aria-hidden="true"
    >
      {/* Background Shimmer Gradient */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-t from-gray-900 via-gray-950 to-gray-900'
            : 'bg-gradient-to-t from-gray-200 via-gray-100 to-gray-200'
        }`}
      />

      {/* Center silhouette placeholder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg
          className={`w-16 h-16 ${isDark ? 'text-gray-800' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      {/* Dark gradient overlay at bottom matching live cards */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-t from-black/95 via-black/40 to-transparent'
            : 'bg-gradient-to-t from-white/95 via-white/40 to-transparent'
        }`}
      />

      {/* Bottom Skeleton Lines (Position + Name) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-2">
        {/* Position / Role Badge Skeleton */}
        <div
          className={`h-3 w-20 rounded-md ${
            isDark ? 'bg-red-950/70' : 'bg-red-100'
          }`}
        />
        {/* Name Line 1 Skeleton */}
        <div
          className={`h-4.5 w-3/4 rounded-md ${
            isDark ? 'bg-gray-800' : 'bg-gray-300'
          }`}
        />
        {/* Name Line 2 Skeleton */}
        <div
          className={`h-3.5 w-1/2 rounded-md opacity-70 ${
            isDark ? 'bg-gray-800' : 'bg-gray-300'
          }`}
        />
      </div>
    </div>
  );

  if (count === 1) {
    return renderCard(0);
  }

  return (
    <>
      {items.map((_, i) => renderCard(i))}
    </>
  );
}
