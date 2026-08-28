import React from 'react';
import { getAdminCoupons, getCouponSecurityLogs } from './actions';
import AdminCouponsClient from '@/components/admin/coupons/AdminCouponsClient';

export const metadata = {
  title: 'Coupon & Sponsorship Management | CenterKick Admin',
};

export default async function AdminCouponsPage() {
  const [couponsRes, logsRes] = await Promise.all([
    getAdminCoupons(),
    getCouponSecurityLogs(),
  ]);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      <AdminCouponsClient
        initialCoupons={couponsRes.coupons || []}
        auditLogs={logsRes.auditLogs || []}
        velocityLogs={logsRes.velocityLogs || []}
      />
    </div>
  );
}
