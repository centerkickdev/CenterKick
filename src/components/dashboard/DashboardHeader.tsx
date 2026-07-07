'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bell } from 'lucide-react';
import { DashboardSidebarNav } from './DashboardSidebarNav';
import { SignOutButton } from './SignOutButton';

interface DashboardHeaderProps {
  role: string;
  email?: string;
  sidebarLogoUrl?: string;
  brandName: string;
}

export function DashboardHeader({ role, email, sidebarLogoUrl, brandName }: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm relative z-10">
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-6 ml-auto">
          <button className="p-2 text-gray-400 hover:text-primary transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#b50a0a] rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <span className="text-gray-900 font-bold text-sm truncate max-w-full max-w-[150px]">{email}</span>
              <p className="text-[10px] font-bold text-[#b50a0a] tracking-wide">{role}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center font-bold text-white shadow-lg text-sm">
              {email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DASHBOARD MENU OVERLAY */}
      <div className={`md:hidden fixed inset-0 z-[999] transition-all duration-300 ${
 isOpen ? 'visible' : 'invisible pointer-events-none'
 }`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />
        {/* Panel */}
        <div className={`absolute inset-0 left-0 w-72 bg-gray-900 flex flex-col text-gray-300 transition-transform duration-300 ${
 isOpen ? 'translate-x-0' : '-translate-x-full'
 }`}>
          {/* Panel Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 shrink-0">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 w-full">
              {sidebarLogoUrl ? (
                 <div className="relative h-7 w-auto max-w-[80%] flex items-center justify-start overflow-hidden">
                    <img src={sidebarLogoUrl} alt={brandName} className="h-full w-auto object-contain" />
                 </div>
              ) : (
                 <>
                    <div className="w-8 h-8 rounded-lg bg-[#b50a0a] flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-base">C</span>
                    </div>
                    <span className="text-lg font-black text-white tracking-tighter">{brandName}</span>
                 </>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
            <DashboardSidebarNav role={role} />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800">
            <SignOutButton />
          </div>
        </div>
      </div>
    </>
  );
}
