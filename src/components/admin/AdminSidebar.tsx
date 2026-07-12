'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users, UserCheck, Briefcase, FileText, PenTool,
  ShieldCheck, CreditCard, Settings, LayoutDashboard, Clock, Trophy, Search, Database, AlertTriangle
} from 'lucide-react';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { Home } from 'lucide-react';

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const isBlogger = role === 'blogger';
  const isOperations = role === 'operations';
  const isFinance = role === 'finance';
  const isSuperOrAdmin = ['superadmin', 'admin'].includes(role);

  const menuItems = [
    {
      group: 'Core',
      items: [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
        ...(['superadmin', 'admin', 'operations', 'finance'].includes(role) 
          ? [
              { label: 'Verification Hub', href: '/admin/approvals', icon: ShieldCheck }
            ] 
          : [])
      ]
    },
    ...(!isBlogger && !isFinance ? [{
      group: 'Directories',
      items: [
        { label: 'All Accounts', href: '/admin/users', icon: LayoutDashboard },
        { label: 'Players', href: '/admin/players', icon: Users },
        { label: 'Coaches', href: '/admin/coaches', icon: UserCheck },
        { label: 'Agents', href: '/admin/agents', icon: Briefcase },
        { label: 'Scouts', href: '/admin/scouts', icon: Search },
        { label: 'Organizations', href: '/admin/organizations', icon: Trophy }
      ]
    }] : []),
    ...(isOperations || isSuperOrAdmin ? [{
      group: 'Tournament',
      items: [
        { label: 'Manage Tournament', href: '/admin/tournaments', icon: Trophy }
      ]
    }] : []),
    ...(isBlogger || isSuperOrAdmin ? [{
      group: 'Content',
      items: [
        { label: 'Blog / CMS', href: '/admin/blog', icon: FileText },
        ...(!isBlogger ? [{ label: 'Manage UI', href: '/admin/manage-ui', icon: PenTool }] : [])
      ]
    }] : []),
    {
      group: 'Infrastructure',
      items: [
        ...(isSuperOrAdmin ? [{ label: 'Manage Roles', href: '/admin/roles', icon: ShieldCheck }] : []),
        ...(['superadmin', 'admin', 'operations'].includes(role) ? [{ label: 'Data Management', href: '/admin/data-management', icon: Database }] : []),
        ...(isFinance || isSuperOrAdmin ? [
          { label: 'Transactions', href: '/admin/payments/transactions', icon: CreditCard },
          { label: 'Subscriptions', href: '/admin/payments/subscriptions', icon: Settings }
        ] : []),
        ...(role === 'superadmin' ? [
          { label: 'System Settings', href: '/admin/settings', icon: Settings },
          { label: 'System Errors', href: '/admin/system-errors', icon: AlertTriangle }
        ] : [])
      ]
    }
  ];

  return (
    <nav className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {menuItems.map((section, idx) => (
        <div key={idx} className="space-y-1">
          <span className="px-4 text-xs font-bold text-gray-500 tracking-[0.2em]">{section.group}</span>
          {section.items.map((item) => {
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group ${isActive
 ? 'text-white bg-[#b50a0a] shadow-lg shadow-red-900/20'
 : 'text-gray-400 hover:text-white hover:bg-white/5'
 }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-[#b50a0a]'
 }`} />
                <span className={`text-xs tracking-wide ${isActive ? 'text-white' : 'text-gray-400'
 }`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      <div className="pt-4 mt-4 border-t border-gray-800/50 space-y-1">
        <span className="px-4 text-xs font-bold text-gray-500 tracking-[0.2em]">Session</span>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-gray-400 hover:text-white hover:bg-white/5 group"
        >
          <Home className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          <span className="text-xs tracking-wide text-gray-400 group-hover:text-white">User Dashboard</span>
        </Link>
        <div className="scale-95 origin-left">
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
