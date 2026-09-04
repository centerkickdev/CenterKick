'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signout } from '@/app/login/actions';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton({ isCollapsed }: { isCollapsed?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    setLoading(true);

    try {
      // Clear client-side Supabase browser session
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Client Signout Error]:', err);
    }

    try {
      // Execute server action to clear cookies and session on server
      await signout();
    } catch (err) {
      // server action redirect throws NEXT_REDIRECT
    }

    // Perform hard navigation to root home page to clear mobile SPA caches
    window.location.href = '/';
  };

  return (
    <form action={signout} onSubmit={handleSignOut} className="w-full">
      <button 
        type="submit"
        disabled={loading}
        onClick={handleSignOut}
        className={`flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all group disabled:opacity-50 ${isCollapsed ? 'justify-center w-auto' : 'w-full'}`}
        title={isCollapsed ? "Sign Out" : undefined}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <LogOut className="w-5 h-5 group-hover:text-[#b50a0a] transition-colors" />
        )}
        {!isCollapsed && <span className="text-base tracking-wide">{loading ? 'Signing out...' : 'Sign Out'}</span>}
      </button>
    </form>
  );
}

