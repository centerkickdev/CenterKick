'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * High-performance, subtle skeleton image loader.
 * - Displays a visible, elegant silhouette skeleton while the image is loading.
 * - Instantly displays cached images without flashing a skeleton.
 * - Automatically falls back to SilhouetteInitialsFallback if the image fails or times out.
 * - Seamlessly crossfades the real image once decoded.
 */
export function SkeletonImage({
  src,
  alt,
  name,
  role,
  className = '',
  containerClassName = '',
  aspectRatio,
  variant = 'dark',
  priority = false,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  sizes,
  onClick,
  onLoad,
  onError,
}: SkeletonImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isShimmerVisible, setIsShimmerVisible] = useState(true);

  const effectiveLoading = priority ? 'eager' : loading;
  const effectiveFetchPriority = priority ? 'high' : fetchPriority || 'auto';
  const isDark = variant === 'dark';

  useEffect(() => {
    if (!src) {
      setIsLoaded(false);
      setHasError(true);
      setIsShimmerVisible(false);
      return;
    }

    setHasError(false);

    // Fast-path: check if image is already cached and loaded by the browser
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
        setIsShimmerVisible(false);
        return;
      } else {
        setHasError(true);
        setIsShimmerVisible(false);
        return;
      }
    }

    setIsLoaded(false);
    setIsShimmerVisible(true);

    // Safety timeout: if image stalls or network hangs for > 7s, gracefully show fallback
    const timeoutId = setTimeout(() => {
      if (!imgRef.current?.complete) {
        setHasError(true);
        setIsShimmerVisible(false);
      }
    }, 7000);

    return () => clearTimeout(timeoutId);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setTimeout(() => {
      setIsShimmerVisible(false);
    }, 200);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    setIsShimmerVisible(false);
    if (onError) onError();
  };

  // Graceful fallback on missing src or load error
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
      {/* Skeleton loading overlay: visible, subtle shimmer with silhouette outline */}
      {isShimmerVisible && (
        <div
          className={`absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center transition-opacity duration-300 ease-out ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          } ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}
          aria-hidden="true"
        >
          {/* Subtle silhouette silhouette outline inside skeleton */}
          <svg
            className={`w-2/5 h-2/5 transition-opacity duration-300 ${
              isDark ? 'text-zinc-700/80 fill-current' : 'text-gray-300 fill-current'
            }`}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="7" r="4.25" />
            <path d="M12 12.5c-4.5 0-8 2.5-8.5 6.5-.2 1.5.8 2.5 2.2 2.5h12.6c1.4 0 2.4-1 2.2-2.5-.5-4-4-6.5-8.5-6.5z" />
          </svg>

          {/* Animated pulse wave */}
          <div
            className={`absolute inset-0 animate-pulse ${
              isDark
                ? 'bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent'
                : 'bg-gradient-to-r from-transparent via-white/50 to-transparent'
            }`}
          />
        </div>
      )}

      {/* Actual image: smoothly crossfades once loaded and decoded */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={effectiveLoading}
        decoding={decoding}
        fetchPriority={effectiveFetchPriority}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
