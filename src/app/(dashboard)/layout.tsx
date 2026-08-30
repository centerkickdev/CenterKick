import Link from 'next/link';
import { Home, Users, BarChart2, Settings, Menu, Bell, X, Shield, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { BannerManager } from '@/components/dashboard/BannerManager';
import { DesktopSidebar } from '@/components/dashboard/DesktopSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

import { ToastProvider } from '@/context/ToastContext';

import { getCachedSettings } from '@/lib/cms';
import { getCachedData } from '@/lib/redis';

import { getEffectiveUserSession } from '@/lib/auth/impersonation';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getEffectiveUserSession();

  if (!session) {
    redirect('/login');
  }

  const activeUserId = session.effectiveUserId;

  // Use service role admin client when impersonating or fetching cached user records
  const adminClient = createAdminClient();

  // Fetch user record, profile record, and site settings in parallel
  const [userRecord, profile, siteSettings] = await Promise.all([
    adminClient
      .from('users')
      .select('*')
      .eq('id', activeUserId)
      .single()
      .then(res => res.data),
    getCachedData(`user:profile:${activeUserId}`, async () => {
      const { data } = await adminClient
        .from('profiles')
        .select('*')
        .eq('user_id', activeUserId)
        .single();
      return data;
    }, 1800),
    getCachedSettings().then(res => res || {})
  ]);

  // Fetch user subscriptions
  const { data: subscriptions } = await adminClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', activeUserId)
    .eq('status', 'active');
    
  // Fetch confirmed transactions as fallback using adminClient
  const { data: confirmedTxs } = await adminClient
    .from('transactions')
    .select('id')
    .eq('user_id', profile?.id)
    .eq('status', 'confirmed')
    .limit(1);
  
  const role = (userRecord as any)?.role || 'player';
  const status = (profile as any)?.status || 'pending';

  const isSubscribed = 
    (subscriptions && subscriptions.length > 0) || 
    ((profile as any)?.is_subscribed === true) ||
    ['ACTIVE', 'SPONSORED', 'GIFT_COVERED'].includes((profile as any)?.subscription_status) ||
    (confirmedTxs && confirmedTxs.length > 0);

  // Fetch notifications
  const { data: notifications } = await adminClient
    .from('notifications')
    .select('*')
    .eq('user_id', activeUserId)
    .order('created_at', { ascending: false })
    .limit(20);

  // Compute profile completeness
  const p = (profile || {}) as any;
  const isPlayer = role === 'player' || role === 'athlete';
  const checks = [
    Boolean(p.avatar_url),
    Boolean(p.cover_url),
    ...(isPlayer ? [
      Boolean(p.gallery_urls?.length >= 2),
      Boolean(p.video_links?.length >= 1)
    ] : []),
    Boolean(p.first_name),
    Boolean(p.last_name)
  ];
  const completedCount = checks.filter(Boolean).length;
  const profileCompletionPercentage = Math.round((completedCount / checks.length) * 100);
  const isProfileComplete = completedCount === checks.length;

  // Forced Redirect for Administrative roles to the unified Admin Portal
  // (Bypassed if SuperAdmin is in active View-As Impersonation mode)
  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];
  if (!session.isImpersonating && adminRoles.includes(role)) {
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
      <div className="flex h-screen bg-gray-50 overflow-hidden flex-col">
        {session.isImpersonating && (
          <ImpersonationBanner
            targetEmail={session.targetUserEmail}
            targetId={session.effectiveUserId}
            targetRole={session.targetUserRole}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
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
            <BannerManager isSubscribed={isSubscribed ?? false} isProfileComplete={isProfileComplete} profileCompletionPercentage={profileCompletionPercentage} />

            {/* Top Header */}
            <DashboardHeader 
              role={role}
              email={session.targetUserEmail || userRecord?.email}
              sidebarLogoUrl={sidebarLogoUrl}
              brandName={brandName}
              notifications={notifications || []}
              avatarUrl={resolveUrl(profile?.avatar_url)}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-[#F9FAFB] relative z-0">
              <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

