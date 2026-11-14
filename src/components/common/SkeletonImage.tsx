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
 * - Keeps a subtle, muted shimmer overlay visible until the image is 100% loaded and decoded in background.
 * - Eliminates progressive-render artifacts, top-to-bottom scan lines, and abrupt pop-in.
 * - Detects cached images immediately to prevent jarring skeleton flashes.
 * - Gracefully falls back to SilhouetteInitialsFallback on error or missing src.
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
      setIsShimmerVisible(false);
      return;
    }

    setHasError(false);

    // Fast-path for already-cached images in browser memory
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
      setIsShimmerVisible(false);
      return;
    }

    setIsLoaded(false);
    setIsShimmerVisible(true);

    let isMounted = true;
    const preloader = new Image();
    preloader.src = src;

    const handleSuccess = async () => {
      if (!isMounted) return;

      // Decode the image off-thread to ensure all pixels are rasterized before reveal
      try {
        if ('decode' in preloader) {
          await preloader.decode();
        }
      } catch {
        // Safe fallback: decode promise rejection still allows image presentation
      }

      if (!isMounted) return;
      setIsLoaded(true);
      if (onLoad) onLoad();

      // Smoothly hide shimmer overlay after the crossfade transition
      setTimeout(() => {
        if (isMounted) {
          setIsShimmerVisible(false);
        }
      }, 300);
    };

    const handleError = () => {
      if (!isMounted) return;
      setHasError(true);
      setIsShimmerVisible(false);
      if (onError) onError();
    };

    if (preloader.complete && preloader.naturalWidth > 0) {
      handleSuccess();
    } else {
      preloader.onload = handleSuccess;
      preloader.onerror = handleError;
    }

    return () => {
      isMounted = false;
      preloader.onload = null;
      preloader.onerror = null;
    };
  }, [src, onLoad, onError]);

  // Clean fallback when image fails to load or is not provided
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
      {/* Subtle, muted shimmer overlay: stays on top until background decode is 100% complete */}
      {isShimmerVisible && (
        <div
          className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ease-out ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          } ${isDark ? 'bg-zinc-900' : 'bg-gray-100'}`}
          aria-hidden="true"
        >
          <div
            className={`w-full h-full animate-pulse ${
              isDark
                ? 'bg-gradient-to-r from-transparent via-zinc-800/40 to-transparent'
                : 'bg-gradient-to-r from-transparent via-gray-200/50 to-transparent'
            }`}
          />
        </div>
      )}

      {/* Actual image: stays completely hidden (opacity-0) until decoded in background, then seamlessly reveals */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={effectiveLoading}
        decoding={decoding}
        fetchPriority={effectiveFetchPriority}
        sizes={sizes}
        className={`w-full h-full object-cover transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onError={() => {
          setHasError(true);
          setIsShimmerVisible(false);
          if (onError) onError();
        }}
      />
    </div>
  );
}
