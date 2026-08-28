import React from 'react';
import { getAdminCoupons, getCouponSecurityLogs } from './actions';
import AdminCouponsClient from '@/components/admin/coupons/AdminCouponsClient';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = {
  title: 'Coupon & Sponsorship Management | CenterKick Admin',
};

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();

  const [couponsRes, logsRes, { data: paymentContent }] = await Promise.all([
    getAdminCoupons(),
    getCouponSecurityLogs(),
    supabase
      .from('site_content')
      .select('content')
      .eq('page', 'settings')
      .eq('section', 'payment')
      .single(),
  ]);

  const systemPlans = paymentContent?.content?.plans || {};

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      <AdminCouponsClient
        initialCoupons={couponsRes.coupons || []}
        auditLogs={logsRes.auditLogs || []}
        velocityLogs={logsRes.velocityLogs || []}
        systemPlans={systemPlans}
      />
    </div>
  );
}
