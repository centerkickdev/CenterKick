import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fafafa]">
      <div className="relative flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-[#b50a0a] animate-spin mb-6"></div>
        
        <h2 className="text-xl font-black text-gray-900 tracking-wide">
          Center<span className="text-[#b50a0a]">Kick</span>
        </h2>
        <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] mt-2">
          Loading...
        </p>
      </div>
    </div>
  );
}
