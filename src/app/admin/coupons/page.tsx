import React from 'react';
import { getAdminCoupons, getCouponSecurityLogs } from './actions';
import AdminCouponsClient from '@/components/admin/coupons/AdminCouponsClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Coupon & Sponsorship Management | CenterKick Admin',
};

export default async function AdminCouponsPage() {
  const supabaseAdmin = createAdminClient();
  const supabaseServer = await createClient();

  const [{ data: { user } }, couponsRes, logsRes, { data: paymentContent }] = await Promise.all([
    supabaseServer.auth.getUser(),
    getAdminCoupons(),
    getCouponSecurityLogs(),
    supabaseAdmin
      .from('site_content')
      .select('content')
      .eq('page', 'settings')
      .eq('section', 'payment')
      .single(),
  ]);

  let userRole = 'admin';
  if (user?.id) {
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (userRecord?.role) {
      userRole = userRecord.role;
    }
  }

  const systemPlans = paymentContent?.content?.plans || {};

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      <AdminCouponsClient
        initialCoupons={couponsRes.coupons || []}
        auditLogs={logsRes.auditLogs || []}
        velocityLogs={logsRes.velocityLogs || []}
        systemPlans={systemPlans}
        userRole={userRole}
      />
    </div>
  );
}
