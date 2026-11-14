'use client';

import React, { useState, useEffect } from 'react';
import { SilhouetteInitialsFallback } from './SilhouetteInitialsFallback';

export interface SkeletonImageProps {
  src?: string | null;
  alt: string;
  name?: string;
  role?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  variant?: 'dark' | 'light';
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  sizes?: string;
  onClick?: () => void;
  onLoad?: () => void;
}

export function SkeletonImage({
  src,
  alt,
  name,
  role,
  className = '',
  containerClassName = '',
  aspectRatio,
  variant = 'dark',
  loading = 'lazy',
  decoding = 'async',
  sizes,
  onClick,
  onLoad,
}: SkeletonImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state whenever image source changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const isDark = variant === 'dark';

  // If there is no src or an error occurred during loading, render the clean silhouette fallback
  if (!src || hasError) {
    return (
      <div className={`relative w-full h-full ${aspectRatio || ''} ${containerClassName}`}>
        <SilhouetteInitialsFallback
          name={name || alt}
          role={role}
          variant={variant}
          className={className}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${aspectRatio || ''} ${containerClassName}`}
      onClick={onClick}
    >
      {/* Shimmer Skeleton Placeholder shown while image is loading */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 z-0 animate-pulse ${
            isDark
              ? 'bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950'
              : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'
          }`}
          aria-hidden="true"
        >
          {/* Subtle center placeholder icon while shimmering */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <svg
              className={`w-12 h-12 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      )}

      {/* Actual Image with smooth crossfade upon load */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        onLoad={() => {
          setIsLoaded(true);
          if (onLoad) onLoad();
        }}
        onError={() => {
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
