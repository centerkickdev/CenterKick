'use client';

import { AlertTriangle, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BannerManagerProps {
  isSubscribed?: boolean;
  isProfileComplete?: boolean;
}

export function BannerManager({ isSubscribed = false, isProfileComplete = false }: BannerManagerProps) {
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

      {/* Profile Incomplete Notice (Only show if subscribed, or we can show both, but usually one at a time is better) */}
      {isSubscribed && !isProfileComplete && (
        <div className="bg-amber-500 text-white px-4 md:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg relative overflow-hidden gap-3">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide leading-none mb-1">Profile Incomplete</p>
              <p className="text-xs font-bold text-white/90 tracking-tight">Please complete your profile (avatar, cover image, video links) to go Public Live.</p>
            </div>
          </div>
          <Link href="/dashboard/profile" className="relative z-10 w-full md:w-auto">
            <button className="w-full md:w-auto bg-white text-amber-600 px-5 py-2 rounded-lg text-xs font-bold tracking-wide hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20 transform active:scale-95">
              Complete Profile <ChevronRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

