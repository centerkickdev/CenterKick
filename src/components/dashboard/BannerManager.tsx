'use client';

import { useState } from 'react';
import { AlertTriangle, Info, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BannerManagerProps {
  status: string;
}

export function BannerManager({ status }: BannerManagerProps) {
  const [showGeneral, setShowGeneral] = useState(true);

  return (
    <div className="flex flex-col">
      {/* Critical Notice: Non-dismissible */}
      {status === 'pending' && (
        <div className="bg-[#b50a0a] text-white px-4 md:px-8 py-3 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-wide leading-none mb-1">Attention Required</p>
              <p className="text-[11px] font-bold text-white/80 tracking-tight">Your profile is currently <span className="text-white underline underline-offset-2">restricted</span>. Complete your profile and activate your subscription to go public.</p>
            </div>
          </div>
          <Link href="/dashboard/subscription" className="relative z-10">
            <button className="bg-white text-[#b50a0a] px-5 py-2 rounded-lg text-[10px] font-black tracking-wide hover:bg-gray-100 transition-all flex items-center gap-2 shadow-xl shadow-black/20 transform active:scale-95">
              Activate Now <ChevronRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      )}

      {/* General Notice: Dismissible */}
      {showGeneral && (
        <div className="bg-white border-b border-gray-100 text-gray-900 px-4 md:px-8 py-3 flex items-center justify-between group transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#b50a0a]">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black tracking-wide text-[#b50a0a] leading-none mb-1">New Feature</p>
              <p className="text-[11px] font-bold text-gray-500 tracking-tight">You can now track your profile views in real-time. Check the <span className="text-gray-900">Analytics</span> tab for details.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowGeneral(false)}
            className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
