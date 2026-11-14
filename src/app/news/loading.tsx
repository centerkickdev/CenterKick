import React from 'react';

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <section className="bg-gray-950 text-white pt-32 pb-16 px-4 border-b border-gray-900 animate-pulse">
        <div className="max-w-[1200px] mx-auto text-center space-y-4">
          <div className="h-4 w-24 bg-[#b50a0a]/40 rounded mx-auto" />
          <div className="h-8 sm:h-12 w-64 sm:w-96 bg-gray-800 rounded-xl mx-auto" />
          <div className="h-4 sm:h-5 w-72 sm:w-80 bg-gray-800/60 rounded-lg mx-auto" />
        </div>
      </section>

      {/* News Grid Skeleton */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              {/* 16:9 Thumbnail Skeleton */}
              <div className="aspect-video w-full rounded-2xl bg-gray-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              </div>
              {/* Category Pill Skeleton */}
              <div className="h-3.5 w-20 bg-gray-200 rounded-md" />
              {/* Title Lines */}
              <div className="space-y-2">
                <div className="h-5 w-full bg-gray-200 rounded-md" />
                <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
              </div>
              {/* Excerpt */}
              <div className="h-3.5 w-5/6 bg-gray-100 rounded-md" />
              {/* Meta Date */}
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
