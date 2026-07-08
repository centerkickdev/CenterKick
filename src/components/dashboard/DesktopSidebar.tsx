'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardSidebarNav } from '@/components/dashboard/DashboardSidebarNav';
import { SignOutButton } from '@/components/dashboard/SignOutButton';

interface DesktopSidebarProps {
  role: string;
  isSubscribed: boolean;
  sidebarLogoUrl: string;
  brandName: string;
}

export function DesktopSidebar({ role, isSubscribed, sidebarLogoUrl, brandName }: DesktopSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`${isCollapsed ? 'w-24' : 'w-72'} bg-gray-900 hidden lg:flex flex-col text-gray-300 transition-all duration-300 relative shrink-0 z-50`}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-gray-800 border border-gray-700 text-gray-300 rounded-full p-1 hover:bg-gray-700 hover:text-white transition-all z-50 shadow-md"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4 lg:px-8'} border-b border-gray-800 shrink-0 overflow-hidden`}>
        <Link href="/" className="flex items-center gap-3 w-full justify-center">
          {sidebarLogoUrl && !isCollapsed ? (
             <div className="relative h-7 w-auto max-w-full flex items-center justify-start overflow-hidden">
                <img src={sidebarLogoUrl} alt={brandName} className="h-full w-auto object-contain" />
             </div>
          ) : (
             <>
                <div className="w-10 h-10 rounded-xl bg-[#b50a0a] flex items-center justify-center shadow-lg shadow-red-900/40 shrink-0">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                {!isCollapsed && <span className="text-2xl font-bold text-white tracking-tighter underline underline-offset-4 decoration-[#b50a0a] truncate">{brandName}</span>}
             </>
          )}
        </Link>
      </div>
      
      <DashboardSidebarNav role={role} isSubscribed={isSubscribed} isCollapsed={isCollapsed} />
      
      {/* Footer */}
      <div className={`p-6 border-t border-gray-800 shrink-0 flex ${isCollapsed ? 'justify-center' : ''}`}>
        <SignOutButton isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
