import Link from 'next/link';
import { Home, Users, BarChart2, Settings, Menu, Bell, X, Shield, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { BannerManager } from '@/components/dashboard/BannerManager';
import { DashboardSidebarNav } from '@/components/dashboard/DashboardSidebarNav';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

import { ToastProvider } from '@/context/ToastContext';

import { getCachedSettings } from '@/lib/cms';
import { getCachedData } from '@/lib/redis';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user record, profile record, and site settings in parallel from cache
  const [userRecord, profile, siteSettings] = await Promise.all([
    getCachedData(`user:record:${user.id}`, async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    }, 1800),
    getCachedData(`user:profile:${user.id}`, async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    }, 1800),
    getCachedSettings().then(res => res || {})
  ]);

  // Fetch user subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  const isSubscribed = subscriptions && subscriptions.length > 0;

  const role = (userRecord as any)?.role || 'player';
  const status = (profile as any)?.status || 'pending';

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Compute profile completeness
  const p = profile as any;
  const isProfileComplete = Boolean(
    p.avatar_url &&
    p.cover_url &&
    p.gallery_urls?.length >= 2 &&
    p.video_links?.length >= 1 &&
    p.first_name &&
    p.last_name
  );

  // Forced Redirect for Administrative roles to the unified Admin Portal
  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];
  if (adminRoles.includes(role)) {
    redirect('/admin');
  }

  const resolveUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const sidebarLogoUrl = resolveUrl(siteSettings.sidebarLogoUrl || siteSettings.logoUrl);
  const brandName = siteSettings.siteTitle || "CenterKick";

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gray-900 hidden md:flex flex-col text-gray-300">
          <div className="h-20 flex items-center px-4 md:px-8 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-3 w-full">
              {sidebarLogoUrl ? (
                 <div className="relative h-7 w-auto max-w-full flex items-center justify-start overflow-hidden">
                    <img src={sidebarLogoUrl} alt={brandName} className="h-full w-auto object-contain" />
                 </div>
              ) : (
                 <>
                    <div className="w-10 h-10 rounded-xl bg-[#b50a0a] flex items-center justify-center shadow-lg shadow-red-900/40">
                      <span className="text-white font-black text-xl">C</span>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter underline underline-offset-4 decoration-[#b50a0a]">{brandName}</span>
                 </>
              )}
            </Link>
          </div>
          <DashboardSidebarNav role={role} isSubscribed={isSubscribed ?? false} />
          {/* Footer */}
          <div className="p-6 border-t border-gray-800 shrink-0">
            <SignOutButton />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Banner Bar (Notices) */}
          <BannerManager isSubscribed={isSubscribed ?? false} isProfileComplete={isProfileComplete} />

          {/* Top Header */}
          <DashboardHeader 
            role={role}
            email={user?.email}
            sidebarLogoUrl={sidebarLogoUrl}
            brandName={brandName}
            notifications={notifications || []}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
