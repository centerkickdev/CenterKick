'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Shield, Settings } from 'lucide-react';

interface DashboardSidebarNavProps {
  role: string;
  isSubscribed?: boolean;
}

export function DashboardSidebarNav({ role, isSubscribed = false }: DashboardSidebarNavProps) {
  const pathname = usePathname();

  const getLinkClasses = (href: string) => {
    const isActive = href === '/dashboard' 
      ? pathname === '/dashboard' 
      : pathname.startsWith(href);

    return isActive
      ? 'flex items-center gap-3 px-4 py-3 text-white bg-white/10 rounded-xl font-bold transition-all border border-white/5'
      : 'flex items-center gap-3 px-4 py-3 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-gray-400';
  };

  const getIconClasses = (href: string) => {
    const isActive = href === '/dashboard' 
      ? pathname === '/dashboard' 
      : pathname.startsWith(href);
    return isActive ? 'w-5 h-5 text-[#b50a0a]' : 'w-5 h-5 text-gray-400 group-hover:text-white';
  };

  const showManagedAccounts = isSubscribed && ['agent', 'organization'].includes(role);

  return (
    <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
      <Link href="/dashboard" className={`${getLinkClasses('/dashboard')} group`}>
        <Home className={getIconClasses('/dashboard')} />
        <span className="text-base tracking-wide">Overview</span>
      </Link>
      
      <Link href="/dashboard/profile" className={`${getLinkClasses('/dashboard/profile')} group`}>
        <Users className={getIconClasses('/dashboard/profile')} />
        <span className="text-base tracking-wide">My Profile</span>
      </Link>

      {showManagedAccounts && (
        <Link href="/dashboard/managed" className={`${getLinkClasses('/dashboard/managed')} group`}>
          <Users className={getIconClasses('/dashboard/managed')} />
          <span className="text-base tracking-wide">Managed Accounts</span>
        </Link>
      )}

      <div className="pt-8 mt-8 border-t border-gray-800">
        <span className="px-4 text-[10px] font-black text-gray-500 tracking-[0.2em]">Management</span>
        
        <Link href="/dashboard/subscription" className={`${getLinkClasses('/dashboard/subscription')} group mt-4`}>
          <Shield className={getIconClasses('/dashboard/subscription')} />
          <span className="text-base tracking-wide">Subscription</span>
        </Link>
        
        <Link href="/dashboard/settings" className={`${getLinkClasses('/dashboard/settings')} group`}>
          <Settings className={getIconClasses('/dashboard/settings')} />
          <span className="text-base tracking-wide">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
