'use client';

import { AlertTriangle, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BannerManagerProps {
  isSubscribed?: boolean;
  isProfileComplete?: boolean;
  profileCompletionPercentage?: number;
}

export function BannerManager({ isSubscribed = false, isProfileComplete = false, profileCompletionPercentage = 0 }: BannerManagerProps) {
  return (
    <div className="flex flex-col">
      {/* Subscription Notice */}
      {!isSubscribed && (
        <div className="bg-[#b50a0a] text-white px-4 md:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg relative overflow-hidden gap-3">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse shrink-0">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide leading-none mb-1">Attention Required</p>
              <p className="text-xs font-bold text-white/80 tracking-tight">Your dashboard is <span className="text-white underline underline-offset-2">restricted</span>. Please activate your subscription to unlock platform features.</p>
            </div>
          </div>
          <Link href="/dashboard/subscription" className="relative z-10 w-full md:w-auto">
            <button className="w-full md:w-auto bg-white text-[#b50a0a] px-5 py-2 rounded-lg text-xs font-bold tracking-wide hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20 transform active:scale-95">
              Subscribe Now <ChevronRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      )}

      {/* Profile Incomplete Notice (Non-dismissible notice for any account with missing mandatory fields) */}
      {!isProfileComplete && (
        <div className="bg-amber-500 text-white px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg relative overflow-hidden gap-3 border-b border-amber-600/30">
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="3"></circle>
                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="white" strokeWidth="3" strokeDasharray={`${profileCompletionPercentage}, 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide leading-none mb-1">
                Profile Incomplete <span className="text-white/90 text-xs font-bold">({profileCompletionPercentage}% completed)</span>
              </p>
              <p className="text-xs font-bold text-white/95 tracking-tight">
                Your profile has missing mandatory fields. Complete all required fields to activate your public profile and appear in directory searches.
              </p>
            </div>
          </div>
          <Link href="/dashboard/profile" className="relative z-10 w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto bg-white text-amber-700 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide hover:bg-amber-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 transform active:scale-95">
              Complete Profile <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

