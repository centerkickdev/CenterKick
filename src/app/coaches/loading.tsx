import React from 'react';
import { DirectoryCardSkeleton } from '@/components/common/DirectoryCardSkeleton';

export default function CoachesLoading() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-900 text-white pt-32 pb-16 px-4 border-b border-gray-800 animate-pulse">
        <div className="max-w-[1200px] mx-auto text-center space-y-4">
          <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-800 rounded-xl mx-auto" />
          <div className="h-4 sm:h-5 w-72 sm:w-96 bg-gray-800/60 rounded-lg mx-auto" />
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10 pb-6 border-b border-gray-100 animate-pulse">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="h-10 w-full sm:w-64 bg-gray-100 rounded-xl" />
            <div className="h-10 w-32 bg-gray-100 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <DirectoryCardSkeleton variant="dark" count={8} />
        </div>
      </div>
    </div>
  );
}
