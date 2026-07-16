'use client';

import { LogOut } from 'lucide-react';
import { signout } from '@/app/login/actions';
import { useFormStatus } from 'react-dom';

function SignOutSubmitButton({ isCollapsed }: { isCollapsed?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className={`flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all group disabled:opacity-50 ${isCollapsed ? 'justify-center w-auto' : 'w-full'}`}
      title={isCollapsed ? "Sign Out" : undefined}
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <LogOut className="w-5 h-5 group-hover:text-[#b50a0a] transition-colors" />
      )}
      {!isCollapsed && <span className="text-base tracking-wide">Sign Out</span>}
    </button>
  );
}

export function SignOutButton({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <form action={signout} className="w-full">
      <SignOutSubmitButton isCollapsed={isCollapsed} />
    </form>
  );
}
