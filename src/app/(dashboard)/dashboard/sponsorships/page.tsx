import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrgSponsorshipDashboard from '@/components/coupons/OrgSponsorshipDashboard';

import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = {
  title: 'Organization Sponsorship Hub | CenterKick',
};

export default async function OrgSponsorshipsPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user profile and verify organization role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, users(role)')
    .eq('user_id', user.id)
    .single();

  // Find all possible profile/user IDs associated with this user session (by auth user.id, profile.id, or email)
  const { data: userProfiles } = await adminClient
    .from('profiles')
    .select('id, user_id, email')
    .or(`user_id.eq.${user.id},id.eq.${user.id}${user.email ? `,email.ilike.${user.email}` : ''}`);

  const profileIdsSet = new Set<string>([user.id]);
  if (profile) {
    if (profile.id) profileIdsSet.add(profile.id);
    if (profile.user_id) profileIdsSet.add(profile.user_id);
  }
  if (userProfiles && userProfiles.length > 0) {
    userProfiles.forEach((p) => {
      if (p.id) profileIdsSet.add(p.id);
      if (p.user_id) profileIdsSet.add(p.user_id);
    });
  }

  const profileIds = Array.from(profileIdsSet);

  // 1. Fetch existing packages purchased by this account or associated IDs
  const { data: packages } = await adminClient
    .from('org_sponsorship_packages')
    .select('*')
    .or(`org_id.in.(${profileIds.join(',')})`)
    .order('created_at', { ascending: false });

  const myPackageIds = (packages || []).map((p) => p.id);

  // 2. Fetch codes belonging to these packages OR purchased by this buyer_id
  let codesQuery = adminClient.from('coupon_codes').select('*');
  if (myPackageIds.length > 0) {
    codesQuery = codesQuery.or(`package_id.in.(${myPackageIds.join(',')}),buyer_id.in.(${profileIds.join(',')})`);
  } else {
    codesQuery = codesQuery.in('buyer_id', profileIds);
  }

  const { data: codes } = await codesQuery.order('created_at', { ascending: false });

  // Fetch Payment Settings & System Plans from CMS site_content (same query as /gift)
  const { data: paymentContent } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'settings')
    .eq('section', 'payment')
    .single();

  const paymentSettings = paymentContent?.content || {};
  const systemPlans = paymentSettings.plans || {};

  const orgName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Organization';

  return (
    <div className="max-w-7xl mx-auto py-8">
      <OrgSponsorshipDashboard
        orgId={profile?.id || user.id}
        orgName={orgName}
        userEmail={user.email || profile?.email || ''}
        existingPackages={packages || []}
        existingCodes={codes || []}
        systemPlans={systemPlans}
        paymentSettings={paymentSettings}
      />
    </div>
  );
}
