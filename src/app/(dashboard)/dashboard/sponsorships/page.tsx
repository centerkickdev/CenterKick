import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrgSponsorshipDashboard from '@/components/coupons/OrgSponsorshipDashboard';

export const metadata = {
  title: 'Organization Sponsorship Hub | CenterKick',
};

export default async function OrgSponsorshipsPage() {
  const supabase = await createClient();
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

  // Fetch existing packages & codes issued by this Organization
  const { data: packages } = await supabase
    .from('org_sponsorship_packages')
    .select('*')
    .eq('org_id', profile?.id || user.id)
    .order('created_at', { ascending: false });

  const { data: codes } = await supabase
    .from('coupon_codes')
    .select('*')
    .eq('buyer_id', profile?.id || user.id)
    .order('created_at', { ascending: false });

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
