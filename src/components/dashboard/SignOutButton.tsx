'use client';

import { LogOut } from 'lucide-react';
import { signout } from '@/app/login/actions';

export function SignOutButton() {
  return (
    <button 
      onClick={() => signout()}
      className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all group"
    >
      <LogOut className="w-5 h-5 group-hover:text-[#b50a0a] transition-colors" />
      <span className="text-base tracking-wide">Sign Out</span>
    </button>
  );
}
