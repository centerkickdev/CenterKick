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
import { resolveIsSubscribed } from '@/lib/subscription';
import { isProfileComplete as checkProfileComplete } from '@/lib/utils/profile';

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
    }, 10),
    getCachedSettings().then(res => res || {})
  ]);

  // Fetch user subscriptions
  const { data: subscriptions } = await adminClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', activeUserId)
    .eq('status', 'active');
    
  const isSubscribedFromProfileOrSub = resolveIsSubscribed({
    isSubscribedFlag: (profile as any)?.is_subscribed,
    subscriptionStatus: (profile as any)?.subscription_status,
    hasActiveSubscriptionRow: Boolean(subscriptions && subscriptions.length > 0),
  });

  let hasConfirmedTransaction = false;
  let hasCouponRedemption = false;

  // Short-circuit: only fetch fallback tables if primary flags are not active
  if (profile?.id && !isSubscribedFromProfileOrSub) {
    const [{ data: confirmedTxs }, { data: redemptions }] = await Promise.all([
      adminClient
        .from('transactions')
        .select('id')
        .eq('user_id', profile?.id)
        .eq('status', 'confirmed')
        .limit(1),
      adminClient
        .from('coupon_redemptions')
        .select('id')
        .or(`redeemer_id.eq.${activeUserId}${profile?.id ? `,redeemer_id.eq.${profile.id}` : ''}`)
        .limit(1)
    ]);
    hasConfirmedTransaction = Boolean(confirmedTxs && confirmedTxs.length > 0);
    hasCouponRedemption = Boolean(redemptions && redemptions.length > 0);
  }
  
  const role = (userRecord as any)?.role || 'player';
  const status = (profile as any)?.status || 'pending';

  const isSubscribed = isSubscribedFromProfileOrSub || hasConfirmedTransaction || hasCouponRedemption;

  // Fetch notifications
  const { data: notifications } = await adminClient
    .from('notifications')
    .select('*')
    .eq('user_id', activeUserId)
    .order('created_at', { ascending: false })
    .limit(20);

  // Compute profile completeness
  const p = (profile || {}) as any;
  const isProfileComplete = checkProfileComplete({ ...p, users: { role }, role });

  let checks: boolean[] = [];
  if (role === 'coach' || role === 'coachs') {
    const isFreeAgent = Boolean(p.is_free_agent || p.current_club === 'Free Agent');
    const hasValidContract = isFreeAgent || Boolean(p.current_club && p.contract_expiry);
    let hasValidAge = false;
    if (p.date_of_birth) {
      const dob = new Date(p.date_of_birth);
      if (!isNaN(dob.getTime())) {
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        hasValidAge = age >= 18 && age <= 90;
      }
    }
    const exp = Number(p.years_of_experience);
    const hasExp = p.years_of_experience !== null && p.years_of_experience !== undefined && p.years_of_experience !== '' && !isNaN(exp) && exp >= 0;
    checks = [
      Boolean(p.first_name && p.last_name),
      hasValidAge,
      Boolean(p.avatar_url),
      hasExp,
      Boolean(p.formation && String(p.formation).trim()),
      isFreeAgent || Boolean(p.current_club),
      Boolean(p.country && String(p.country).trim()),
      hasValidContract,
      Array.isArray(p.languages_spoken) && p.languages_spoken.length > 0,
      Boolean(p.current_position || p.position)
    ];
  } else if (role === 'organization') {
    const orgName = (p.agency_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || '').trim();
    const yr = Number(p.year_established);
    const hasYear = p.year_established !== null && p.year_established !== undefined && p.year_established !== '' && !isNaN(yr) && yr >= 1800 && yr <= new Date().getFullYear();
    const bioText = p.bio ? String(p.bio).replace(/<[^>]*>?/gm, '').trim() : '';
    checks = [
      Boolean(orgName.length >= 2),
      Boolean(p.organization_type && String(p.organization_type).trim()),
      hasYear,
      Boolean(p.country && String(p.country).trim()),
      Boolean(p.avatar_url),
      Boolean(p.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.contact_email).trim())),
      Boolean(bioText.length >= 10)
    ];
  } else if (role === 'player' || role === 'athlete') {
    const isFreeAgent = Boolean(p.is_free_agent || p.current_club === 'Free Agent');
    const hasValidContract = isFreeAgent || Boolean(p.current_club && p.contract_expiry);
    const height = Number(p.height_cm);
    const hasHeight = Boolean(p.height_cm && !isNaN(height) && height >= 100 && height <= 230);
    checks = [
      Boolean(p.first_name && p.last_name),
      Boolean(p.avatar_url),
      Boolean(Array.isArray(p.gallery_urls) && p.gallery_urls.length >= 2),
      hasHeight,
      Boolean(p.position && String(p.position).trim()),
      isFreeAgent || Boolean(p.current_club && String(p.current_club).trim()),
      hasValidContract,
      Boolean(p.country && String(p.country).trim()),
      Boolean(p.foot && ['Right', 'Left', 'Both'].includes(p.foot))
    ];
  } else if (role === 'agent' || role === 'scout') {
    checks = [
      Boolean((p.first_name && p.last_name) || p.agency_name),
      Boolean(p.avatar_url),
      Boolean(p.country && String(p.country).trim()),
      Boolean(p.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.contact_email).trim()))
    ];
  } else if (role === 'professional') {
    checks = [
      Boolean(p.first_name && p.last_name),
      Boolean(p.avatar_url),
      Boolean(p.profession_category && String(p.profession_category).trim()),
      Boolean(p.country && String(p.country).trim()),
      Boolean(p.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.contact_email).trim()))
    ];
  } else {
    checks = [Boolean(p.avatar_url), Boolean(p.first_name), Boolean(p.last_name)];
  }

  const completedCount = checks.filter(Boolean).length;
  const profileCompletionPercentage = checks.length > 0 ? Math.round((completedCount / checks.length) * 100) : 100;

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

