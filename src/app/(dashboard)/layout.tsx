import Link from 'next/link';
import { Home, Users, BarChart2, Settings, Menu, Bell, X, Shield, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { BannerManager } from '@/components/dashboard/BannerManager';
import { DesktopSidebar } from '@/components/dashboard/DesktopSidebar';
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
        {/* Desktop Collapsible Sidebar */}
        <DesktopSidebar 
          role={role} 
          isSubscribed={isSubscribed ?? false} 
          sidebarLogoUrl={sidebarLogoUrl} 
          brandName={brandName} 
        />

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
