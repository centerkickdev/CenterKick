'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Users, UserCheck, Briefcase, FileText, PenTool, User,
  ShieldCheck, CreditCard, Settings, LayoutDashboard, Clock, Trophy, Search, Database, AlertTriangle, Headphones, Ticket
} from 'lucide-react';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { Home } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const isBlogger = role === 'blogger';
  const isOperations = role === 'operations';
  const isFinance = role === 'finance';
  const isSuperOrAdmin = ['superadmin', 'admin'].includes(role);

  const menuItems = [
    {
      group: 'Core',
      items: [
        ...(['superadmin', 'admin', 'operations', 'finance'].includes(role) 
          ? [
              { label: 'Verification Hub', href: '/admin/approvals', icon: ShieldCheck },
              { label: 'Support Tickets', href: '/admin/support', icon: Headphones }
            ] 
          : [])
      ]
    },
    ...(!isBlogger && !isFinance ? [{
      group: 'Directories',
      items: [
        { label: 'All Accounts', href: '/admin/users', icon: LayoutDashboard },
        { label: 'Players', href: '/admin/users?role=player', icon: Users },
        { label: 'Coaches', href: '/admin/users?role=coach', icon: UserCheck },
        { label: 'Agents', href: '/admin/users?role=agent', icon: Briefcase },
        { label: 'Scouts', href: '/admin/users?role=scout', icon: Search },
        { label: 'Organizations', href: '/admin/users?role=organization', icon: Trophy }
      ]
    }] : []),
    ...(isOperations || isSuperOrAdmin ? [{
      group: 'Tournament',
      items: [
        { label: 'Manage Tournament', href: '#', icon: Trophy, isComingSoon: true }
      ]
    }] : []),
    ...(isBlogger || isSuperOrAdmin ? [{
      group: 'Content',
      items: [
        { label: 'Blog / CMS', href: '/admin/blog', icon: FileText },
        ...(!isBlogger ? [{ label: 'Manage UI', href: '#', icon: PenTool, isComingSoon: true }] : [])
      ]
    }] : []),
    {
      group: 'Infrastructure',
      items: [
        { label: 'My Account', href: '/admin/account', icon: User },
        ...(isSuperOrAdmin ? [{ label: 'Manage Roles', href: '#', icon: ShieldCheck, isComingSoon: true }] : []),
        ...(['superadmin', 'admin', 'operations'].includes(role) ? [{ label: 'Data Management', href: '/admin/data-management', icon: Database }] : []),
        ...(isFinance || isSuperOrAdmin ? [
          { label: 'Transactions', href: '/admin/payments/transactions', icon: CreditCard },
          { label: 'Subscriptions', href: '/admin/payments/subscriptions', icon: Settings },
          { label: 'Coupons', href: '/admin/coupons', icon: Ticket }
        ] : []),
        ...(role === 'superadmin' ? [
          { label: 'System Settings', href: '/admin/settings', icon: Settings },
          { label: 'System Errors', href: '#', icon: AlertTriangle, isComingSoon: true }
        ] : [])
      ]
    }
  ];

  return (
    <nav className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {menuItems.map((section, idx) => (
        <div key={idx} className="space-y-1">
          <span className="px-4 text-xs font-bold text-gray-500 tracking-[0.2em]">{section.group}</span>
          {section.items.map((item: any) => {
            const itemRole = item.href.includes('?role=') ? item.href.split('role=')[1] : null;
            const currentRoleParam = searchParams.get('role');

            let isActive = false;
            if (item.href === '/admin') {
              isActive = pathname === '/admin';
            } else if (item.href !== '#') {
              if (itemRole) {
                isActive = pathname.startsWith('/admin/users') && currentRoleParam === itemRole;
              } else if (item.href === '/admin/users') {
                isActive = pathname === '/admin/users' && !currentRoleParam;
              } else {
                isActive = pathname.startsWith(item.href);
              }
            }
                
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.isComingSoon) {
                    e.preventDefault();
                    showToast('Coming Soon', 'info');
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group ${isActive
 ? 'text-white bg-[#b50a0a] shadow-lg shadow-red-900/20'
 : 'text-gray-400 hover:text-white hover:bg-white/5'
 } ${item.isComingSoon ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-[#b50a0a]'
 }`} />
                <span className={`text-xs tracking-wide ${isActive ? 'text-white' : 'text-gray-400'
 }`}>{item.label}</span>
                {item.isComingSoon && (
                  <span className="ml-auto text-[10px] font-bold text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="pt-4 mt-4 border-t border-gray-800/50 space-y-1">

        <div className="scale-95 origin-left">
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
