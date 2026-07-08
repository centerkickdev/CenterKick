'use client';

import { useState } from 'react';
import { Menu, X, Shield, Home } from 'lucide-react';
import Link from 'next/link';
import { AdminSidebar } from './AdminSidebar';
import { SignOutButton } from '../dashboard/SignOutButton';

export function AdminMobileNav({ role, adminLogoUrl }: { role: string; adminLogoUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .mobile-toggle-btn, .mobile-drawer-container {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile Toggle Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="mobile-toggle-btn lg:hidden p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-sm shrink-0"
        aria-label="Open Sidebar Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Drawer Overlay & Backdrop */}
      {isOpen && (
        <div className="mobile-drawer-container fixed inset-0 z-[999] lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-80 max-w-[85vw] bg-gray-900 flex flex-col text-gray-300 shadow-2xl h-full animate-in slide-in-from-left duration-300">
            {/* Header of mobile sidebar */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 bg-black/20 shrink-0">
              <Link href="/admin" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                {adminLogoUrl ? (
                  <div className="relative h-7 w-auto max-w-full flex items-center justify-start overflow-hidden">
                    <img src={adminLogoUrl} alt="Admin Logo" className="h-full w-auto object-contain" />
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-[#b50a0a] flex items-center justify-center shadow-lg shadow-red-900/40">
                      <Shield className="text-white w-6 h-6" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xl font-bold text-white tracking-tighter leading-none">Admin</span>
                      <span className="text-xs font-bold text-[#b50a0a] tracking-wide mt-1">Control Panel</span>
                    </div>
                  </>
                )}
              </Link>

              {/* Close Button X */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close Sidebar Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar list items */}
            <div className="flex-1 overflow-y-auto flex flex-col min-h-0" onClick={() => setIsOpen(false)}>
              <AdminSidebar role={role} />
            </div>

            {/* Bottom options */}
            <div className="p-6 border-t border-gray-800 flex flex-col gap-4 shrink-0">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-xs font-bold tracking-wide text-gray-500 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-4 h-4" /> User Dashboard
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
