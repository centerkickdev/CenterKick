import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Ticket, Search, Plus, Filter, ShieldAlert, CheckCircle, RefreshCw, Mail, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Coupon & Sponsorship Hub | Admin | CenterKick',
};

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; filter?: string }>;
}) {
  const { query = '', filter = 'ALL' } = await searchParams;
  const supabase = await createClient();

  // Fetch Coupons Ledger
  let couponsQuery = supabase
    .from('coupon_codes')
    .select('*, org_sponsorship_packages(title)')
    .order('created_at', { ascending: false });

  if (query) {
    couponsQuery = couponsQuery.or(`code.ilike.%${query}%,buyer_email.ilike.%${query}%,recipient_email.ilike.%${query}%`);
  }

  if (filter !== 'ALL') {
    couponsQuery = couponsQuery.eq('status', filter);
  }

  const { data: coupons } = await couponsQuery.limit(50);

  // Fetch Velocity Logs (Anti-Brute-Force)
  const { data: velocityLogs } = await supabase
    .from('coupon_velocity_logs')
    .select('*')
    .eq('is_success', false)
    .order('created_at', { ascending: false })
    .limit(10);

  // Metrics
  const { count: totalCoupons } = await supabase.from('coupon_codes').select('*', { count: 'exact', head: true });
  const { count: totalRedeemed } = await supabase.from('coupon_codes').select('*', { count: 'exact', head: true }).eq('status', 'REDEEMED');
  const { count: totalGifts } = await supabase.from('coupon_codes').select('*', { count: 'exact', head: true }).eq('is_gift', true);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-[#b50a0a]" /> Coupon & Sponsorship Moderation Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage discount codes, gift vouchers, organization sponsorships, and anti-abuse security monitoring.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Coupons</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{totalCoupons || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-100 text-gray-700">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Redeemed</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{totalRedeemed || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gift Vouchers</p>
            <p className="text-3xl font-black text-purple-600 mt-1">{totalGifts || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Security Velocity Feed */}
      {velocityLogs && velocityLogs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-amber-900">Security Velocity Alert Feed</h3>
              <p className="text-xs text-amber-700">Recent invalid code validation attempts monitored for brute-force patterns.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {velocityLogs.map((log: any) => (
              <div key={log.id} className="bg-white p-3 rounded-xl border border-amber-200 text-xs flex justify-between items-center shadow-xs">
                <div>
                  <span className="font-mono font-bold text-gray-900">{log.attempted_code}</span>
                  <p className="text-gray-500 text-[10px]">IP: {log.ip_address}</p>
                </div>
                <span className="text-[10px] text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
                  {log.error_reason || 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Coupons Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Master Coupon Ledger</h2>
          
          <form className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Search code, email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]"
              />
            </div>
            <select
              name="filter"
              defaultValue={filter}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="REDEEMED">Redeemed</option>
              <option value="REVOKED">Revoked</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-all"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Title / Type</th>
                <th className="px-6 py-4">Tier & Duration</th>
                <th className="px-6 py-4">Buyer / Recipient</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Redemptions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons && coupons.length > 0 ? (
                coupons.map((coupon: any) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{coupon.code}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{coupon.title}</p>
                      <span className="text-[10px] text-gray-500 uppercase">{coupon.coupon_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{coupon.target_tier}</p>
                      <p className="text-[10px] text-gray-400">{coupon.duration_months} Months</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{coupon.buyer_email || coupon.buyer_name || 'N/A'}</p>
                      {coupon.recipient_email && (
                        <p className="text-[10px] text-emerald-600 font-semibold">To: {coupon.recipient_email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          coupon.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : coupon.status === 'REDEEMED'
                            ? 'bg-blue-100 text-blue-800'
                            : coupon.status === 'REVOKED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                      {coupon.redemption_count} / {coupon.max_redemptions}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No coupon codes match the selected query or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
